import React, { FC, useRef } from "react";
import axios from "axios";

import { Modal, Input, Button } from "@weer/reusable";
import { useAuth } from "../../AuthContext";
import { useModal } from "../../ModalContext";
import dom from "../../lib/dom";
import lib from "../../lib";

interface UsernameProps {
  open: boolean;
  onClose: () => void;
}

const Username: FC<UsernameProps> = (props) => {
  const { isSignedIn, username, updateUsername, inactiveUsernames } = useAuth();
  const { openModal, closeModal } = useModal();

  const [usernameInput, setUsernameInput] = React.useState(username || "");
  const [inputLoading, setInputLoading] = React.useState(false);
  const [inputSuccess, setInputSuccess] = React.useState<string | null>(null);
  const [inputError, setInputError] = React.useState<string | null>(null);

  const [usernameUpdateLoading, setUsernameUpdateLoading] =
    React.useState(false);

  // We want to delay sending a request to server to check username availability by 800ms
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sends a request to server to check if the username is available
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

  // Sends a request to server to update the username
  const onUpdateUsername = async () => {
    setUsernameUpdateLoading(true);

    if (!usernameInput || usernameInput === username) return;

    try {
      await updateUsername(usernameInput);

      dom.message(`Your username is now ${usernameInput}.`, "success");
      closeModal();
    } catch (error: any) {
      lib.handleErr(error);
    }

    setUsernameUpdateLoading(false);
  };

  const renderInactiveUsernames = () => {
    if (inactiveUsernames.length === 0) return null;

    return (
      <div className="username-inactive-list">
        <div className="username-inactive-list__header">Old Usernames:</div>
        <ul className="username-inactive-list__list">
          {inactiveUsernames.map((uname) => (
            <li key={uname.username} className="username-inactive-list__item">
              <span className="username-inactive-list__name">
                {uname.username}
              </span>
              <span className="username-inactive-list__expires">
                Expires in {lib.formatDuration(uname.expiresAt)}
              </span>
              <Button
                color="red"
                outlined={true}
                size="small"
                onClick={() => {}}
              >
                Switch
              </Button>
            </li>
          ))}
        </ul>
      </div>
    );
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
              loading={usernameUpdateLoading}
              disabled={inputSuccess && inputSuccess.length > 0 ? false : true}
              block={true}
              onClick={onUpdateUsername}
            >
              {username ? "Update" : "Confirm"}
            </Button>
          </div>
        </form>

        {/* <div className="auth-or">Old Usernames:</div> */}
        {renderInactiveUsernames()}
      </div>
    </Modal>
  );
};

export default Username;
