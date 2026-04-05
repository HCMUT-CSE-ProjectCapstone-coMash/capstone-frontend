"use client";
import { ProductsTable } from "@/components/Tables/ProductsTable"
import { RootState } from "@/utilities/store";
import { useSelector } from "react-redux";
import { OwnerUpdateProductForm } from "@/components/Forms/OwnerUpdateProductForm";

export default function ProductPage() {
    const ownerEditProduct = useSelector((state: RootState) => state.ownerProductEdit.ownerEditingProduct);

    return (
        <main className="px-20 pt-10 pb-25">
            <>
                {ownerEditProduct ? <OwnerUpdateProductForm editProduct={ownerEditProduct}/> : <ProductsTable/>}
            </>
        </main>
    )
}