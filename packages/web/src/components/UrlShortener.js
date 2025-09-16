import React, { Component } from "react";
import axios from "axios";
import LinkShow from "./LinkShow";
import Loading from "./Loading";
import lib from "../lib";

class UrlShortener extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: "",
      urlId: "",
      realUrl: "",
      shortenedUrl: "",
      errorMessage: "",
    };

    this.loadingButton = React.createRef();
    this.shortenButton = React.createRef();
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  // Check to see if a deleted url is shown in this component
  onDeleteUrl(id) {
    if (this.state.urlId === id) {
      // remove the url from the dom
      this.setState({ realUrl: "", shortenedUrl: "", urlId: "" });
    }
  }

  async onFormSubmit(event) {
    event.preventDefault();
    // Move the focus out of the text input after form submition
    this.shortenButton.current.focus();
    // Make the button as loading
    this.shortenButton.current.classList.add("display-none");
    this.loadingButton.current.classList.remove("display-none");

    let url = this.state.url;
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = "http://" + url;
    }

    if (lib.validURL(url)) {
      try {
        const { data } = await axios.post("/url", { url });

        // Hide the error
        this.hideError();

        this.setState({
          url: "",
          realUrl: data.realURL,
          urlId: data.URLId,
          shortenedUrl: data.shortenedURL,
        });

        // Make the button as normall
        this.shortenButton.current.classList.remove("display-none");
        this.loadingButton.current.classList.add("display-none");
        this.props.onNewUrl();
      } catch ({ response }) {
        // Show relevent errors to user on server errors
        if (response.status === 400) {
          this.showError(response.data);
        }

        if (response.status === 500) {
          this.showError(
            "Sorry an unexpected error happened please try again."
          );
        }
      }
    } else if (this.state.url.length > 0) {
      // Show an error to user if the url is not valid
      this.showError("The URL you put is not valid.");
    } else {
      // Show an error to user if no url has been provided
      this.showError("Please first put your URL here.");
    }
  }

  showError(msg) {
    this.setState({ realUrl: "", shortenedUrl: "", errorMessage: msg });

    // Make the button as normall
    this.shortenButton.current.classList.remove("display-none");
    this.loadingButton.current.classList.add("display-none");
  }

  hideError() {
    this.setState({ errorMessage: "" });
  }

  render() {
    let boxClassName = this.state.errorMessage ? "box box--error" : "box";

    return (
      <section className="section">
        <h1>URL Shortener App</h1>
        <p>
          Just put your long URL in the text box below and click shorten to get
          a nice small URL!
        </p>

        <div className={boxClassName}>
          <div className="message">{this.state.errorMessage}</div>
          <form onSubmit={(event) => this.onFormSubmit(event)}>
            <input
              type="text"
              onChange={(event) => {
                this.setState({ url: event.target.value });
              }}
              onFocus={(event) => {
                event.target.placeholder = "";
              }}
              onBlur={(event) => {
                event.target.placeholder = "Put your link here...";
              }}
              value={this.state.url}
              placeholder="Put your link here..."
            />
            <br />
            <button type="submit" ref={this.shortenButton} className="button">
              Shorten
            </button>
            <button
              type="button"
              ref={this.loadingButton}
              className="button display-none"
              disabled
            >
              Shortening
              <Loading />
            </button>
          </form>
        </div>

        <LinkShow
          realUrl={this.state.realUrl}
          shortenedUrl={this.state.shortenedUrl}
        />

        <p className="a-1">
          By clicking Shorten, you agree to our <a href="#">Privacy Policy</a>{" "}
          and <a href="#">Terms of Use</a>.
        </p>
      </section>
    );
  }
}

export default UrlShortener;
