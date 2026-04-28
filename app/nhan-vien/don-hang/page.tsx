import { SaleOrdersTable } from "@/components/Tables/SaleOrdersTable";

export default function OrderPage() {

    return (
        <main className="px-20 pt-10 pb-25">
            <div className="flex items-center justify-between mb-5">
                <p className="text-purple text-3xl font-medium">Đơn hàng</p>
            </div>

            <SaleOrdersTable/>
        </main>
    )
}