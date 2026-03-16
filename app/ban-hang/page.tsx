import { InvoiceForm } from "@/components/Forms/InvoiceForm"
export default function SellPage() {

    return (
        <main className="px-20 pt-10 pb-25">
            <p className="text-purple text-2xl font-medium">Bán hàng</p>
            <div className="flex gap-[10vw]">
                <p className="text-2xl font-medium">Bảng</p>
                <InvoiceForm/>
            </div>
        </main>
    )
}