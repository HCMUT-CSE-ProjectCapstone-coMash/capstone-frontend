import { configureStore } from "@reduxjs/toolkit";
import alertReducer from "./alertStore";
import userReducer from "./userStore";
import productEditReducer from "./productEditStore";
import productsOrderReducer from "./productsOrderStore";
import ownerProductEditReducer from "./ownerProductEditStore";
import printReducer from "./printStore";

export const store = configureStore({
    reducer: {
        alert: alertReducer,
        user: userReducer,
        productEdit: productEditReducer,
        productsOrder: productsOrderReducer,
        ownerProductEdit: ownerProductEditReducer,
        print: printReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;