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

        // // Thêm nhân viên mới
        // addEmployee: (state, action: PayloadAction<Employee>) => {
        //     state.employees.push(action.payload);
        // },

        // // Cập nhật thông tin nhân viên
        // updateEmployee: (state, action: PayloadAction<Employee>) => {
        //     const index = state.employees.findIndex(e => e.id === action.payload.id);
        //     if (index !== -1) {
        //         state.employees[index] = action.payload;
        //     }
        //     // Nếu đang sửa chính nhân viên này thì cập nhật luôn selectedEmployee
        //     if (state.selectedEmployee?.id === action.payload.id) {
        //         state.selectedEmployee = action.payload;
        //     }
        // },

        // // Xóa nhân viên khỏi danh sách
        // removeEmployee: (state, action: PayloadAction<string>) => {
        //     state.employees = state.employees.filter(e => e.id !== action.payload);
        // },

        // // Chọn nhân viên để chỉnh sửa
        // setSelectedEmployee: (state, action: PayloadAction<EmployeeFormState | Employee | null>) => {
        //     state.selectedEmployee = action.payload;
        // },

        // // Reset store về trạng thái ban đầu
        clearEmployee: (state) => {
            state.selectedEmployee = null;
        }
    }
});

export const { setEmployee, clearEmployee } = employeeSlice.actions;

export default employeeSlice.reducer;