import React, { FC } from "react";

import { Modal, Input } from "@weer/reusable";
import { useAuth } from "../../AuthContext";

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

const AccountModal: FC<AccountModalProps> = (props) => {
  const { email } = useAuth();

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      header="Account"
      type="narrow"
    >
      <div className="account-modal">
        <div className="form-group u-margin-top-0">
          <Input
            value={email}
            disabled
            label="Email"
            placeholder="you@example.com"
            type="text"
            id="account-email"
          />
        </div>
      </div>
    </Modal>
  );
};

export default AccountModal;
