import React from "react";
import Loading from "../InlineLoading";

interface componentProps {
  className?: string;
  size?: "big" | "small" | "extraSmall";
  block?: boolean;
  color?: "default" | "green" | "gray" | "blue" | "red";
  children?: any;
  id?: string;
  style?: any;
  outlined?: boolean;
  rounded?: boolean;
  loading?: boolean;
  loadingText?: string;
  type?: "submit" | "button";
  onClick?: () => void;
  disabled?: boolean;
}

const Button = (props: componentProps) => {
  let className = "button";

  switch (props.size) {
    case "big":
      className += " button-big";
      break;
    case "small":
      className += " button-small";
      break;
    case "extraSmall":
      className += " button-extra-small";
      break;
  }

  switch (props.color) {
    case "default":
      if (props.outlined) {
        className += " button-default-outlined";
      } else {
        className += " button-default";
      }
      break;
    case "blue":
      if (props.outlined) {
        className += " button-blue-outlined";
      } else {
        className += " button-blue";
      }
      break;
    case "red":
      if (props.outlined) {
        className += " button-red-outlined";
      } else {
        className += " button-red";
      }
      break;
    case "green":
      if (props.outlined) {
        className += " button-green-outlined";
      } else {
        className += " button-green";
      }
      break;
    case "gray":
      if (props.outlined) {
        className += " button-gray-outlined";
      } else {
        className += " button-gray";
      }
      break;

    default:
      if (props.outlined) {
        className += " button-default-outlined";
      } else {
        className += " button-default";
      }
      break;
  }

  if (props.rounded) {
    className += " button-rounded";
  }

  if (props.block) {
    className += " button-block";
  }

  className += " " + props.className;

  let loadingColor;
  if (props.color === "blue") loadingColor = "blue";
  if (!props.outlined) loadingColor = "light";

  return (
    <button
      id={props.id}
      style={props.style}
      onClick={props.onClick}
      className={className}
      type={props.type ? props.type : "button"}
      disabled={props.loading ? true : props.disabled}
    >
      {props.loading && props.loadingText ? props.loadingText : props.children}
      {/* {props.children} */}
      {props.loading && (
        <Loading
          className="button__icon-right"
          color={loadingColor as "blue" | "light"}
        />
      )}
    </button>
  );
};

export default Button;
