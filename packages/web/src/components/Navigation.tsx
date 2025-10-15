import React, { FC, useState } from "react";
import { Modal, Input, Button } from "@weer/reusable";
import { useAuth } from "../AuthContext";
import { useModal } from "../ModalContext";

const Navigation: FC = () => {
  const { isSignedIn, email, username, loading } = useAuth();
  const { openModal } = useModal();

  console.log("Rendering Navigation...");

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
              onClick={() => openModal("login")}
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
    </>
  );
};

export default Navigation;
