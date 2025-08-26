import React, { Component } from "react";
import axios from "axios";
import UrlShortener from "./UrlShortener";
import SignInBox from "./SignInBox";
import Urls from "./Urls";

class App extends Component {
  state = { isSignedIn: null, email: "" };

  async componentDidMount() {
    const { data } = await axios.post("/auth");
    this.setState({ isSignedIn: data.isSignedIn, email: data.email });
  }

  renderBottomBox() {
    if (this.state.isSignedIn) {
      return (
        <Urls
          email={this.state.email}
          onRef={ref => (this.urls = ref)}
          onDeleteUrl={id => {
            // notify the UrlShortener component that a url has been deleted
            this.urlShortener.onDeleteUrl(id);
          }}
        />
      );
    } else if (this.state.isSignedIn === false) {
      return <SignInBox />;
    } else {
      return <div />;
    }
  }

  render() {
    return (
      <div>
        <UrlShortener
          onRef={ref => (this.urlShortener = ref)}
          onNewUrl={() => {
            // Call a method on the child component (Urls)
            if (this.urls) this.urls.fetchUrls();
          }}
        />
        {this.renderBottomBox()}
      </div>
    );
  }
}

export default App;
