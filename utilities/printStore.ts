import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PrintState {
    selectedIds: string[];
}

const initialState: PrintState = {
    selectedIds: [],
};

const printSlice = createSlice({
    name: "print",
    initialState,
    reducers: {
        toggleProductId(state, action: PayloadAction<string>) {
            const id = action.payload;
            const index = state.selectedIds.indexOf(id);
            if (index === -1) {
                state.selectedIds.push(id);
            } else {
                state.selectedIds.splice(index, 1);
            }
        },
        clearSelectedIds(state) {
            state.selectedIds = [];
        },
    },
});

export const { toggleProductId, clearSelectedIds } = printSlice.actions;
export default printSlice.reducer;