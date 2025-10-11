import React, { useState, useEffect, useRef } from "react";

interface Props {
  value?: string;
  size?: "big" | "small";
  rounded?: boolean;
  id?: string;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  error?: string;
  onChange?: (s: string) => void;
  onBlur?: (s: string) => void;
  requiredWithError?: boolean;
  label?: string;
  type?: string;
  success?: boolean;
  disabled?: boolean;
  help?: string;
  placeholder?: string;
  maxLength?: number;
  lined?: boolean;
  innerInputLabel?: string;
}

const Input = (props: Props) => {
  const [value, setValue] = useState(props.value?.toString());

  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(props.value?.toString() ?? "");
  }, [props.value]);

  let className = "form-text";

  switch (props.size) {
    case "big":
      className += " form-text--big";
      break;
    case "small":
      className += " form-text--small";
      break;
  }

  if (props.rounded) className += " form-text--rounded";
  if (props.success && !props.disabled) className += " form-text--success";
  if (props.error && !props.disabled) className += " form-text--error";
  if (props.disabled) className += " form-text--disabled";

  if (props.requiredWithError && !value) {
    className += " form-text--error";
  }

  if (props.lined) {
    className += " form-text-lined";
  }

  return (
    <>
      <div className={className}>
        {props.placeholder && !props.lined && (
          <label
            className="form__label"
            onClick={() => {
              input.current?.focus();
            }}
          >
            {props.label}
          </label>
        )}
        <div className="form-text__input-container">
          {props.help && (
            <div className="form-text__help-tooltip">
              <div className="tooltip">
                <i className="fa-regular fa-circle-question"></i>

                <div className="tooltip__text">{props.help}</div>
              </div>
            </div>
          )}

          {props.innerInputLabel && (
            <span
              className="form-text__inner-input-label"
              ref={(elem) => {
                // Add a left padding to the input because of the name label
                if (elem)
                  // @ts-ignore
                  elem.nextSibling.style.paddingLeft = `${
                    elem.clientWidth + 10
                  }px`;
              }}
            >
              {props.innerInputLabel}
            </span>
          )}

          <input
            ref={input}
            className="form-text__input"
            id={props.id}
            disabled={props.disabled}
            value={value}
            required={props.required}
            autoFocus={props.autoFocus}
            autoComplete={props.autoComplete || ""}
            maxLength={props.maxLength}
            placeholder={props.placeholder}
            onChange={(event: any) => {
              const newVal = event.target.value;
              setValue(newVal);
              props.onChange?.(newVal);
            }}
            onBlur={(event: any) => {
              let value = event.target.value;
              setValue(value);
              if (props.onBlur) props.onBlur(value);
            }}
            type={props.type === "password" ? "password" : "text"}
          />
        </div>
        {!props.placeholder && (
          <label
            className={`form-text__label ${
              value ? "form-text__label--top" : ""
            }`}
            onClick={() => {
              input.current?.focus();
            }}
          >
            {props.label}
          </label>
        )}
      </div>

      <div className="form-text__footer">
        {props.error && !props.disabled && (
          <span className="input-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            {props.error}
          </span>
        )}

        {props.maxLength && (
          <span className="form-text__length-display">
            {props.maxLength - (value?.length || 0)}
          </span>
        )}
      </div>
    </>
  );
};

export default Input;
