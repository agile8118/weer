import React, { FC, useState } from "react";
import { useAuth } from "../AuthContext";

const Navigation: FC = () => {
  const { isSignedIn, email, username } = useAuth();

  return (
    <nav className="navigation navigation-md">
      <a href="/" className="navigation__logo">
        <img src="/logo.svg" alt="Weer Logo" />
        <span>Weer</span>
      </a>

      <div className="navigation__right">
        {!isSignedIn ? (
          <a href="/login" className="navigation__link">
            Login
          </a>
        ) : (
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
              <a href="#" data-role="dropdown" data-dropdown="user-dropdown-md">
                <i
                  data-role="dropdown"
                  data-dropdown="user-dropdown-md"
                  className="fa-regular fa-circle-user"
                ></i>
              </a>
            </div>
            <div className="nav-dropdown__content">
              <a href="#">
                <i className="fa-solid fa-user"></i> {username}
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
  );
};

export default Navigation;
