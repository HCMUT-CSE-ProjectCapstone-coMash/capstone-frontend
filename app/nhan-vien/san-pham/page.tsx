import { ProductsTable } from "@/components/Tables/ProductsTable"

export default function ProductPage() {

    return (
        <main className="px-20 pt-10 pb-25">
            <p className="text-purple text-3xl font-medium mb-5">Sản phẩm</p>

            <ProductsTable/>
        </main>
    )
}