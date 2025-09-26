import React, { FC, ReactNode } from "react";
import Loading from "./Loading";

interface ConfirmationModalProps {
  show: boolean;
  headerText: string;
  onClosed: () => void;
  onConfirmed: (done: () => void) => void;
  children?: ReactNode;
}

const ConfirmationModal: FC<ConfirmationModalProps> = (props) => {
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
            onClick={(e) => {
              const loadingButton = (e.target as HTMLElement)
                .previousSibling as HTMLElement;
              const normalButton = e.target as HTMLElement;
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

export default ConfirmationModal;
