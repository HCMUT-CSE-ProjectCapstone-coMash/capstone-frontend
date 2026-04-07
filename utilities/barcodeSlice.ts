import { ProductQuantity } from "@/types/product";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

function MakeKey(id: string, size: string): string {
    return `${id}-${size}`;
}

interface BarcodeEntry {
    id: string;
    productId: string;
    productName: string;
    category: string;
    color: string;
    pattern: string | null;
    salePrice: number;
    quantities: ProductQuantity[];
}

interface BarcodeState {
    entries: BarcodeEntry[];
};

const initialState: BarcodeState = {
    entries: [],
};

const barcodeSlide = createSlice({
    name: "barcode",
    initialState,
    reducers: {
        addBarcode(state, action: PayloadAction<BarcodeEntry>) {
            if(!state.entries.some((e) => e.id === action.payload.id)) {
                state.entries.push(action.payload);
            }
        },

        removeBarcode(state, action: PayloadAction<{ id: string }>) {
            state.entries = state.entries.filter((e) => e.id !== action.payload.id);
        },

        clearBarCode(state) {
            state.entries = [];
        }
    }
});

export const { addBarcode, removeBarcode, clearBarCode } = barcodeSlide.actions;
export default barcodeSlide.reducer;