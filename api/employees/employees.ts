import { axiosClient } from "../axiosClient";
import { EmployeeFormState } from "@/types/employee";

/**
 * Lấy danh sách nhân viên kết hợp tìm kiếm và phân trang
 * @param currentPage Trang hiện tại
 * @param pageSize Số lượng bản ghi mỗi trang
 * @param search Từ khóa tìm kiếm (tên hoặc SĐT)
 */
export async function FetchEmployees(currentPage: number, pageSize: number, search?: string) {
    const response = await axiosClient.get("/auth/employees?${params}", {
        params: {
            page: currentPage,
            pageSize: pageSize,
            // Nếu search là rỗng hoặc undefined, Axios sẽ tự động loại bỏ nó khỏi URL
            search: search || undefined, 
        },
        withCredentials: true 
    });

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