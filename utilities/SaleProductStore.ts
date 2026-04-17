import { Customer } from "@/types/customer";
import { Product } from "@/types/product";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SaleProduct extends Product {
    quantity: number;
    discount: number;
    selectedSize: string;
};

interface SaleProductState {
    products: SaleProduct[];
    customer?: Customer;
};

const initialState: SaleProductState = {
    products: []
};

const SaleProductSlice = createSlice({
    name: "saleProduct",
    initialState,
    reducers: {
        addProduct: (state, action: PayloadAction<SaleProduct>) => {
            // VAY-6-M and VAY-6-L are treated as separate items
            const exists = state.products.find(
                (p) => p.productId === action.payload.productId && p.selectedSize === action.payload.selectedSize
            );
            if (exists) {
                exists.quantity += 1;
            } else {
                state.products.push({ ...action.payload, quantity: 1 });
            }
        },

        removeProduct: (state, action: PayloadAction<{ productId: string; selectedSize: string }>) => {
            state.products = state.products.filter(
                (p) => !(p.productId === action.payload.productId && p.selectedSize === action.payload.selectedSize)
            );
        },

        updateQuantity: (state, action: PayloadAction<{ productId: string; selectedSize: string; quantity: number }>) => {
            const product = state.products.find(
                (p) => p.productId === action.payload.productId && p.selectedSize === action.payload.selectedSize
            );
            if (product) {
                product.quantity = Math.max(1, action.payload.quantity);
            }
        },

        updateDiscount: (state, action: PayloadAction<{ productId: string; selectedSize: string; discount: number }>) => {
            const product = state.products.find(
                (p) => p.productId === action.payload.productId && p.selectedSize === action.payload.selectedSize
            );
            if (product) {
                product.discount = Math.min(100, Math.max(0, action.payload.discount));
            }
        },

        clearSaleProducts: (state) => {
            state.products = [];
            state.customer = undefined;
        },

        setCustomer: (state, action: PayloadAction<Customer | undefined>) => {
            state.customer = action.payload;
        }
    }
});

export const { addProduct, removeProduct, updateQuantity, updateDiscount, clearSaleProducts, setCustomer} = SaleProductSlice.actions;
export default SaleProductSlice.reducer;