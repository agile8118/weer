import React, { FC, useEffect, useState } from "react";

import { ConfirmModal, Loading, Modal, Button, Input } from "@weer/reusable";
import type { LinkType } from "@weer/common";
import { useAuth } from "../../AuthContext";
import { useModal } from "../../ModalContext";
import dom from "../../lib/dom";

import lib from "../../lib";
import axios from "axios";

interface LinkCustomizationProps {
  open: boolean;
  onClose: () => void;
  urlId: string | null;
  url: string; // real URL
  shortenedUrl: string; // the current shortened code
  type: LinkType;
}

const LinkCustomization: FC<LinkCustomizationProps> = (props) => {
  const { isSignedIn, username } = useAuth();
  const { openModal, closeModal } = useModal();

  const [ultraLoading, setUltraLoading] = useState<boolean>(false);

  const onUltraSelect = async () => {
    try {
      setUltraLoading(true);
      await axios.patch(`/url/${props.urlId}/type`, {
        type: "ultra",
      });
      dom.message(
        `Your link is now ${lib.simplifyUrl(
          props.shortenedUrl
        )} and is valid for 30 minutes.`,
        "success"
      );
    } catch (error: any) {
      lib.handleErr(error);
    } finally {
      closeModal();
      setUltraLoading(false);
    }
  };

  return (
    <Modal
      header="Customize Your URL"
      open={props.open}
      onClose={() => {
        props.onClose();
      }}
    >
      <div className="customization">
        <div className="customization-option customization-option--selected">
          <div className="customization-option__header">
            <div>
              <h3>6-Character Code</h3>

              <div className="customization-option__example">
                Your Current URL: <span>weer.pro/f3hc42</span>
              </div>
            </div>

            <div className="customization-option__validity">
              {/* If user is not signed in, it should be "Valid up to a year after last view" */}
              Valid permanently
            </div>
          </div>

          <div className="customization-option__body">
            <div className="customization-option__description">
              This code contains only lowercase letters and numbers. Don't worry
              about your audience typing uppercase or lowercase, we'll handle
              that for you. Great if you just want a shorten link, don't want to
              worry about your link expiring, selecting anything and even
              creating an account!
            </div>

            <div className="u-text-center">
              <div className="customization-option__message">
                Currently selected
              </div>
            </div>

            {/* <div className="u-flex-text-right">
              <Button color="blue" outlined={true} rounded={true}>
                Select
              </Button>
            </div> */}
          </div>
        </div>

        <div className="customization-option">
          <div className="customization-option__header">
            <div>
              <h3>Short Numeric Code (3-5 Digits)</h3>

              <div className="customization-option__example">
                Example: <span>weer.pro/5322</span>
              </div>
            </div>

            <div className="customization-option__validity">
              Valid for 2 hours
            </div>
          </div>

          <div className="customization-option__body">
            <div className="customization-option__description">
              Great if you quickly want to share a link with others during a
              presentation! Keep in mind that your link will be valid for{" "}
              <strong>only 2 hours</strong> and after someone else might claim
              it.
            </div>

            <div className="u-flex-text-right">
              <Button color="blue" outlined={true} rounded={true}>
                Select
              </Button>
            </div>
          </div>
        </div>

        <div className="customization-option">
          <div className="customization-option__header">
            <div className="">
              <h3>Choose Your Own with Username</h3>

              <div className="customization-option__example">
                Example:{" "}
                <span>{`weer.pro/${
                  username ? username : "your-username"
                }/anything-really`}</span>
              </div>
            </div>

            <div className="customization-option__validity">
              Valid permanently
            </div>
          </div>

          <div className="customization-option__body">
            <div className="customization-option__description">
              Great if you want a more personalized link on top of your
              username. Just type your desired custom URL below. You can choose
              whatever you want for as long as you abide by these limits:
              <ul>
                <li>
                  You final link should be understandable by browsers (so a
                  valid URL).
                </li>
                <li>You have not selected that before.</li>
              </ul>
            </div>

            <div className="customization-option__action">
              <div className="form-group">
                <Input
                  type="text"
                  id="custom-username-url-input"
                  label="Custom Code"
                />
                <strong className="customization-option__preview">
                  weer.pro/{username ? username : "your-username"}/
                </strong>
              </div>

              <div className="u-flex-text-right">
                <Button color="blue" outlined={true} rounded={true}>
                  Select
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="customization-option">
          <div className="customization-option__header">
            <div className="">
              <h3>Choose Your Own</h3>

              <div className="customization-option__example">
                Example: <span>{`weer.pro/think-of-something123`}</span>
              </div>
            </div>

            <div className="customization-option__validity">
              Valid permanently
              {/* If not logged in, valid for a month after last view. */}
            </div>
          </div>

          <div className="customization-option__body">
            <div className="customization-option__description">
              Great if you want to personalize your link. Type your desired
              custom URL below and see if it's available. You can choose
              whatever you want for as long as you abide by these limits:
              <ul>
                <li>
                  You final link should be understandable by browsers (so a
                  valid URL).
                </li>
                <li>No other user has selected that before.</li>
                <li>Must be at least 7 characters long.</li>
              </ul>
            </div>

            <div className="customization-option__action">
              <div className="form-group">
                <Input
                  type="text"
                  id="custom-username-url-input"
                  label="Custom Code"
                />
                <strong className="customization-option__preview">
                  weer.pro/
                </strong>
              </div>

              <div className="u-flex-text-right">
                <Button color="blue" outlined={true} rounded={true}>
                  Select
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* customization-option--disabled */}
        <div className="customization-option ">
          <div className="customization-option__header">
            <div>
              <h3>Ultra Short Code (1–2 Characters)</h3>

              <div className="customization-option__example">
                Examples: <span>weer.pro/6 or weer.pro/1a</span>
              </div>
            </div>

            <div className="customization-option__validity">
              Valid for 30 minutes
            </div>
          </div>

          <div className="customization-option__body">
            <div className="customization-option__description">
              Our magical shortest possible option, perfect for saying it out
              loud. Imagine you’re on a call, just say “Go to weer.pro/d, it’s
              my demo link,” and that's it. Keep in mind that your link will be{" "}
              <strong>public</strong> and valid for{" "}
              <strong>only 30 minutes</strong> and after someone else will claim
              it.
            </div>

            {/* <div className="u-text-center">
              <div className="customization-option__message">
                You must first{" "}
                <button
                  className="button-text button-text--white"
                  onClick={() => openModal("login")}
                >
                  login
                </button>{" "}
                to select this option.
              </div>
            </div> */}

            <div className="u-flex-text-right">
              <Button
                color="blue"
                outlined={true}
                rounded={true}
                onClick={onUltraSelect}
                loading={ultraLoading}
              >
                Select
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LinkCustomization;
