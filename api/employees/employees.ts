import { axiosClient } from "../axiosClient";

/**
 * Lấy danh sách nhân viên kết hợp tìm kiếm và phân trang
 * @param currentPage Trang hiện tại
 * @param pageSize Số lượng bản ghi mỗi trang
 * @param search Từ khóa tìm kiếm (tên hoặc SĐT)
 */
export async function FetchEmployees(currentPage: number, pageSize: number, search?: string) {
    const response = await axiosClient.get("/auth/employees", {
        // Axios sẽ tự động nối các params này thành: /auth/employees?page=1&pageSize=10&search=...
        params: {
            page: currentPage,
            pageSize: pageSize,
            // Nếu search là rỗng hoặc undefined, Axios sẽ tự động loại bỏ nó khỏi URL
            search: search || undefined, 
        },
        withCredentials: true 
    });

    // Vì Backend đang trả về mảng trực tiếp [...], response.data sẽ là mảng đó
    return response.data;
}