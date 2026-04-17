"use client";
import { ProductsTable } from "@/components/Tables/ProductsTable"
import { RootState } from "@/utilities/store";
import { useDispatch, useSelector } from "react-redux";
import { OwnerUpdateProductForm } from "@/components/Forms/OwnerUpdateProductForm";
import { useEffect } from "react";
import { clearOwnerEditingProduct } from "@/utilities/ownerProductEditStore";

export default function ProductPage() {
    const dispatch = useDispatch();
    const ownerEditProduct = useSelector((state: RootState) => state.ownerProductEdit.ownerEditingProduct);

    useEffect(() => {
        return () => {
            dispatch(clearOwnerEditingProduct());
        };
    }, [dispatch]);

    return (
        <main className="px-20 pt-10 pb-25">
            <div className="flex items-center justify-between mb-5">
                <p className="text-purple text-3xl font-medium">Sản phẩm</p>
                {ownerEditProduct && (
                    <button
                        type="button"
                        onClick={() => dispatch(clearOwnerEditingProduct())}
                        className="py-2 px-4 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/5 hover:cursor-pointer"
                    >
                        Danh sách sản phẩm
                    </button>
                )}
            </div>
            <>
                {ownerEditProduct ? <OwnerUpdateProductForm editProduct={ownerEditProduct} isHasCancelButton={false}/> : <ProductsTable/>}
            </>
        </main>
    )
}