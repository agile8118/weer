import React, { FC, useState } from "react";
import { ButtonIcon } from "@weer/reusable";

interface LinkShow {
  urlId?: string | null;
  realUrl: string;
  shortenedUrl: string;
  onList: boolean;
  toggleConfirmationModal: (urlId: string | null, realUrl: string) => void;
  toggleCustomizationModal: (urlId: string | null) => void;
  toggleQRCodeModal: (urlId: string | null) => void;
}

export default (({
  urlId = null,
  realUrl,
  shortenedUrl,
  onList,
  toggleConfirmationModal,
  toggleCustomizationModal,
  toggleQRCodeModal,
}: LinkShow) => {
  const [copyTooltipText, setCopyTooltipText] = useState<string>("Copy");

  // Decide whether to show the link component or not
  let linkClassName = realUrl ? "link" : "link display-none";
  linkClassName = onList ? linkClassName + " link--on-list" : linkClassName;

  // If the real url was longer than 35 characters, substring it
  let displayedRealUrl = realUrl;
  if (realUrl.length > 30) displayedRealUrl = realUrl.substring(0, 30) + "...";

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
            toggleConfirmationModal(urlId, realUrl);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className={linkClassName}>
        <div className="link__real">
          <div className="tooltip">
            {displayedRealUrl}
            <div className="tooltip__text">{realUrl}</div>
          </div>
        </div>
        <div className="link__shortened">
          <a target="_blank" href={shortenedUrl}>
            {shortenedUrl}
          </a>
          <div className="link__copy">
            <ButtonIcon
              color="default"
              icon="fa-solid fa-copy"
              tooltipText={copyTooltipText}
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
                toggleQRCodeModal(urlId);
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
                toggleCustomizationModal(urlId);
              }}
              onMouseLeave={() => {}}
            />
          </div>

          {deleteButton}
        </div>
      </div>
    </div>
  );
}) as FC<LinkShow>;
