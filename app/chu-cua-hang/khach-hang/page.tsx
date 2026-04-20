import CustomerTable from "@/components/Tables/CustomerTable"

export default function CustomerPage() {
    
    return (
       <main className="px-20 pt-10 pb-25">
           <p className="text-purple text-3xl font-medium mb-10.25">Danh sách khách hàng</p>
           <CustomerTable />
       </main>
    )
}