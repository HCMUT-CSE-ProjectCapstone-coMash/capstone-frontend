
interface ButtonProps {
    label: string,
    className: string,
    isLoading?: boolean,
    onClick?: () => void;
}

export function Button({ label, className, isLoading, onClick } : ButtonProps) {
    const baseStyle = `
        py-[8px] px-[12px] rounded-lg 
        ${isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"} 
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