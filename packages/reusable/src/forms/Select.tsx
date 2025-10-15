import React, { useState, useEffect } from "react";

interface Props {
  // Label text shown above the dropdown
  label: string;
  // Disable interaction
  disabled?: boolean;
  // Options (<option> elements) to display
  children?: any;
  // Controlled selected value
  value?: string;
  // Dropdown size
  // size?: "small" | ""; We can add this later to control size
  // Rounded corners
  rounded?: boolean;
  // Show error state if required but empty
  requiredWithError?: boolean;
  // Position of the help tooltip
  tooltipPosition?: "top" | "right" | "bottom" | "left";
  //  Help tooltip text
  help?: string;
  // Called when user selects a new option
  onChange?: (value: string, text: string, data: string) => void;
}

const Select = (props: Props) => {
  const [open, setOpen] = useState(false); // whether the dropdown is open
  const [selected, setSelected] = useState(""); // selected option label (text)
  const [value, setValue] = useState(props.value); // selected option value
  const [options, setOptions] = useState<any[]>([]); // options from children

  /**
   * When the component mounts or children change:
   * - Parse <option> children into an array of option objects
   * - Attach a global click listener to close dropdown when clicking outside
   */
  useEffect(() => {
    if (!props.children) throw new Error(`No children specified`);

    const validChildren = props.children.filter((i: any) => !!i);
    const parsedOptions = validChildren.map((i: any) => ({
      text: i.props.children,
      value: i.props.value,
      data: i.props.data, // custom data attribute
      addClass: i.props.addClass,
    }));

    setOptions(parsedOptions);

    function handleClickOutside(e: any) {
      if (e.target.getAttribute("data-select-id") !== `select-${props.label}`) {
        setOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [props.children]);

  /**
   * Keep internal `value` in sync with external `props.value`
   */
  useEffect(() => {
    if (props.value) {
      setValue(props.value);
    } else {
      setSelected("");
      setValue("");
    }
  }, [props.value]);

  /**
   * Find the display text for a given option value
   */
  const getText = (v: string) => {
    for (let i = 0; i < options.length; i++) {
      if (v === options[i].value) return options[i].text;
    }
    return "";
  };

  /**
   * Render all options as button items inside the dropdown
   */
  const items = options.map(
    (item: { text: string; value: string; data: string; addClass: string }) => (
      <button
        key={item.value}
        data-select-id={`select-${props.label}`}
        className={`form-select__item ${item.addClass} ${
          selected === item.text || value === item.value || value === item.text
            ? "form-select__item--selected"
            : ""
        }`}
        type="button"
        onClick={() => {
          setSelected(item.text);
          setValue(item.value);
          if (props.onChange) props.onChange(item.value, item.text, item.data);
          setOpen(false);
        }}
      >
        {item.text}
      </button>
    )
  );

  const helpTooltip = props.help ? (
    <div className="form-select__help-tooltip">
      <div className={`tooltip tooltip-${props.tooltipPosition || "top"}`}>
        <i className="fa-regular fa-circle-question"></i>
        <div className="tooltip__text">{props.help}</div>
      </div>
    </div>
  ) : null;

  /**
   * Render the label above the dropdown — floating when open or when a value is selected
   */
  const renderLabel = () => {
    return value || open ? (
      <>
        <span
          className="form-select__label__top"
          data-select-id={`select-${props.label}`}
        >
          {props.label}
          {helpTooltip}
        </span>
        {value ? getText(value) || value : <span></span>}
      </>
    ) : (
      props.label
    );
  };

  /**
   * Build the root className dynamically based on props
   */
  let className = "form-select";
  // if (props.size === "small") className += " form-select--small";
  if (props.rounded) className += " form-select--rounded";
  if (props.requiredWithError && !value) className += " form-select--error";

  return (
    <div className={className} data-select-id={`select-${props.label}`}>
      {/* Label button (opens/closes dropdown) */}
      <button
        disabled={props.disabled || false}
        className={`form-select__label ${
          open ? "form-select__label--open" : ""
        }`}
        type="button"
        data-select-id={`select-${props.label}`}
        onClick={() => setOpen(!open)}
      >
        {renderLabel()}

        {!open && !value && helpTooltip}

        <span className="form-select__arrow">
          {open ? (
            <i
              data-select-id={`select-${props.label}`}
              className="fa-solid fa-chevron-up"
            ></i>
          ) : (
            <i
              data-select-id={`select-${props.label}`}
              className="fa-solid fa-chevron-down"
            ></i>
          )}
        </span>
      </button>

      {/* Dropdown content */}
      {open && (
        <div
          className="form-select__content"
          data-select-id={`select-${props.label}`}
        >
          <div
            className="form-select__items"
            data-select-id={`select-${props.label}`}
          >
            {items}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
