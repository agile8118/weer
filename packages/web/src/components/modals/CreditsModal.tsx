import React, { FC } from "react";

import { Modal } from "@weer/reusable";
import { useAuth } from "../../AuthContext";

interface CreditsModalProps {
  open: boolean;
  onClose: () => void;
}

const CreditsModal: FC<CreditsModalProps> = (props) => {
  const { linkCredits } = useAuth();

  return (
    <Modal open={props.open} onClose={props.onClose} header="Credits" type="narrow">
      <div className="account-credits">
        <div className="account-credits__header">
          <span className="account-credits__title">Credits Remaining</span>
          <div className="tooltip tooltip-left">
            <i className="fa-regular fa-circle-question"></i>
            <div className="tooltip__text">
              Credits are used whenever you shorten a link or edit it.
              Running low? Contact support to increase your limit for free.
            </div>
          </div>
        </div>
        <div className="account-credits__count">{linkCredits}</div>
      </div>
    </Modal>
  );
};

export default CreditsModal;
