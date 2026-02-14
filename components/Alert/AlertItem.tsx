"use client";

import { Alert } from "@/types/alert";
import { removeAlert } from "@/utilities/alertStore";
import { Alert as AntAlert } from "antd";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export function AlertItem({ alert } : { alert: Alert }) {
    const dispatch = useDispatch();

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(removeAlert(alert.id));
        }, 2500);

        return () => clearTimeout(timer);
    }, [dispatch, alert.id]);

    return (
        <AntAlert
            description={alert.message}
            type={alert.type}
            showIcon
        />
    )
}