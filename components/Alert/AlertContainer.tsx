"use client";

import { RootState } from "@/utilities/store";
import { useSelector } from "react-redux";
import { AlertItem } from "./AlertItem";

export function AlertContainer() {
    const alerts = useSelector((state: RootState) => state.alert.alertQueue);

    return (
        <div className="relative">
            <div className="absolute top-5 right-5 flex flex-col gap-3">
                {alerts.map((alert) => (
                    <AlertItem key={alert.id} alert={alert}/>
                ))}
            </div>
        </div>
    )
}