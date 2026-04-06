"use client";
import { ProductOrderTable } from "@/components/Tables/ProductOrderTable";
import { RootState } from "@/utilities/store";
import { useSelector } from "react-redux";
import { UpdateProductForm } from "@/components/Forms/UpdateProductForm";

export default function ProductOrderDetailPage() {
    const editProduct = useSelector((state: RootState) => state.productEdit.editingProduct);

    return (
        <main className="px-20 pt-10 pb-25">
            <>
                {editProduct ? <UpdateProductForm editProduct={editProduct}/> : <ProductOrderTable/>}
            </>
        </main>
    )
}