import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Customer } from "@/types/customer";

interface CustomerState {
    selectedCustomer: Customer | null; 
}

const initialState: CustomerState = {
    selectedCustomer: null,
};

const customerSlice = createSlice({
    name: "customer",
    initialState,
    reducers: {
        // Gán toàn bộ danh sách khách hàng (thường dùng sau khi fetch API)
        setCustomer: (state, action: PayloadAction<Customer>) => {
            state.selectedCustomer = action.payload;
        },

        // // Reset store về trạng thái ban đầu
        clearCustomer: (state) => {
            state.selectedCustomer = null;
        }
    }
});

export const { setCustomer, clearCustomer } = customerSlice.actions;

export default customerSlice.reducer;