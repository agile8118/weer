"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const Button = (props) => {
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
            }
            else {
                className += " button-icon--default";
            }
            break;
        case "blue":
            if (props.outlined) {
                className += " button-icon--blue-outlined";
            }
            else {
                className += " button-icon--blue";
            }
            break;
        case "red":
            if (props.outlined) {
                className += " button-icon--red-outlined";
            }
            else {
                className += " button-icon--red";
            }
            break;
        case "green":
            if (props.outlined) {
                className += " button-icon--green-outlined";
            }
            else {
                className += " button-icon--green";
            }
            break;
        case "gray":
            if (props.outlined) {
                className += " button-icon--gray-outlined";
            }
            else {
                className += " button-icon--gray";
            }
            break;
        default:
            if (props.outlined) {
                className += " button-icon--default-outlined";
            }
            else {
                className += " button-icon--default";
            }
            break;
    }
    const button = ((0, jsx_runtime_1.jsx)("button", { id: props.id, style: props.style, onClick: props.onClick, onMouseLeave: props.onMouseLeave, className: className, type: props.type ? props.type : "button", disabled: props.loading ? true : props.disabled, children: (0, jsx_runtime_1.jsx)("i", { className: props.icon }) }));
    if (props.tooltipText) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: `tooltip ${props.className ? props.className : ""}`, children: [button, (0, jsx_runtime_1.jsx)("span", { className: "tooltip__text", children: props.tooltipText })] }));
    }
    else {
        return button;
    }
};
exports.default = Button;
