import React, { FC, useState, useEffect } from "react";
import { ButtonIcon } from "@weer/reusable";
import { useModal } from "../ModalContext";
import type { LinkType } from "@weer/common";
import lib from "../lib";

interface LinkShow {
  urlId?: string | null;
  realUrl: string;
  shortenedUrl: string;
  type: LinkType;
  expiresAt?: string | null;
  onList: boolean;
  onDelete?: (id: string) => void; // when the link is deleted
}

export default (({
  urlId = null,
  realUrl,
  expiresAt,
  shortenedUrl,
  onList,
  type,
  onDelete,
}: LinkShow) => {
  const [copyTooltipText, setCopyTooltipText] = useState<string>("Copy");
  const { openModal } = useModal();

  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (type === "ultra") {
      if (!expiresAt) return setTimeLeft("expired");
      const expiresAtDate = new Date(expiresAt || "");

      const update = () => {
        const diff = expiresAtDate.getTime() - Date.now();
        if (diff <= 0) {
          setTimeLeft("expired");
        } else {
          const m = Math.floor(diff / 1000 / 60);
          const s = Math.floor((diff / 1000) % 60);
          setTimeLeft(`${m}m ${s}s`);
        }
      };

      update();
      const timer = setInterval(update, 1000);
      return () => clearInterval(timer);
    }
  }, [type]);

  // Decide whether to show the link component or not
  let linkClassName = realUrl ? "link" : "link display-none";
  linkClassName = onList ? linkClassName + " link--on-list" : linkClassName;

  // If on list show the delete button
  let deleteButton;

  if (onList) {
    deleteButton = (
      <div className="link__delete">
        <ButtonIcon
          color="red"
          icon="fa-solid fa-trash-can"
          tooltipText="Delete Link"
          onClick={() => {
            openModal("confirmDelete", { urlId, realUrl, onSuccess: onDelete });
          }}
        />
      </div>
    );
  }

  return (
    <div className={linkClassName}>
      <div className="link__real">
        <div className="tooltip tooltip-top">
          {lib.cutString(realUrl, 35)}
          <div className="tooltip__text">{realUrl}</div>
        </div>
      </div>
      {/* <div className="link__code-actions"> */}

      <div className="link__shortened-link">
        {timeLeft === "expired" ? (
          <span className="link__shortened-link--expired">
            Short link expired.
          </span>
        ) : (
          <a target="_blank" href={shortenedUrl} className="button-text">
            {lib.simplifyUrl(shortenedUrl)}
          </a>
        )}
      </div>
      <div className="link__actions">
        <div
          className={`link__copy ${
            timeLeft === "expired" ? "link__copy--disabled" : ""
          }`}
        >
          <ButtonIcon
            color="default"
            icon="fa-solid fa-copy"
            disabled={timeLeft === "expired" ? true : false}
            tooltipText={copyTooltipText}
            disabledTooltipText="Link has expired and cannot be copied."
            onClick={() => {
              navigator.clipboard?.writeText(shortenedUrl);
              setCopyTooltipText("Copied!");
            }}
            onMouseLeave={() => {
              setCopyTooltipText("Copy");
            }}
          />
        </div>

        <div className="link__views">
          <ButtonIcon
            color="default"
            icon="fa-solid fa-chart-simple"
            tooltipText="View Stats"
            onClick={() => {}}
            onMouseLeave={() => {}}
          />
        </div>

        <div className="link__qrcode">
          <ButtonIcon
            color="default"
            icon="fa-solid fa-qrcode"
            tooltipText="Get a QR Code"
            onClick={() => {
              openModal("qrCode", { urlId });
            }}
            onMouseLeave={() => {}}
          />
        </div>

        <div className="link__edit">
          <ButtonIcon
            color="default"
            icon="fa-solid fa-pen-to-square"
            tooltipText="Edit Link"
            onClick={() => {}}
            onMouseLeave={() => {}}
          />
        </div>

        <div className="link__customize">
          <ButtonIcon
            color="blue"
            icon="fa-solid fa-gear"
            tooltipText="Customize Your Link"
            onClick={() => {
              openModal("customizeLink", {
                urlId,
                realUrl,
                shortenedUrl,
                type,
              });
            }}
            onMouseLeave={() => {}}
          />
        </div>

        {deleteButton}
      </div>

      {type === "ultra" && (
        <div
          className={`link__message link__message--${
            timeLeft === "expired" ? "red" : "green"
          }`}
        >
          <span>
            {timeLeft === "expired" ? (
              <>
                Link expired. Get a new link by going to the{" "}
                <button
                  onClick={() => {
                    openModal("customizeLink", {
                      urlId,
                      realUrl,
                      shortenedUrl,
                      type,
                    });
                  }}
                  className="button-text button-text-inherit"
                >
                  customization panel
                </button>
                .
              </>
            ) : (
              <>Valid for {timeLeft}</>
            )}
          </span>
        </div>
      )}
    </div>
  );
}) as FC<LinkShow>;
