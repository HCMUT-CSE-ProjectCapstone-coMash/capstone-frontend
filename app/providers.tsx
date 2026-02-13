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
                    Alert: { withDescriptionIconSize: 20 } 
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