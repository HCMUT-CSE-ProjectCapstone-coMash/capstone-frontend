import { DatePicker } from "antd";
import dayjs from "dayjs";

interface DatePickerInputProps {
    label: string,
    value: string,
    placeHolder: string,
    onChange: (date: string) => void,
    labelPosition?: "left" | "top",
    disabled?: boolean,
    isError?: boolean
};

export function DatePickerInput({ label, value, placeHolder, onChange, labelPosition="top", disabled = false, isError = false }: DatePickerInputProps) {
    const isLeft = labelPosition === "left";

    return (
        <div
            className={`w-full font-display ${isLeft ? "flex items-center gap-x-4" : "flex flex-col gap-y-2.5"}`}
        >
            <label className={`text-sm font-normal text-tgray9 ${isLeft ? "w-25" : ""}`}>{label}</label>

            <DatePicker
                disabled={disabled}
                status={isError ? "error" : undefined}
                placeholder={placeHolder}
                picker={"date"}
                format="DD/MM/YYYY"
                value={value ? dayjs(value) : null}
                onChange={(date) => onChange(date ? date.format("YYYY-MM-DD") : "")}
            />
        </div>
    )
}