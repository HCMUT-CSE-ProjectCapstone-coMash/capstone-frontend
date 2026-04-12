import { axiosClient } from "../axiosClient";

/**
 * Lấy danh sách nhân viên từ endpoint /auth/employees
 * @param currentPage Trang hiện tại
 * @param pageSize Số lượng bản ghi mỗi trang
 * @param search Từ khóa tìm kiếm (tên hoặc SĐT)
 */
export async function FetchEmployees(currentPage: number, pageSize: number, search?: string) {
    // 1. Khởi tạo params để gửi kèm URL
    const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
    });

    // 2. Nếu có từ khóa tìm kiếm thì mới append vào params
    if (search) {
        params.append("search", search);
    }

    // 3. Thực hiện gọi API GET
    const response = await axiosClient.get(
        `/auth/employees?${params}`, 
        { 
            withCredentials: true // Quan trọng để gửi kèm Cookie/Token
        }
    );

    // 4. Trả về dữ liệu từ server (thường là { items: [], total: ... })
    return response.data;
}