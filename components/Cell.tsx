import { useState } from "react";
import { formatThousands, parseFormattedNumber } from "@/utilities/numberFormat";

type CellProps = {
    value: number;
    onSave: (value: number) => void;
    isPercentage?: boolean,
    disabled?: boolean;
};

export function Cell({ value, onSave, isPercentage = false, disabled = false }: CellProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(0);

    const handleStart = () => {
        if (disabled) return;

        setDraft(value);
        setEditing(true);
    };
    
    const handleSave = () => {
        if (draft !== value) onSave(draft);
        setEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") setEditing(false);
    };

    return editing ? (
        <input
            autoFocus
            type="text"
            value={formatThousands(draft)}
            onChange={(e) => setDraft(parseFormattedNumber(e.target.value))}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.target.select()}
            className="border rounded px-2 py-1 w-28 text-center focus:outline-purple disabled:cursor-not-allowed disabled:opacity-70"
            disabled={disabled}
        />
    ) : (
        <span  
            onClick={handleStart}
            className={`px-2 py-1 rounded ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-gray-100"}`}
        >
            {isPercentage ? `${value} %` : `${formatThousands(value)} VNĐ`}
        </span>
    );
}