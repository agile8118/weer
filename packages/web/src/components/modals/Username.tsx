import React, { FC } from "react";

import { Modal, Input, Button } from "@weer/reusable";
import { useAuth } from "../../AuthContext";
import dom from "../../lib/dom";

interface UsernameProps {
  open: boolean;
  onClose: () => void;
}

const Username: FC<UsernameProps> = (props) => {
  const { isSignedIn, username } = useAuth();

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      header={username ? "Your Username" : "Choose a Username"}
      type="narrow"
    >
      <div className="">
        <form action="">
          <div className="form-group">
            <Input label="Username" type="text" id="affix-name" required />
          </div>

          <div className="form-group u-flex-text-right">
            <Button
              type="submit"
              color="blue"
              outlined={true}
              block={true}
              onClick={() => {}}
            >
              {username ? "Update" : "Confirm"}
            </Button>
          </div>
        </form>

        {/* <div className="auth-or">Old Usernames:</div> */}
      </div>
    </Modal>
  );
};

export default Username;
