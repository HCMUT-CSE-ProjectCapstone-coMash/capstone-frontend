import { configureStore } from "@reduxjs/toolkit";
import alertReducer from "./alertStore";
import userReducer from "./userStore";
import productEditReducer from "./productEditStore";

export const store = configureStore({
    reducer: {
        alert: alertReducer,
        user: userReducer,
        productEdit: productEditReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;