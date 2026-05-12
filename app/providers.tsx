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

interface ProvidersProps {
    children: React.ReactNode;
    userId: string | null;
}

export function Providers({ children, userId }: ProvidersProps) {

    return (
        <ConfigProvider
            warning={{ strict: false }}
            theme={{
                token: {
                    colorPrimary: "#6420AA",
                    colorPrimaryHover: "#6420AA",
                },
                components: {
                    Alert: { withDescriptionIconSize: 20 },
                    Pagination: {
                        itemActiveColor: "#6420AA",
                        itemActiveColorHover: "#6420AA",
                    },
                    DatePicker: {
                        paddingBlock: 14,
                        colorPrimaryBorder: "#6420AA",
                        colorBgContainerDisabled: "#FFFFFF",
                        colorTextDisabled: "000000",
                    },
                    Tooltip: { maxWidth: 280 },
                }
            }}
        >
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UserProvider userId={userId}>
                        {children}
                    </UserProvider>
                </QueryClientProvider>
            </Provider>
        </ConfigProvider>
    );
}