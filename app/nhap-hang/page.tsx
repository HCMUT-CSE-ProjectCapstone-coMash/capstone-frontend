import { ProductForm } from "@/components/Forms/ProductForm";
import { PendingProductsTable } from "@/components/Tables/PendingProductsTable";

export default function ImportPage() {

    return (
        <main className="px-20 pt-10 pb-25">
            <p className="text-purple text-2xl font-medium">Nhập hàng</p>

            <div className="mt-5">
                <ProductForm/>
            </div>

            <div className="mt-10 flex flex-col gap-5">
                <p className="text-purple text-lg font-medium">
                    Danh sách sản phẩm chưa duyệt
                </p>
                <PendingProductsTable/>
            </div>  
        </main>
    )
}