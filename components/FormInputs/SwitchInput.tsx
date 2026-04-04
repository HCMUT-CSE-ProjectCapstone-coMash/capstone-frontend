import { Switch } from "antd";

interface SwitchInputProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export function SwitchInput({ label, checked, onChange, disabled }: SwitchInputProps) {

    return (
        <div className="flex items-center gap-5">
            <p className="text-sm font-normal text-tgray9">{label}</p>
            <Switch disabled={disabled} checked={checked} onChange={onChange}/>
        </div>
    )
}