"use client";

import { useSelector } from "react-redux";
import { ImportProductForm } from "./ImportProductForm";
import { UpdateProductForm } from "./UpdateProductForm";
import { RootState } from "@/utilities/store";

export function ProductForm() {
    const editProduct = useSelector((state: RootState) => state.productEdit.editingProduct);

    return (
        <>        
            {editProduct ? <UpdateProductForm editProduct={editProduct}/> : <ImportProductForm/>}
        </>
    )
}