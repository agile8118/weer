import React, { FC, useEffect, useState, useRef } from "react";
import axios from "axios";
import dom from "../lib/dom";
import LinkShow from "./LinkShow";
import ConfirmationModal from "./ConfirmationModal";
import Loading from "./Loading";

interface Url {
  id: string;
  real_url: string;
  shortened_url_id: string;
}

interface UrlsProps {
  email: string;
  onRef: (ref: any | undefined) => void;
  onDeleteUrl: (id: string) => void;
}

const Urls: FC<UrlsProps> = (props) => {
  const [urls, setUrls] = useState<Url[] | null>(null);
  const [domain, setDomain] = useState<string | null>(null);
  const [selectedUrlIdForDeletion, setSelectedUrlIdForDeletion] = useState<
    string | null
  >(null);
  const [confirmationShow, setConfirmationShow] = useState<boolean>(false);

  // in confirmation modal to show a complete url
  const [confirmationUrl, setConfirmationUrl] = useState<string>("");

  useEffect(() => {
    props.onRef({ fetchUrls });
    fetchUrls();

    return () => {
      props.onRef(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchUrls() {
    const { data } = await axios.get("/url");

    setUrls(data.urls);
    setDomain(data.domain);
    setSelectedUrlIdForDeletion(null);
    setConfirmationShow(false);
  }

  // Open/Close the confirmation modal for deleting a url
  const toggleConfirmationModal = (
    urlId: string | null = null,
    realUrl?: string
  ) => {
    if (urlId && realUrl) {
      setSelectedUrlIdForDeletion(urlId);
      setConfirmationShow(true);
      setConfirmationUrl(realUrl);
    } else {
      setConfirmationShow(false);
    }
  };

  // Send the delete request to the server
  const onDeleteConfirmed = async (callback: () => void) => {
    const urlId = selectedUrlIdForDeletion;
    try {
      await axios.delete("/url/" + urlId);
      const newUrls =
        urls?.filter((url) => {
          if (url.id === urlId) {
            return false;
          }
          return true;
        }) || [];
      setUrls(newUrls);
      setSelectedUrlIdForDeletion(null);
      toggleConfirmationModal();
      callback();
      dom.message("URL deleted successfully.", "success");
      if (urlId) props.onDeleteUrl(urlId);
    } catch (e) {
      // show an error message to user on unexpected errors
      dom.message(
        "Sorry, an unknown error occurred, please try again later.",
        "error"
      );
      toggleConfirmationModal();
      callback();
    }
  };

  const renderUrls = () => {
    // Data has not came from database yet
    if (!urls) {
      return (
        <div className="text-center margin-top-md">
          <Loading />
        </div>
      );
    }

    // User has urls
    if (urls.length > 0) {
      return urls.map((url) => {
        return (
          <LinkShow
            key={url.id}
            urlId={url.id}
            realUrl={url.real_url}
            onList={true}
            shortenedUrl={`${domain}/${url.shortened_url_id}`}
            toggleConfirmationModal={toggleConfirmationModal}
          />
        );
      });
    }

    // User has no url
    if (urls.length === 0) {
      return (
        <p className="text-center a-3">
          No URL yet. Try one by putting a URL in the input above.
        </p>
      );
    }
  };

  return (
    <div data-testid="urls">
      <section className="section section--2">
        <h2>Your Shortened URLs</h2>
        {renderUrls()}
      </section>
      <p className="a-2">
        Signed in as {props.email}. <a href="/logout">Sign out.</a>
      </p>
      <ConfirmationModal
        show={confirmationShow}
        headerText="Delete The URL"
        onConfirmed={onDeleteConfirmed}
        onClosed={() => {
          setConfirmationShow(false);
        }}
      >
        <p>
          Are you sure that you want to delete this URL and its shortened URL?
          You cannot undo this.
          <br />
          <strong>{confirmationUrl}</strong>
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default Urls;
