import { InvoiceForm } from "@/components/Forms/InvoiceForm";
import { SellProductsTable } from "@/components/Tables/SellProductsTable";
import { SearchIcon } from "@/public/assets/Icons";


export default function SellPage() {
    return (
        // Thêm max-w-7xl và mx-auto để khóa form ở giữa màn hình lớn, không bị bè ra quá xa
        <main className="mx-auto px-20 py-10 lg:px-20">
            
            {/* Header: Tiêu đề và Thanh tìm kiếm */}
            <div className="flex justify-between items-center mb-6">
                <p className="text-purple text-2xl font-medium">Bán hàng</p>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon width={24} height={24} className="text-tgray9" />
                    </div>
                    <input
                        type="text"
                        className="block w-80 py-2.5 pl-12 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder="Nhập số điện thoại khách hàng"
                    />
                </div>
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