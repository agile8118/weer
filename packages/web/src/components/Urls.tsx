import React, { FC, useEffect, useState } from "react";
import axios from "axios";
import { ConfirmModal, Loading } from "@weer/reusable";
import { useAuth } from "../AuthContext";
import dom from "../lib/dom";
import LinkShow from "./LinkShow";

interface Url {
  id: string;
  real_url: string;
  shortened_url_id: string;
}

interface UrlsProps {
  onRef: (ref: any | undefined) => void;
  onDeleteUrl: (id: string) => void;
}

const Urls: FC<UrlsProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(true); // for url loading
  const [urls, setUrls] = useState<Url[] | null>(null);
  const [domain, setDomain] = useState<string | null>(null);

  const { isSignedIn } = useAuth();

  // For deleting a url
  const [selectedUrlIdForDeletion, setSelectedUrlIdForDeletion] = useState<
    string | null
  >(null);
  const [confirmationShow, setConfirmationShow] = useState<boolean>(false);
  const [confirmationLoading, setConfirmationLoading] =
    useState<boolean>(false);
  const [confirmationUrl, setConfirmationUrl] = useState<string>(""); // in confirmation modal to show a complete url

  useEffect(() => {
    props.onRef({ fetchUrls });
    fetchUrls();

    return () => {
      props.onRef(undefined);
    };
  }, []);

  async function fetchUrls() {
    setLoading(true);
    const { data } = await axios.get("/url");

    setUrls(data.urls);
    setDomain(data.domain);
    setSelectedUrlIdForDeletion(null);
    setLoading(false);
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
  const onDeleteConfirmed = async () => {
    const urlId = selectedUrlIdForDeletion;
    setConfirmationLoading(true);
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

      dom.message("URL deleted successfully.", "success");
      if (urlId) props.onDeleteUrl(urlId);
    } catch (e) {
      // show an error message to user on unexpected errors
      dom.message(
        "Sorry, an unknown error occurred, please try again later.",
        "error"
      );
      toggleConfirmationModal();
    }
    setConfirmationLoading(false);
  };

  const renderUrls = () => {
    if (loading) {
      return (
        <div className="text-center margin-top-md">
          <Loading color="dark" />
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
        <p className="text-center a-2">You haven't shortened any URLs yet.</p>
      );
    }
  };

  return (
    <div data-testid="urls">
      <section className="section section--2">
        <h2>Your Shortened URLs</h2>
        {renderUrls()}

        {/* User has url but not logged in */}
        {!loading && urls && urls.length > 0 && !isSignedIn && (
          <p className="text-center a-2">
            You are not logged in! Login to save your URLs and be able to better
            manage and customize them.
          </p>
        )}
      </section>

      {!loading && urls.length > 0 && (
        <ConfirmModal
          header="Delete The URL"
          open={confirmationShow}
          loading={confirmationLoading}
          onConfirm={onDeleteConfirmed}
          onCancel={() => {
            setConfirmationShow(false);
          }}
          btnName="Delete"
        >
          <p>
            Are you sure that you want to delete this URL and its shortened URL?
            You cannot undo this.
            <br />
            <strong className="a-4">{confirmationUrl}</strong>
          </p>
        </ConfirmModal>
      )}
    </div>
  );
};

export default Urls;
