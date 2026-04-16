import { axiosClient } from "../axiosClient";
import { EmployeeFormState } from "@/types/employee";

/**
 * Lấy danh sách nhân viên kết hợp tìm kiếm và phân trang
 * @param currentPage Trang hiện tại
 * @param pageSize Số lượng bản ghi mỗi trang
 * @param search Từ khóa tìm kiếm (tên hoặc SĐT)
 */
export async function FetchEmployees(currentPage: number, pageSize: number, search?: string) {
    const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
    });
    if (search) params.append("search", search);

    const response = await axiosClient.get(
        `/auth/employees?${params}`,
        { withCredentials: true }
    );

    return response.data;
}

export async function GetNewEmployeeId() {
    const response = await axiosClient.get("/auth/create-employee-id", {
        withCredentials: true
    });
    return response.data; 
}

export async function CreateEmployeeAsync(employeeData: EmployeeFormState) {
    const formData = new FormData();

    // Map các trường từ State sang Key mà Backend mong đợi (PascalCase)
    formData.append("FullName", employeeData.fullName);
    formData.append("Gender", employeeData.gender);
    formData.append("DateOfBirth", employeeData.dateOfBirth);
    formData.append("PhoneNumber", employeeData.phoneNumber);
    formData.append("Email", employeeData.email);

    // Xử lý hình ảnh nếu có
    if (employeeData.imageFile) {
        formData.append("Image", employeeData.imageFile);
    }

    const response = await axiosClient.post(
        "/auth/register", 
        formData,
        { 
            withCredentials: true,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
};