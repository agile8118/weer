interface componentProps {
    className?: string;
    size?: "big" | "small" | "extraSmall";
    color?: "default" | "green" | "gray" | "blue" | "red";
    children?: any;
    icon: string;
    id?: string;
    style?: any;
    outlined?: boolean;
    loading?: boolean;
    tooltipText?: string;
    type?: "submit" | "button";
    onClick?: () => void;
    onMouseLeave?: () => void;
    disabled?: boolean;
}
declare const Button: (props: componentProps) => any;
export default Button;
