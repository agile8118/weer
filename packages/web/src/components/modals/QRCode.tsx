import React, { FC, useEffect, useState } from "react";

import { ConfirmModal, Loading, Modal, Button, Input } from "@weer/reusable";
import { useAuth } from "../../AuthContext";
import dom from "../../lib/dom";

interface QRCodeProps {
  open: boolean;
  onClose: () => void;
  urlId: string | null;
}

const QRCode: FC<QRCodeProps> = (props) => {
  return (
    <Modal
      header="Your QR Code"
      // type="narrow"
      open={props.open}
      onClose={() => {
        props.onClose();
      }}
    >
      <div className="qr-code">
        <img src={`/qr/${props.urlId}`} alt="QR Code" />
      </div>

      <a href={`/qr/${props.urlId}?type=png&download=true&size=1024`}>
        Download PNG
      </a>
      <a href={`/qr/${props.urlId}?type=svg&download=true`}>Download SVG</a>

      <p className="qr__message">
        Your QR Code will be valid permanently and won't change regardless of
        how you customize your shortened link.
      </p>
    </Modal>
  );
};

export default QRCode;
