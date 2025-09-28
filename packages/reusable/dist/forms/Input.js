"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const Input = (props) => {
    var _a;
    const [value, setValue] = (0, react_1.useState)((_a = props.value) === null || _a === void 0 ? void 0 : _a.toString());
    const input = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        var _a, _b;
        setValue((_b = (_a = props.value) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "");
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
    if (props.rounded)
        className += " form-text--rounded";
    if (props.success && !props.disabled)
        className += " form-text--success";
    if (props.error && !props.disabled)
        className += " form-text--error";
    if (props.disabled)
        className += " form-text--disabled";
    if (props.requiredWithError && !value) {
        className += " form-text--error";
    }
    if (props.lined) {
        className += " form-text-lined";
    }
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: className, children: [props.placeholder && !props.lined && ((0, jsx_runtime_1.jsx)("label", { className: "form__label", onClick: () => {
                            var _a;
                            (_a = input.current) === null || _a === void 0 ? void 0 : _a.focus();
                        }, children: props.label })), (0, jsx_runtime_1.jsxs)("div", { className: "form-text__input-container", children: [props.help && ((0, jsx_runtime_1.jsx)("div", { className: "form-text__help-tooltip", children: (0, jsx_runtime_1.jsxs)("div", { className: "tooltip", children: [(0, jsx_runtime_1.jsx)("i", { class: "fa-regular fa-circle-question" }), (0, jsx_runtime_1.jsx)("div", { className: "tooltip__text", children: props.help })] }) })), props.innerInputLabel && ((0, jsx_runtime_1.jsx)("span", { className: "form-text__inner-input-label", ref: (elem) => {
                                    // Add a left padding to the input because of the name label
                                    if (elem)
                                        // @ts-ignore
                                        elem.nextSibling.style.paddingLeft = `${elem.clientWidth + 10}px`;
                                }, children: props.innerInputLabel })), (0, jsx_runtime_1.jsx)("input", { ref: input, className: "form-text__input", id: props.id, disabled: props.disabled, value: value, required: props.required, autoFocus: props.autoFocus, autoComplete: props.autoComplete || "", maxLength: props.maxLength, placeholder: props.placeholder, onChange: (event) => {
                                    var _a;
                                    const newVal = event.target.value;
                                    setValue(newVal);
                                    (_a = props.onChange) === null || _a === void 0 ? void 0 : _a.call(props, newVal);
                                }, onBlur: (event) => {
                                    let value = event.target.value;
                                    setValue(value);
                                    if (props.onBlur)
                                        props.onBlur(value);
                                }, type: props.type === "password" ? "password" : "text" })] }), !props.placeholder && ((0, jsx_runtime_1.jsx)("label", { className: `form-text__label ${value ? "form-text__label--top" : ""}`, onClick: () => {
                            var _a;
                            (_a = input.current) === null || _a === void 0 ? void 0 : _a.focus();
                        }, children: props.label }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-text__footer", children: [props.error && !props.disabled && ((0, jsx_runtime_1.jsxs)("span", { className: "input-error", children: [(0, jsx_runtime_1.jsx)("i", { className: "fa-solid fa-circle-exclamation" }), props.error] })), props.maxLength && ((0, jsx_runtime_1.jsx)("span", { className: "form-text__length-display", children: props.maxLength - ((value === null || value === void 0 ? void 0 : value.length) || 0) }))] })] }));
};
exports.default = Input;
