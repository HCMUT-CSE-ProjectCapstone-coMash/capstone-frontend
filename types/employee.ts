export type Employee = {
    id: string;
    employeeId: string; // Mã số nhân viên (được tạo tự động)
    fullName: string;
    gender: string;
    dateOfBirth: string;
    phoneNumber: string;
    email: string;
    imageUrl?: string; // Lưu URL ảnh từ server
};

// Kiểu dữ liệu cho Form (Kế thừa từ Employee nhưng bỏ id và thêm các trường xử lý ảnh)
export interface EmployeeFormState extends Omit<Employee, "id"> {
    imageFile: File | null;      // Dùng để gửi lên server qua FormData
    imagePreviewUrl: string | null; // Dùng để hiển thị ảnh đã có sẵn (khi sửa)
}