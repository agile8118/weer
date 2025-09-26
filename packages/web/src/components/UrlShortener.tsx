import React, { FC, useEffect, useRef, useState } from "react";
import axios from "axios";
import LinkShow from "./LinkShow";
import Loading from "./Loading";
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

  const loadingButton = useRef<HTMLButtonElement>(null);
  const shortenButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    props.onRef({ onDeleteUrl });
    return () => {
      props.onRef(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Move the focus out of the text input after form submition
    shortenButton.current?.focus();
    // Make the button as loading
    shortenButton.current?.classList.add("display-none");
    loadingButton.current?.classList.remove("display-none");

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

        // Make the button as normall
        shortenButton.current?.classList.remove("display-none");
        loadingButton.current?.classList.add("display-none");
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
  }

  function showError(msg: string) {
    setRealUrl("");
    setShortenedUrl("");
    setErrorMessage(msg);

    // Make the button normal
    shortenButton.current?.classList.remove("display-none");
    loadingButton.current?.classList.add("display-none");
  }

  function hideError() {
    setErrorMessage("");
  }

  let boxClassName = errorMessage ? "box box--error" : "box";

  return (
    <section className="section" data-testid="url-shortener">
      <h1>URL Shortener App</h1>
      <p>
        Just put your long URL in the text box below and click shorten to get a
        nice small URL!
      </p>

      <div className={boxClassName}>
        <div className="message">{errorMessage}</div>
        <form onSubmit={(event) => onFormSubmit(event)}>
          <input
            type="text"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setUrl(event.target.value);
            }}
            onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
              event.target.placeholder = "";
            }}
            onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
              event.target.placeholder = "Put your link here...";
            }}
            value={url}
            placeholder="Put your link here..."
          />
          <br />
          <button type="submit" ref={shortenButton} className="button">
            Shorten
          </button>
          <button
            type="button"
            ref={loadingButton}
            className="button display-none"
            disabled
          >
            Shortening
            <Loading />
          </button>
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
