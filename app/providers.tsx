"use client";

import { store } from "@/utilities/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { ConfigProvider } from "antd";
import { UserProvider } from "./userProvider";

const queryClient = new QueryClient();

export function Providers({ children } : { children : React.ReactNode }) {

    return (
        <ConfigProvider
            theme={{
                components: {
                    Alert: { withDescriptionIconSize: 20 },
                    Switch: { colorPrimary: "#6420AA", colorPrimaryHover: "#6420AA"},
                    Pagination: {
                        itemActiveColor: "#6420AA",
                        itemActiveColorHover: "#6420AA",
                        colorPrimary: "#6420AA",
                        colorPrimaryHover: "#6420AA"
                    },
                    DatePicker: {
                        paddingBlock: 14,
                        colorPrimary: "#6420AA",
                        colorPrimaryBorder: "#6420AA",
                        colorPrimaryHover: "#6420AA",
                    }
                }
            }}
        >
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UserProvider>
                        {children}
                    </UserProvider>
                </QueryClientProvider>
            </Provider>
        </ConfigProvider>
    )
}