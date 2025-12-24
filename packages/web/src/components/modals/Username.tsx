import React, { FC, useRef } from "react";
import axios from "axios";

import { Modal, Input, Button } from "@weer/reusable";
import { useAuth } from "../../AuthContext";
import dom from "../../lib/dom";

interface UsernameProps {
  open: boolean;
  onClose: () => void;
}

const Username: FC<UsernameProps> = (props) => {
  const { isSignedIn, username } = useAuth();

  const [usernameInput, setUsernameInput] = React.useState(username || "");
  const [inputLoading, setInputLoading] = React.useState(false);
  const [inputSuccess, setInputSuccess] = React.useState<string | null>(null);
  const [inputError, setInputError] = React.useState<string | null>(null);

  // We want to delay sending a request to server to check username availability by 800ms
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkUsernameAvailability = async (value: string) => {
    if (!value || value === username) {
      setInputSuccess(null);
      setInputError(null);
      return;
    }

    setInputLoading(true);
    setInputError(null);
    setInputSuccess(null);

    try {
      const { data } = await axios.get(`/user/username-availability/${value}`);

      if (data.available) {
        setInputSuccess(`${value} is available.`);
      } else {
        setInputError(`${value} is already taken.`);
      }
    } catch (error) {
      setInputError("Failed to check availability.");
    } finally {
      setInputLoading(false);
    }
  };

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
            <Input
              success={inputSuccess}
              error={inputError}
              onChange={(value) => {
                setUsernameInput(value);

                if (timer.current) clearTimeout(timer.current);

                timer.current = setTimeout(() => {
                  checkUsernameAvailability(value);
                }, 800);
              }}
              loading={inputLoading}
              loadingText="Checking availability"
              label="Username"
              type="text"
              id="affix-name"
              required
              value={usernameInput}
            />
          </div>

          <div className="form-group u-flex-text-right">
            <Button
              type="submit"
              color="blue"
              outlined={true}
              disabled={inputSuccess && inputSuccess.length > 0 ? false : true}
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
