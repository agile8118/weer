import React, { FC, useEffect, useState, useMemo } from "react";

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
  onChangeType: (
    newType: LinkType,
    newExpiresAt?: string,
    newCode?: string
  ) => void;
  url: string; // real URL
  shortenedUrl: string; // the current shortened code (full URL)
  shortenedUrlCode: string; // the current shortened code only
  type: LinkType;
  expired: boolean;
}

const LinkCustomization: FC<LinkCustomizationProps> = (props) => {
  const { isSignedIn, username } = useAuth();
  const { openModal, closeModal } = useModal();

  const [affixCode, setAffixCode] = useState<string>("");
  const [customCode, setCustomCode] = useState<string>("");
  const [ultraLoading, setUltraLoading] = useState<boolean>(false);
  const [classicLoading, setClassicLoading] = useState<boolean>(false);
  const [digitLoading, setDigitLoading] = useState<boolean>(false);

  const onUltraSelect = async () => {
    try {
      setUltraLoading(true);
      const { data }: any = await axios.patch(`/url/${props.urlId}/type`, {
        type: "ultra",
      });

      props.onChangeType("ultra", data.expiresAt, data.code);
    } catch (error: any) {
      lib.handleErr(error);
    } finally {
      closeModal();
      setUltraLoading(false);
    }
  };

  const onClassicSelect = async () => {
    try {
      setClassicLoading(true);
      const { data }: any = await axios.patch(`/url/${props.urlId}/type`, {
        type: "classic",
      });

      props.onChangeType("classic", null, data.code);
    } catch (error: any) {
      lib.handleErr(error);
    } finally {
      closeModal();
      setClassicLoading(false);
    }
  };

  const onDigitSelect = async () => {
    try {
      setDigitLoading(true);
      const { data }: any = await axios.patch(`/url/${props.urlId}/type`, {
        type: "digit",
      });

      props.onChangeType("digit", data.expiresAt, data.code);
    } catch (error: any) {
      lib.handleErr(error);
    } finally {
      closeModal();
      setDigitLoading(false);
    }
  };

  const LoginReminder = () => {
    if (isSignedIn) return null;
    return (
      <>
        If you{" "}
        <button
          className="button-text button-text-blue"
          onClick={() => openModal("login")}
        >
          login
        </button>
        , your shortened link will never expire!
      </>
    );
  };

  const options = [
    {
      name: "ultra",
      disabled: !isSignedIn,
      render: (isSelected: boolean) => (
        <div
          key="ultra"
          className={`customization-option ${
            isSelected
              ? "customization-option--selected"
              : `${!isSignedIn && "customization-option--disabled"}`
          }`}
        >
          <div className="customization-option__header">
            <div>
              <h3>Ultra Short Code (1–2 Characters)</h3>
              <div className="customization-option__example">
                {isSelected ? "Your Current URL: " : "Examples: "}
                {props.expired ? (
                  "Expired"
                ) : (
                  <span>
                    {isSelected
                      ? `weer.pro/${props.shortenedUrlCode}`
                      : "weer.pro/6 or weer.pro/1a"}
                  </span>
                )}
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
            {!isSignedIn && (
              <div className="u-text-center">
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
              </div>
            )}

            {/* No regeneration button if ultra link is currently active */}

            {props.expired && isSignedIn && (
              <div className="customization-option__regenerate">
                <Button
                  color="blue"
                  size="small"
                  outlined={false}
                  rounded={true}
                  onClick={onUltraSelect}
                  loading={ultraLoading}
                >
                  Regenerate Code
                </Button>
              </div>
            )}

            {!isSelected && isSignedIn && (
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
            )}
          </div>
        </div>
      ),
    },
    {
      name: "classic",
      render: (isSelected: boolean) => (
        <div
          key="classic"
          className={`customization-option ${
            isSelected ? "customization-option--selected" : ""
          }`}
        >
          <div className="customization-option__header">
            <div>
              <h3>6-Character Code</h3>
              <div className="customization-option__example">
                {isSelected ? "Your Current URL: " : "Example: "}
                <span>
                  weer.pro/{isSelected ? props.shortenedUrlCode : "f3hc42"}
                </span>
              </div>
            </div>
            <div className="customization-option__validity">
              {isSignedIn
                ? "Valid permanently"
                : "Valid for 1 year after last view"}
            </div>
          </div>
          <div className="customization-option__body">
            <div className="customization-option__description">
              This code contains only lowercase letters and numbers. Don't worry
              about your audience typing uppercase or lowercase, we'll handle
              that for you. Great if you just want a shorten link, don't want to
              worry about your link expiring, selecting anything and even
              creating an account! <br />
              {LoginReminder()}
            </div>
            {isSelected && (
              <div className="customization-option__regenerate">
                <Button
                  size="small"
                  color="blue"
                  outlined={false}
                  rounded={true}
                  onClick={onClassicSelect}
                  loading={classicLoading}
                >
                  Regenerate Code
                </Button>
              </div>
            )}

            {!isSelected && (
              <div className="u-flex-text-right">
                <Button
                  color="blue"
                  outlined={true}
                  rounded={true}
                  onClick={onClassicSelect}
                  loading={classicLoading}
                >
                  Select
                </Button>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      name: "digit",
      render: (isSelected: boolean) => (
        <div
          key="digit"
          className={`customization-option ${
            isSelected ? "customization-option--selected" : ""
          }`}
        >
          <div className="customization-option__header">
            <div>
              <h3>Short Numeric Code (3-5 Digits)</h3>
              <div className="customization-option__example">
                {isSelected ? "Your Current URL: " : "Example: "}
                {props.expired ? (
                  "Expired"
                ) : (
                  <span>
                    weer.pro/{isSelected ? props.shortenedUrlCode : "5322"}
                  </span>
                )}
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

            {!isSelected && (
              <div className="u-flex-text-right">
                <Button
                  color="blue"
                  outlined={true}
                  rounded={true}
                  onClick={onDigitSelect}
                  loading={digitLoading}
                >
                  Select
                </Button>
              </div>
            )}

            {isSelected && (
              <div className="customization-option__regenerate">
                <Button
                  color="blue"
                  size="small"
                  outlined={false}
                  rounded={true}
                  onClick={onDigitSelect}
                  loading={digitLoading}
                >
                  Regenerate Code
                </Button>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      name: "affix",
      disabled: !username,
      render: (isSelected: boolean) => (
        <div
          key="affix"
          className={`customization-option ${
            isSelected
              ? "customization-option--selected"
              : `${!username && "customization-option--disabled"}`
          }`}
        >
          <div className="customization-option__header">
            <div>
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
            {isSelected ? (
              <div className="u-text-center">
                <div className="customization-option__message">
                  Currently selected
                </div>
              </div>
            ) : (
              <div className="customization-option__action">
                <div className="form-group">
                  <Input
                    value={affixCode}
                    onChange={(value) => {
                      setAffixCode(value);
                    }}
                    type="text"
                    disabled={!username}
                    id="affix-url-input"
                    label="Custom Code"
                  />
                  <strong className="customization-option__preview">
                    weer.pro/{username ? username : "your-username"}/{affixCode}
                  </strong>
                </div>
                {!!username && (
                  <div className="u-flex-text-right">
                    <Button
                      color="blue"
                      outlined={true}
                      rounded={true}
                      disabled={!username}
                    >
                      Select
                    </Button>
                  </div>
                )}
              </div>
            )}

            {!username && (
              <div className="u-text-center">
                <div className="customization-option__message">
                  You must first{" "}
                  <button
                    className="button-text button-text--white"
                    onClick={() => openModal("username")}
                  >
                    choose a username
                  </button>{" "}
                  to select this option.
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      name: "custom",
      render: (isSelected: boolean) => (
        <div
          key="custom"
          className={`customization-option ${
            isSelected ? "customization-option--selected" : ""
          }`}
        >
          <div className="customization-option__header">
            <div>
              <h3>Choose Your Own</h3>
              <div className="customization-option__example">
                Example: <span>weer.pro/think-of-something123</span>
              </div>
            </div>
            <div className="customization-option__validity">
              {isSignedIn
                ? "Valid permanently"
                : "Valid for a month after last view"}
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
              {LoginReminder()}
            </div>
            {isSelected ? (
              <div className="u-text-center">
                <div className="customization-option__message">
                  Currently selected
                </div>
              </div>
            ) : (
              <div className="customization-option__action">
                <div className="form-group">
                  <Input
                    value={customCode}
                    onChange={(value) => {
                      setCustomCode(value);
                    }}
                    type="text"
                    id="custom-url-input"
                    label="Custom Code"
                  />
                  <strong className="customization-option__preview">
                    weer.pro/{customCode}
                  </strong>
                </div>
                <div className="u-flex-text-right">
                  <Button color="blue" outlined={true} rounded={true}>
                    Select
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  // Sort options. Selected type goes to top, disabled go to the bottom
  const { selectedOption, otherOptions } = useMemo(() => {
    // the selected option
    const selected = options.find((opt) => opt.name === props.type);

    const others = options
      .filter((opt) => opt.name !== props.type)
      .sort((a, b) => {
        // Disabled options go to the bottom
        if (a.disabled && !b.disabled) return 1;
        if (!a.disabled && b.disabled) return -1;
        return 0;
      });

    return { selectedOption: selected, otherOptions: others };
  }, [
    props.type,
    props.shortenedUrlCode,
    ultraLoading,
    digitLoading,
    username,
    isSignedIn,
    affixCode,
    customCode,
  ]);

  return (
    <Modal
      header="Customize Your Shortened URL"
      open={props.open}
      onClose={() => {
        props.onClose();
      }}
    >
      <div className="customization">
        <h2 className="customization__header">Currently Selected:</h2>

        {selectedOption.render(true)}

        {otherOptions.length > 0 && (
          <>
            <h2 className="customization__header">Select a new link type:</h2>
            {otherOptions.map((option) => option.render(false))}
          </>
        )}
      </div>
    </Modal>
  );
};

export default LinkCustomization;
