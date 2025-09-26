import React, { FC } from "react";

const EllipsisLoader: FC = () => {
  return (
    <div className="lds-ellipsis">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default EllipsisLoader;
