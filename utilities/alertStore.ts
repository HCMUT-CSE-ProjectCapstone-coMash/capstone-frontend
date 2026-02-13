import { Alert, AlertType } from "@/types/alert";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

interface AlertState {
    alertQueue: Alert[];
};

const initialState: AlertState = {
    alertQueue: []
};

const alertSlice = createSlice({
    name: "alert",
    initialState,
    reducers: {
        addAlert: (state, action: PayloadAction<{ type: AlertType; message: string | undefined }>) => {
            let newMessage = action.payload.message; 

            if (!newMessage) {
                newMessage = "Có lỗi xảy ra. Vui lòng thử lại."
            }

            state.alertQueue.push({ 
                id: uuidv4(), 
                type: action.payload.type, 
                message: newMessage 
            })
        },

        removeAlert: (state, action: PayloadAction<string>) => {
            state.alertQueue = state.alertQueue.filter((alert) => alert.id != action.payload)
        }
    }
});

export const { addAlert, removeAlert } = alertSlice.actions;
export default alertSlice.reducer;