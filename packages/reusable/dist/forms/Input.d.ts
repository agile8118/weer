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
declare const Input: (props: Props) => any;
export default Input;
