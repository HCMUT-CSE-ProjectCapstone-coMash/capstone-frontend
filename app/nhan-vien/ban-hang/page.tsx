import { InvoiceForm } from "@/components/Forms/InvoiceForm";
import { SellProductsTable } from "@/components/Tables/SellProductsTable";
// import { InvoiceSearch } from "@/components/SearchBar/InvoiceSearch";


export default function SellPage() {
    return (
        <main className="px-20 pt-10 pb-25">
            <p className="text-purple text-3xl font-medium">Bán hàng</p>
            <div className="flex justify-between gap-[10vw]">
                <div className="w-1/3">
                    <SellProductsTable/>
                </div>
                <div className="w-2/3">
                    <InvoiceForm/>
                </div>
            </div>
        </main>
    );
}