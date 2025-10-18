import React, { FC, useEffect, useState } from "react";
import axios from "axios";
import { Loading } from "@weer/reusable";
import type { LinkType } from "@weer/common";
import { useAuth } from "../AuthContext";
import { useModal } from "../ModalContext";

import LinkShow from "./LinkShow";

interface Url {
  id: string;
  real_url: string;
  shortened_url_id: string;
  link_type: LinkType;
}

interface UrlsProps {
  onRef: (ref: any | undefined) => void;
  onDeleteUrl: (id: string) => void;
}

const Urls: FC<UrlsProps> = (props) => {
  const { openModal } = useModal();

  const [loading, setLoading] = useState<boolean>(true); // for url loading
  const [urls, setUrls] = useState<Url[] | null>(null);
  const [domain, setDomain] = useState<string | null>(null);

  const { isSignedIn, username } = useAuth();

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
    setLoading(false);
  }

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
            type={url.link_type}
            onList={true}
            shortenedUrl={`${domain}/${url.shortened_url_id}`}
            onDelete={() => {
              const newUrls =
                urls?.filter((u) => {
                  if (u.id === url.id) {
                    return false;
                  }
                  return true;
                }) || [];
              setUrls(newUrls);
              props.onDeleteUrl(url.id);
            }}
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
            You are not logged in!{" "}
            <button
              className="button-text button-text-inherit"
              onClick={() => openModal("login")}
            >
              Login
            </button>{" "}
            to save your URLs and be able to better manage and customize them.
          </p>
        )}
      </section>
    </div>
  );
};

export default Urls;
