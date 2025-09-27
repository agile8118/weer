interface componentProps {
    className?: string;
    size?: "big" | "small" | "extraSmall";
    block?: boolean;
    color?: "default" | "green" | "gray" | "blue" | "red";
    children?: any;
    id?: string;
    style?: any;
    outlined?: boolean;
    rounded?: boolean;
    loading?: boolean;
    loadingText?: string;
    type?: "submit" | "button";
    onClick?: () => void;
    disabled?: boolean;
}
declare const Button: (props: componentProps) => any;
export default Button;
