import { InvoiceForm } from "@/components/Forms/InvoiceForm";
import { SellProductsTable } from "@/components/Tables/SellProductsTable";


export default function SellPage() {
    return (
        <main className="px-20 pt-10 pb-25">
            <div className="relative">
                <p className="text-purple text-3xl font-medium">Bán hàng</p>
                <div className="mt-7 flex justify-between gap-[5vw]">
                    <div className="flex-2">
                        <SellProductsTable/>
                    </div>
                    <div className="flex-1">
                        <InvoiceForm/>
                    </div>
                </div>
            </div>
        </main>
    );
}