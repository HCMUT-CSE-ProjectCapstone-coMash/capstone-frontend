"use client";

import { useSelector } from "react-redux";
import { ImportProductForm } from "./ImportProductForm";
import { UpdateProductForm } from "./UpdateProductForm";
import { OwnerImportProductForm } from "./OwnerImportProductForm";
import { OwnerUpdateProductForm } from "./OwnerUpdateProductForm";
import { RootState } from "@/utilities/store";

export function ProductForm() {
    const user = useSelector((state: RootState) => state.user);
    const editProduct = useSelector((state: RootState) => state.productEdit.editingProduct);
    const ownerEditProduct = useSelector((state: RootState) => state.ownerProductEdit.ownerEditingProduct);

    return user.role === "employee"
        ? (editProduct ? <UpdateProductForm editProduct={editProduct}/> : <ImportProductForm/>)
        : (ownerEditProduct ? <OwnerUpdateProductForm editProduct={ownerEditProduct}/> : <OwnerImportProductForm/>);
}