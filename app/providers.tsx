"use client";

import { store } from "@/utilities/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { ConfigProvider } from "antd";
import { UserProvider } from "./userProvider";

if (typeof window !== "undefined") {
    const originalWarn = console.warn;
    const originalError = console.error;

    const shouldSuppress = (args: unknown[]) => {
        const msg = args.map(a => String(a)).join(" ");
        return msg.includes("maskClosable") && msg.includes("deprecated");
    };

    console.warn = (...args) => { if (!shouldSuppress(args)) originalWarn(...args); };
    console.error = (...args) => { if (!shouldSuppress(args)) originalError(...args); };
}

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ConfigProvider
            warning={{ strict: false }}
            theme={{
                components: {
                    Alert: { withDescriptionIconSize: 20 },
                    Switch: { colorPrimary: "#6420AA", colorPrimaryHover: "#6420AA" },
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
                        colorBgContainerDisabled: "#FFFFFF",
                        colorTextDisabled: "000000",
                    },
                    Tooltip: { maxWidth: 280 },
                    Spin: { colorPrimary: "#6420AA" },
                    Upload: {
                        colorPrimary: "#6420AA",
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
    );
}