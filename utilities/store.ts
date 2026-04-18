import { configureStore } from "@reduxjs/toolkit";
import alertReducer from "./alertStore";
import userReducer from "./userStore";
import productEditReducer from "./productEditStore";
import productsOrderReducer from "./productsOrderStore";
import ownerProductEditReducer from "./ownerProductEditStore";
import barcodeReducer from "./barcodeSlice";
import SellProductReducer from "./SellProductStore";
import employeeReducer from "./employeeStore";

export const store = configureStore({
    reducer: {
        alert: alertReducer,
        user: userReducer,
        productEdit: productEditReducer,
        productsOrder: productsOrderReducer,
        ownerProductEdit: ownerProductEditReducer,
        barcode: barcodeReducer,
        sellProduct: SellProductReducer,
        employee: employeeReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;