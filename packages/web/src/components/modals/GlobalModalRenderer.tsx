/**
 * To see the implementation of the modal props, see where the modal is opened e.g. openModal("customizeLink", { onChangeType: ..., ... })
 */

import React from "react";

import LinkCustomizationModal from "./LinkCustomization";
import LinkConfirmDeleteModal from "./LinkConfirmDelete";
import LoginModal from "./Login";
import QRCodeModal from "./QRCode";

interface GlobalModalRendererProps {
  modal: { type: string | null; props?: Record<string, any> };
  closeModal: () => void;
}

export const GlobalModalRenderer = ({
  modal,
  closeModal,
}: GlobalModalRendererProps) => {
  if (!modal.type) return null;

  switch (modal.type) {
    case "confirmDelete":
      return (
        <LinkConfirmDeleteModal
          open
          onClose={closeModal}
          urlId={modal.props?.urlId}
          realUrl={modal.props?.realUrl}
          onSuccess={modal.props?.onSuccess}
        />
      );

    case "login":
      return <LoginModal open onClose={closeModal} />;

    case "customizeLink":
      return (
        <LinkCustomizationModal
          open
          onClose={closeModal}
          urlId={modal.props?.urlId}
          url={modal.props?.realUrl}
          shortenedUrl={modal.props?.shortenedUrl}
          onChangeType={modal.props?.onChangeType}
          type={modal.props?.type}
        />
      );

    case "qrCode":
      return (
        <QRCodeModal open onClose={closeModal} urlId={modal.props?.urlId} />
      );

    default:
      return null;
  }
};
