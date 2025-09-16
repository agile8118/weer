import React from "react";

export default ({
  urlId = null,
  realUrl,
  shortenedUrl,
  onList,
  toggleConfirmationModal
}) => {
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
                onClick={e => {
                  Clipboard.copy(shortenedUrl);

                  // Represent to the user that the link was copied
                  if (e.target.tagName === "IMG") {
                    // if image tag got clicked
                    e.target.parentElement.nextSibling.innerHTML = "Copied!";
                  }
                  if (e.target.tagName === "BUTTON") {
                    // if the button got clicked
                    e.target.nextSibling.innerHTML = "Copied!";
                  }
                }}
                onMouseLeave={e => {
                  // Revert the tooltip text to the original
                  if (e.target.tagName === "IMG") {
                    // if image tag got clicked
                    e.target.parentElement.nextSibling.innerHTML = "Copy";
                  }
                  if (e.target.tagName === "BUTTON") {
                    // if the button got clicked
                    e.target.nextSibling.innerHTML = "Copy";
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
};
