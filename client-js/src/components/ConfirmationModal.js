import React from "react";
import Loading from "./Loading";

export default props => {
  // Decode whether or not to show the modal
  let modalClassName = props.show
    ? "confirmation-modal-container"
    : "confirmation-modal-container display-none";

  return (
    <div className={modalClassName}>
      <div className="confirmation-modal">
        <div className="confirmation-modal__header">
          <h3>{props.headerText}</h3>
          <button
            className="confirmation-modal__close-button"
            onClick={() => {
              props.onClosed();
            }}
          >
            &times;
          </button>
        </div>
        <div className="confirmation-modal__content">{props.children}</div>
        <div className="confirmation-modal__actions">
          <button className="display-none" disabled>
            Deleting <Loading />
          </button>
          <button
            onClick={e => {
              const loadingButton = e.target.previousSibling;
              const normalButton = e.target;
              // Make as the button as loading
              loadingButton.classList.remove("display-none");
              normalButton.classList.add("display-none");
              // Call the function in parent
              props.onConfirmed(() => {
                // Once done, get the button back to normal state
                loadingButton.classList.add("display-none");
                normalButton.classList.remove("display-none");
              });
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
