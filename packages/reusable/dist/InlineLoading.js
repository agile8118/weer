"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const InlineLoading = (props) => {
    let className = "lds-ellipsis ";
    if (props.className)
        className += props.className;
    const el = ((0, jsx_runtime_1.jsxs)("div", { className: className, children: [(0, jsx_runtime_1.jsx)("div", { className: `lds-ellipsis--${props.color}` }), (0, jsx_runtime_1.jsx)("div", { className: `lds-ellipsis--${props.color}` }), (0, jsx_runtime_1.jsx)("div", { className: `lds-ellipsis--${props.color}` }), (0, jsx_runtime_1.jsx)("div", { className: `lds-ellipsis--${props.color}` })] }));
    if (props.center) {
        return (0, jsx_runtime_1.jsx)("div", { className: "u-text-center", children: el });
    }
    else
        return el;
};
exports.default = InlineLoading;
