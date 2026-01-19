import React from "react"

interface ButtonProps {
    label: string,
    className: string
}

export function Button({ label, className } : ButtonProps) {
    const baseStyle = `py-[8px] px-[12px] rounded-lg ${className}`;

    return (
        <button
            className={baseStyle}
        >
            {label}
        </button>
    )
}