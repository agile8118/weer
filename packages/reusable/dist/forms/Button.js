"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const InlineLoading_1 = __importDefault(require("../InlineLoading"));
const Button = (props) => {
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
            }
            else {
                className += " button-default";
            }
            break;
        case "blue":
            if (props.outlined) {
                className += " button-blue-outlined";
            }
            else {
                className += " button-blue";
            }
            break;
        case "red":
            if (props.outlined) {
                className += " button-red-outlined";
            }
            else {
                className += " button-red";
            }
            break;
        case "green":
            if (props.outlined) {
                className += " button-green-outlined";
            }
            else {
                className += " button-green";
            }
            break;
        case "gray":
            if (props.outlined) {
                className += " button-gray-outlined";
            }
            else {
                className += " button-gray";
            }
            break;
        default:
            if (props.outlined) {
                className += " button-default-outlined";
            }
            else {
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
    if (props.color === "blue")
        loadingColor = "blue";
    if (!props.outlined)
        loadingColor = "light";
    return ((0, jsx_runtime_1.jsxs)("button", { id: props.id, style: props.style, onClick: props.onClick, className: className, type: props.type ? props.type : "button", disabled: props.loading ? true : props.disabled, children: [props.loading && props.loadingText ? props.loadingText : props.children, props.loading && ((0, jsx_runtime_1.jsx)(InlineLoading_1.default, { className: "button__icon-right", color: loadingColor }))] }));
};
exports.default = Button;
