import { OwnerDeleteProduct } from "@/api/products/products";
import { AlertType } from "@/types/alert";
import { addAlert } from "@/utilities/alertStore";
import { clearOwnerEditingProduct } from "@/utilities/ownerProductEditStore";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

interface DeleteProductModalProps {
    productId: string;
    onClose: () => void;
}

export function DeleteProductModal({ productId, onClose } : DeleteProductModalProps) {
    const dispatch = useDispatch()

    const deleteMutation = useMutation({
        mutationFn: (productId: string) => OwnerDeleteProduct(productId),

        onSuccess: (data) => {
            dispatch(addAlert({ type: AlertType.SUCCESS, message: `Xoá thành công ${data.productName}` }));
            dispatch(clearOwnerEditingProduct());
        },

        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Xoá sản phẩm thất bại" }));
        }
    });

    return (
        <div className="w-lg flex flex-col gap-5 p-5">
            <p className="text-lg text-center">Bạn có chắc chắn muốn xoá sản phẩm này?</p>

            <div className="flex items-center justify-center gap-5">
                <button
                    onClick={() => deleteMutation.mutate(productId)}
                    disabled={deleteMutation.isPending}
                    className="py-2 px-4 rounded-lg w-35 border border-red-500 bg-red-500 text-white text-sm font-medium transition hover:bg-red-600 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <p> {deleteMutation.isPending ? "Đang xoá..." : "Xoá"} </p>
                </button>

                <button
                    onClick={onClose}
                    className="py-2 px-4 rounded-lg w-35 border border-purple bg-purple text-white text-sm font-medium transition hover:bg-purple/80 hover:cursor-pointer"
                >
                    <p> Huỷ </p>
                </button>
            </div>
        </div>
    )
}