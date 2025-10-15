import React from "react";

interface componentProps {
  className?: string;
  size?: "big" | "small" | "extraSmall";
  color?: "default" | "green" | "gray" | "blue" | "red";
  children?: any;
  icon: string;
  id?: string;
  style?: any;
  outlined?: boolean;
  loading?: boolean;
  tooltipText?: string;
  type?: "submit" | "button";
  onClick?: () => void;
  onMouseLeave?: () => void;
  disabled?: boolean;
}

const Button = (props: componentProps) => {
  let className = "button-icon";

  switch (props.size) {
    case "big":
      className += " button-icon--big";
      break;
    case "small":
      className += " button-icon--small";
      break;
    case "extraSmall":
      className += " button-icon--extra-small";
      break;
  }

  switch (props.color) {
    case "default":
      if (props.outlined) {
        className += " button-icon--default-outlined";
      } else {
        className += " button-icon--default";
      }
      break;
    case "blue":
      if (props.outlined) {
        className += " button-icon--blue-outlined";
      } else {
        className += " button-icon--blue";
      }
      break;
    case "red":
      if (props.outlined) {
        className += " button-icon--red-outlined";
      } else {
        className += " button-icon--red";
      }
      break;
    case "green":
      if (props.outlined) {
        className += " button-icon--green-outlined";
      } else {
        className += " button-icon--green";
      }
      break;
    case "gray":
      if (props.outlined) {
        className += " button-icon--gray-outlined";
      } else {
        className += " button-icon--gray";
      }
      break;

    default:
      if (props.outlined) {
        className += " button-icon--default-outlined";
      } else {
        className += " button-icon--default";
      }
      break;
  }

  const button = (
    <button
      id={props.id}
      style={props.style}
      onClick={props.onClick}
      onMouseLeave={props.onMouseLeave}
      className={className}
      type={props.type ? props.type : "button"}
      disabled={props.loading ? true : props.disabled}
    >
      <i className={props.icon}></i>
    </button>
  );

  if (props.tooltipText) {
    return (
      <div
        className={`tooltip tooltip-top ${
          props.className ? props.className : ""
        }`}
      >
        {button}
        <span className="tooltip__text">{props.tooltipText}</span>
      </div>
    );
  } else {
    return button;
  }
};

export default Button;
