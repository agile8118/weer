import React, { FC, useEffect, useState } from "react";
import axios from "axios";
import { Button, Input } from "@weer/reusable";
import LinkShow from "./LinkShow";
import lib from "../lib";

interface UrlShortenerProps {
  onRef: (ref: any | undefined) => void;
  onNewUrl: () => void;
}

const UrlShortener: FC<UrlShortenerProps> = (props) => {
  const [url, setUrl] = useState<string>("");
  const [urlId, setUrlId] = useState<string>("");
  const [realUrl, setRealUrl] = useState<string>("");
  const [shortenedUrl, setShortenedUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false); // for URL shorten form button

  useEffect(() => {
    props.onRef({ onDeleteUrl });
    return () => {
      props.onRef(undefined);
    };
  }, []);

  // Check to see if a deleted url is shown in this component
  function onDeleteUrl(id: string) {
    if (urlId === id) {
      // remove the url from the dom
      setRealUrl("");
      setShortenedUrl("");
      setUrlId("");
    }
  }

  async function onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    let newUrl = url;
    if (!newUrl.match(/^[a-zA-Z]+:\/\//)) {
      newUrl = "http://" + newUrl;
    }

    if (lib.validURL(newUrl)) {
      try {
        const { data } = await axios.post("/url", { url: newUrl });

        // Hide the error
        hideError();

        setUrl("");
        setRealUrl(data.realURL);
        setUrlId(data.URLId);
        setShortenedUrl(data.shortenedURL);

        props.onNewUrl();
      } catch (e: any) {
        // Show relevant errors to user on server errors
        if (e.response && e.response.status === 400) {
          showError(e.response.data);
        }

        if (e.response && e.response.status === 500) {
          showError("Sorry an unexpected error happened please try again.");
        }
      }
    } else if (url.length > 0) {
      // Show an error to user if the url is not valid
      showError("The URL you put is not valid.");
    } else {
      // Show an error to user if no url has been provided
      showError("Please first put your URL here.");
    }

    setLoading(false);
  }

  function showError(msg: string) {
    setRealUrl("");
    setShortenedUrl("");
    setErrorMessage(msg);
  }

  function hideError() {
    setErrorMessage("");
  }

  // let boxClassName = errorMessage ? "box box--error" : "box";

  return (
    <section className="section" data-testid="url-shortener">
      <div className="main-heading">
        <h1 className="heading-primary">Shorten a URL</h1>
        <span className="main-heading__span">Like a professional!</span>
      </div>

      <div className="box">
        {/* <div className="message">{errorMessage}</div> */}
        <form
          onSubmit={(event) => onFormSubmit(event)}
          className="url-input u-flex-text-center"
        >
          <Input
            placeholder="Put your link here..."
            value={url}
            onChange={(value) => setUrl(value)}
            error={errorMessage}
            help="Just put your long URL in the text box below and click shorten to get a nice small URL along with a QR Code. You will be able to customize it after."
          />

          <Button
            type="submit"
            loading={loading}
            color="blue"
            size="big"
            loadingText="Shortening"
          >
            Shorten
          </Button>
        </form>
      </div>

      <LinkShow realUrl={realUrl} shortenedUrl={shortenedUrl} />

      <p className="a-1">
        By clicking Shorten, you agree to our <a href="#">Privacy Policy</a> and{" "}
        <a href="#">Terms of Use</a>.
      </p>
    </section>
  );
};

export default UrlShortener;
