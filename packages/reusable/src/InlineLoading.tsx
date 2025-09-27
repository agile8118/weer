import React from "react";

interface componentProps {
  className?: string;
  center?: boolean;
  color?: "dark" | "light" | "green" | "default" | "blue" | "red";
}

const InlineLoading = (props: componentProps) => {
  let className = "lds-ellipsis ";
  if (props.className) className += props.className;

  const el = (
    <div className={className}>
      <div className={`lds-ellipsis--${props.color}`}></div>
      <div className={`lds-ellipsis--${props.color}`}></div>
      <div className={`lds-ellipsis--${props.color}`}></div>
      <div className={`lds-ellipsis--${props.color}`}></div>
    </div>
  );

  if (props.center) {
    return <div className="u-text-center">{el}</div>;
  } else return el;
};

export default InlineLoading;
