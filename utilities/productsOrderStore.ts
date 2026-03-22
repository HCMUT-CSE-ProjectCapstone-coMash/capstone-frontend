import { Product } from "@/types/product";
import { ProductsOrder } from "@/types/productsOrder";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProductsOrderState {
    productsOrder: ProductsOrder | null;
}

const initialState: ProductsOrderState = {
    productsOrder: null,
}

const productsOrderSlice = createSlice({
    name: "productsOrder",
    initialState,
    reducers: {
        setProductsOrder: (state, action) => {
            state.productsOrder = action.payload;
        },

        addProductToOrder: (state, action: PayloadAction<Product>) => {
            if (state.productsOrder) {
                state.productsOrder.products.push(action.payload);
            }
        },

        updateProductInOrder: (state, action: PayloadAction<Product>) => {
            if (state.productsOrder) {
                const index = state.productsOrder.products.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.productsOrder.products[index] = action.payload;
                }
            }
        },

        clearProductsOrder: (state) => {
            state.productsOrder = null;
        }
    }
});

export const { setProductsOrder, addProductToOrder, updateProductInOrder, clearProductsOrder } = productsOrderSlice.actions;
export default productsOrderSlice.reducer;
