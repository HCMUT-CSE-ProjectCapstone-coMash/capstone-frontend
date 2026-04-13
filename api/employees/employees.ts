import { axiosClient } from "../axiosClient";

/**
 * Lấy danh sách nhân viên kết hợp tìm kiếm và phân trang
 * @param currentPage Trang hiện tại
 * @param pageSize Số lượng bản ghi mỗi trang
 * @param search Từ khóa tìm kiếm (tên hoặc SĐT)
 */
export async function FetchEmployees(currentPage: number, pageSize: number, search?: string) {
    const response = await axiosClient.get("/auth/employees", {
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