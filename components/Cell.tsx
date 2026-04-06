import { useState, useEffect } from "react";

type CellProps<T> = {
    value: T;
    onSave: (value: T) => void;
    type?: "text" | "number";
    formatter?: (value: T) => string;
};

export function Cell<T>({
    value,
    onSave,
    type = "text",
    formatter,
}: CellProps<T>) {
    const [editing, setEditing] = useState(false);
    const [temp, setTemp] = useState(value);

    useEffect(() => {
        setTemp(value);
    }, [value]);

    const handleSave = () => {
        if (temp !== value) {
            onSave(temp);
        }
        setEditing(false);
    };

    if (editing) {
        return (
            <input
                autoFocus
                type={type}
                value={temp as any}
                onChange={(e) =>
                    setTemp(
                        type === "number"
                            ? (Number(e.target.value) as T)
                            : (e.target.value as T)
                    )
                }
                onBlur={handleSave}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") {
                        setTemp(value);
                        setEditing(false);
                    }
                }}
                className="border rounded px-2 py-1 w-24 text-center focus:outline-purple"
            />
        );
    }

    return (
        <span
            onClick={() => setEditing(true)}
            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
        >
            {formatter ? formatter(value) : String(value)}
        </span>
    );
}