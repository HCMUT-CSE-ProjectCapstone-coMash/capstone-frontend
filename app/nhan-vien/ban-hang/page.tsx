import { InvoiceForm } from "@/components/Forms/InvoiceForm";
import { SellProductsTable } from "@/components/Tables/SellProductsTable";
import { InvoiceSearch } from "@/components/InvoiceSearch";


export default function SellPage() {
    return (
        // Thêm max-w-7xl và mx-auto để khóa form ở giữa màn hình lớn, không bị bè ra quá xa
        <main className="mx-auto px-20 py-10 lg:px-20">
            
            {/* Header: Tiêu đề và Thanh tìm kiếm */}
            <div className="flex justify-between items-center mb-6">
                <p className="text-purple text-2xl font-medium">Bán hàng</p>
                <InvoiceSearch/>
            </div>
            <div className="flex flex-row gap-16">
            
                <div className="flex-2">
                    <SellProductsTable />
                </div>

                {/* Cột phải: Form Hóa Đơn chiếm 1/3 */}
                <div className="flex-1">
                    <InvoiceForm />
                </div>
                
            </div>
        </main>
    );
}