import React from "react";
import Button from "../forms/Button";

interface componentProps {
  header: string;
  message?: string;
  open?: boolean;
  onCancel?: any;
  onConfirm: any;
  btnName?: string;
  children?: React.ReactNode;
  loading?: boolean;
}

const ConfirmModal = ({
  header,
  message,
  open,
  onCancel,
  onConfirm,
  btnName,
  children,
  loading,
}: componentProps) => {
  const className = open ? "mdl mdl-conf" : "mdl mdl-conf display-none";
  return (
    <div className={className}>
      <div className="mdl__content">
        <div className="mdl__header">
          <span className="mdl__close" onClick={onCancel}>
            &times;
          </span>
          <h3 className="heading-tertiary">{header}</h3>
        </div>

        <div className="mdl__body">
          {message || children}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            <div className="mdl-conf__footer u-flex-text-right">
              <Button
                type="submit"
                color="red"
                rounded={true}
                loading={loading}
              >
                {btnName ? btnName : "Remove"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
