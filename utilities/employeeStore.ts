import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Employee, EmployeeFormState } from "@/types/employee";

interface EmployeeState {
    employees: Employee[];
    selectedEmployee: EmployeeFormState | Employee | null; // Dùng khi cần Edit hoặc xem chi tiết
}

const initialState: EmployeeState = {
    employees: [],
    selectedEmployee: null,
};

const employeeSlice = createSlice({
    name: "employee",
    initialState,
    reducers: {
        // Gán toàn bộ danh sách nhân viên (thường dùng sau khi fetch API)
        setEmployees: (state, action: PayloadAction<Employee[]>) => {
            state.employees = action.payload;
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

        // Xóa nhân viên khỏi danh sách
        removeEmployee: (state, action: PayloadAction<string>) => {
            state.employees = state.employees.filter(e => e.id !== action.payload);
        },

        // Chọn nhân viên để chỉnh sửa
        setSelectedEmployee: (state, action: PayloadAction<EmployeeFormState | Employee | null>) => {
            state.selectedEmployee = action.payload;
        },

        // Reset store về trạng thái ban đầu
        clearEmployeeStore: (state) => {
            state.employees = [];
            state.selectedEmployee = null;
        }
    }
});

export const { 
    setEmployees,  
    removeEmployee, 
    setSelectedEmployee,
    clearEmployeeStore 
} = employeeSlice.actions;

export default employeeSlice.reducer;