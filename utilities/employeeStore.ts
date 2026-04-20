import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Employee } from "@/types/employee";

interface EmployeeState {
    selectedEmployee: Employee | null; 
}

const initialState: EmployeeState = {
    selectedEmployee: null,
};

const employeeSlice = createSlice({
    name: "employee",
    initialState,
    reducers: {
        // Gán toàn bộ danh sách nhân viên (thường dùng sau khi fetch API)
        setEmployee: (state, action: PayloadAction<Employee>) => {
            state.selectedEmployee = action.payload;
        },

        // // Reset store về trạng thái ban đầu
        clearEmployee: (state) => {
            state.selectedEmployee = null;
        }
    }
});

export const { setEmployee, clearEmployee } = employeeSlice.actions;

export default employeeSlice.reducer;