import React, { Component } from "react";
import axios from "axios";
import dom from "../lib/dom";
import LinkShow from "./LinkShow";
import ConfirmationModal from "./ConfirmationModal";
import Loading from "./Loading";

class Urls extends Component {
  constructor(props) {
    super(props);
    this.state = { urls: null, domain: null };
    // the element in confirmation modal to show a complete url
    this.confirmationDisplayedUrl = React.createRef();
  }

  componentDidMount() {
    this.props.onRef(this);
    this.fetchUrls();
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  async fetchUrls() {
    const { data } = await axios.get("/url");

    this.setState({
      urls: data.urls,
      domain: data.domain,
      selectedUrlIdForDeletion: null,
      confirmationShow: false
    });
  }

  // Open/Close the confirmation modal for deleting a url
  toggleConfirmationModal = (urlId = null, realUrl) => {
    if (urlId) {
      this.setState({
        selectedUrlIdForDeletion: urlId,
        confirmationShow: true
      });
      this.confirmationDisplayedUrl.current.innerHTML = realUrl;
    } else {
      this.setState({
        confirmationShow: false
      });
    }
  };

  // Send the delete request to the server
  onDeleteConfirmed = async callback => {
    const urlId = this.state.selectedUrlIdForDeletion;
    try {
      await axios.delete("/url/" + urlId);
      const newUrls = this.state.urls.filter(url => {
        if (url.id === urlId) {
          return false;
        }
        return true;
      });
      this.setState({ urls: newUrls, selectedUrlIdForDeletion: null });
      this.toggleConfirmationModal();
      callback();
      dom.message("URL deleted successfully.", "success");
      this.props.onDeleteUrl(urlId);
    } catch ({ response }) {
      // show an error message to user on unexpected errors
      dom.message(
        "Sorry, an unkown error occured, please try again later.",
        "error"
      );
      this.toggleConfirmationModal();
      callback();
    }
  };

  renderUrls() {
    // Data has not came from database yet
    if (!this.state.urls) {
      return (
        <div className="text-center margin-top-md">
          <Loading />
        </div>
      );
    }

    // User has urls
    if (this.state.urls.length > 0) {
      return this.state.urls.map(url => {
        return (
          <LinkShow
            key={url.id}
            urlId={url.id}
            realUrl={url.real_url}
            onList={true}
            shortenedUrl={`${this.state.domain}/${url.shortened_url_id}`}
            toggleConfirmationModal={this.toggleConfirmationModal}
          />
        );
      });
    }

    // User has no url
    if (this.state.urls.length === 0) {
      return (
        <p className="text-center a-3">
          No URL yet. Try one by putting a URL in the input above.
        </p>
      );
    }
  }

  render() {
    return (
      <div>
        <section className="section section--2">
          <h2>URLs you have shortened with this account</h2>
          {this.renderUrls()}
        </section>
        <p className="a-2">
          Signed in as {this.props.email}. <a href="/logout">Singout.</a>
        </p>
        <ConfirmationModal
          show={this.state.confirmationShow}
          headerText="Delete The URL"
          onConfirmed={this.onDeleteConfirmed}
          onClosed={() => {
            this.setState({ confirmationShow: false });
          }}
        >
          <p>
            Are you sure that you want to delete this URL and its shortened URL?
            You cannot undo this.
            <br />
            <strong ref={this.confirmationDisplayedUrl}></strong>
          </p>
        </ConfirmationModal>
      </div>
    );
  }
}

export default Urls;
