import { axiosClient } from "../axiosClient";


/**
 * Lấy danh sách khách hàng kết hợp tìm kiếm và phân trang
 * @param currentPage Trang hiện tại
 * @param pageSize Số lượng bản ghi mỗi trang
 * @param search Từ khóa tìm kiếm (tên hoặc SĐT)
 */
export async function FetchCustomers(currentPage: number, pageSize: number, search?: string) {
    const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
    });
    if (search) params.append("search", search);

    const response = await axiosClient.get(
        `/customers/fetch-all?${params}`,
        { withCredentials: true }
    );

    return response.data;
}