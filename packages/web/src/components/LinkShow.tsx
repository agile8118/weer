import React, { FC } from "react";

interface LinkShow {
  urlId?: string | null;
  realUrl: string;
  shortenedUrl: string;
  onList: boolean;
  toggleConfirmationModal: (urlId: string | null, realUrl: string) => void;
}

export default (({
  urlId = null,
  realUrl,
  shortenedUrl,
  onList,
  toggleConfirmationModal,
}: LinkShow) => {
  // Decide whether to show the link component or not
  let linkClassName = realUrl ? "link" : "link display-none";
  linkClassName = onList ? linkClassName + " link--on-list" : linkClassName;

  // If the real url was longer than 35 characters, substring it
  let displayedRealUrl = realUrl;
  if (realUrl.length > 35) displayedRealUrl = realUrl.substring(0, 35) + "...";

  // If on list show the delete button
  let deleteButton;
  if (onList) {
    deleteButton = (
      <button
        onClick={() => {
          toggleConfirmationModal(urlId, realUrl);
        }}
        className="link__delete"
      >
        <img src="/trash.svg" alt="Delete icon" />
      </button>
    );
  }

  return (
    <div>
      <div className={linkClassName}>
        <div className="link__real">{displayedRealUrl}</div>
        <div className="link__shortened">
          <a target="_blank" href={shortenedUrl}>
            {shortenedUrl}
          </a>
          <div className="text-center">
            <div className="tooltip">
              <button
                onClick={(e) => {
                  navigator.clipboard?.writeText(shortenedUrl);

                  // Represent to the user that the link was copied
                  if ((e.target as HTMLElement).tagName === "IMG") {
                    (
                      e.target as HTMLElement
                    ).parentElement!.nextSibling!.textContent = "Copied!";
                  }
                  if ((e.target as HTMLElement).tagName === "BUTTON") {
                    (e.target as HTMLElement).nextSibling!.textContent =
                      "Copied!";
                  }
                }}
                onMouseLeave={(e) => {
                  // Revert the tooltip text to the original
                  if ((e.target as HTMLElement).tagName === "IMG") {
                    (
                      e.target as HTMLElement
                    ).parentElement!.nextSibling!.textContent = "Copy";
                  }
                  if ((e.target as HTMLElement).tagName === "BUTTON") {
                    (e.target as HTMLElement).nextSibling!.textContent = "Copy";
                  }
                }}
                className="link__copy"
              >
                <img src="/copy-document.svg" alt="Copy icon" />
              </button>
              <span className="tooltip__text">Copy</span>
            </div>
            {deleteButton}
          </div>
        </div>
      </div>
    </div>
  );
}) as FC<LinkShow>;
