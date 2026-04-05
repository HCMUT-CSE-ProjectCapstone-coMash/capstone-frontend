"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GetProductsOrderById, DeleteProductFromProductsOrders } from "@/api/productsOrder/productsOrder";
import { ProductsOrder } from "@/types/productsOrder";
import { ProductOrderTable } from "@/components/Tables/ProductOrderTable";
import { useDispatch } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";

export default function ProductOrderDetailPage() {
    const router = useRouter();
    const { productsOrdersId } = useParams();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const { data: order} = useQuery<ProductsOrder>({
        queryKey: ["productsOrder", productsOrdersId],
        queryFn: () => GetProductsOrderById(productsOrdersId as string),
        enabled: !!productsOrdersId,
    });
    // console.log(order);

    const deleteMutation = useMutation({
        mutationFn: (productId: string) => DeleteProductFromProductsOrders(productsOrdersId as string, productId),
        onSuccess: () => {
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Sản phẩm đã được xóa khỏi đơn hàng" }));
            queryClient.invalidateQueries({ queryKey: ["productsOrder", productsOrdersId] });
        },
        onError: (error: any) => {
            dispatch(addAlert({ type: AlertType.ERROR, message: error.response?.data?.message || "Lỗi khi xóa sản phẩm" }));
        },
    });

    const handleDeleteProduct = (productId: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi đơn hàng?")) {
            deleteMutation.mutate(productId);
        }
    };

    return (
        <main className="px-20 pt-10 pb-25">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-purple text-2xl font-medium">{order?.orderName || "Product Order Details"}</p>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="py-2 px-4 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/5 hover:cursor-pointer"
                >
                    Danh sách sản phẩm chờ duyệt
                </button>
            </div>

            {order && (
                <div className="mt-6">
                    <ProductOrderTable
                        data={order.products}
                        isLoading={false}
                        onDelete={handleDeleteProduct}
                    />
                </div>
            )}
        </main>
    )
}