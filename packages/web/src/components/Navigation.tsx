import React, { FC, useState } from "react";
import { Modal, Input, Button } from "@weer/reusable";
import { useAuth } from "../AuthContext";

const Navigation: FC = () => {
  const { isSignedIn, email, username, loading } = useAuth();

  const [logInModal, setLogInModal] = useState<boolean>(false);

  return (
    <>
      <nav className="navigation navigation-md">
        <a href="/" className="navigation__logo">
          <img src="/logo.svg" alt="Weer Logo" />
          <span>Weer</span>
        </a>

        <div className="navigation__right">
          {!isSignedIn && !loading && (
            <button
              className="navigation__link button-reset"
              onClick={() => setLogInModal(true)}
            >
              Login
            </button>
          )}

          {isSignedIn && !loading && (
            <div
              className="nav-dropdown dropdown--close"
              data-role="dropdown"
              data-dropdown="user-dropdown-md"
            >
              <div
                className="nav-dropdown__button"
                data-role="dropdown"
                data-dropdown="user-dropdown-md"
              >
                <button
                  className="button-reset"
                  href="#"
                  data-role="dropdown"
                  data-dropdown="user-dropdown-md"
                >
                  <i
                    data-role="dropdown"
                    data-dropdown="user-dropdown-md"
                    className="fa-regular fa-circle-user"
                  ></i>
                </button>
              </div>
              <div
                className={
                  "nav-dropdown__content" +
                  (!username ? " nav-dropdown__content--wide" : "")
                }
                id="user-dropdown-md"
              >
                <a href="#">
                  <i className="fa-solid fa-user"></i>{" "}
                  {username ? username : "Choose a username"}
                </a>
                <a href="#">
                  <i className="fa fa-key"></i>Account
                </a>
                <a href="/logout">
                  <i className="fa fa-sign-out"></i> Logout
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      <Modal
        open={logInModal}
        onClose={() => setLogInModal(false)}
        header="Log in to Weer"
        type="narrow"
      >
        <div className="auth">
          <form action="">
            <div className="form-group">
              <Input label="Email" type="email" id="email" required />
            </div>

            <div className="form-group">
              <Input label="Password" type="password" id="password" required />
            </div>

            <div className="form-group u-flex-text-right">
              <Button type="submit" color="blue" outlined={true} block={true}>
                Log In
              </Button>
            </div>
          </form>
          <div className="auth-or">or</div>
          <div className="u-flex-text-center u-margin-top-2">
            <a
              className="button button-block button-with-icon button-google-signin"
              href="/auth/google"
            >
              <i className="button__icon-left fa-brands fa-google"></i>
              Continue with Google
            </a>
          </div>

          <div className="auth__footer">
            <button className="button-text">Forgot your password?</button>

            <div className="auth__other">
              New to Weer?{" "}
              <button className="button-text">Create an account</button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Navigation;
