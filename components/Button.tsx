
interface ButtonProps {
    label: string,
    className: string,
    isLoading?: boolean,
    onClick?: () => void;
    disable?: boolean;
}

export function Button({ label, className, isLoading, onClick, disable = false } : ButtonProps) {
    const baseStyle = `
        py-[8px] px-[12px] rounded-lg 
        ${isLoading || disable ? "cursor-not-allowed opacity-60" : "cursor-pointer"} 
        ${className}
    `;

    return (
        <button
            className={baseStyle}
            onClick={onClick}
        >
            {label}
        </button>
    )
}