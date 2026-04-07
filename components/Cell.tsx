import { useState, useEffect } from "react";
import { formatThousands, parseFormattedNumber } from "@/utilities/numberFormat";

type CellProps = {
    value: number;
    onSave: (value: number) => void;
};

export function Cell({ value, onSave }: CellProps) {
    const [editing, setEditing] = useState(false);
    const [display, setDisplay] = useState("");

    useEffect(() => {
        if (!editing) {
            setDisplay(formatThousands(value));
        }
    }, [value, editing]);

    const handleSave = () => {
        const parsed = parseFormattedNumber(display);

        if (parsed !== value) {
            onSave(parsed);
        }

        setEditing(false);
    };

    if (editing) {
        return (
            <input
                autoFocus
                type="text"
                value={display}
                onChange={(e) => {
                    setDisplay(e.target.value);
                }}
                onBlur={handleSave}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") {
                        setDisplay(formatThousands(value));
                        setEditing(false);
                    }
                }}
                onFocus={(e) => e.target.select()}
                className="border rounded px-2 py-1 w-28 text-center focus:outline-purple"
            />
        );
    }

    return (
        <span
            onClick={() => setEditing(true)}
            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
        >
            {formatThousands(value)} VND
        </span>
    );
}