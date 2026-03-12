import type { Product } from "@/types/product"
import { createSlice } from "@reduxjs/toolkit";

interface ProductEditState {
    editingProduct: Product | null;
}

const initialState: ProductEditState = {
    editingProduct: null,
}

const productEditSlice = createSlice({
    name: "productEdit",
    initialState,
    reducers: {
        setEditingProduct: (state, action) => {
            state.editingProduct = action.payload;
        },
        clearEditingProduct: (state) => {
            state.editingProduct = null;
        }
    }
});

export const { setEditingProduct, clearEditingProduct } = productEditSlice.actions;
export default productEditSlice.reducer;