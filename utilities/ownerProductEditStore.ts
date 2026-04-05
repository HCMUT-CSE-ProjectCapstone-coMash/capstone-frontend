import { Product } from "@/types/product";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OwnerProductEditState {
    ownerEditingProduct: Product | null;
};

const initialState : OwnerProductEditState = {
    ownerEditingProduct: null,
};

const ownerProductEditSlice = createSlice({
    name: "ownerProductEdit",
    initialState,
    reducers: {
        setOwnerEditingProduct: (state, action: PayloadAction<Product>) => {
            state.ownerEditingProduct = action.payload;
        },

        clearOwnerEditingProduct: (state) => {
            state.ownerEditingProduct = null;
        }
    }
});

export const { setOwnerEditingProduct, clearOwnerEditingProduct } = ownerProductEditSlice.actions;
export default ownerProductEditSlice.reducer;