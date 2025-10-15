import React, { FC } from "react";

import { Modal, Input, Button } from "@weer/reusable";
import { useAuth } from "../../AuthContext";

interface LoginProps {
  open: boolean;
  onClose: () => void;
}

const Login: FC<LoginProps> = (props) => {
  const { isSignedIn, username } = useAuth();

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
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
  );
};

export default Login;
