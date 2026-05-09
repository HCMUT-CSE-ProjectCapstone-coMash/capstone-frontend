import { IncomeChart } from "@/components/Charts/IncomeChart";
import { TopCustomerChart } from "@/components/Charts/TopCustomerChart";
import { DebtCustomerTable } from "@/components/Tables/DebtCustomerTable";
import { LowStockTable } from "@/components/Tables/LowStockTable";

export default function Home() {
    return (
        <main className="px-20 pt-10 pb-25">
            <div className="grid grid-cols-3 gap-4">

                <div className="col-span-2 border border-gray-300 rounded-2xl p-4">
                    <IncomeChart />
                </div>

                <div className="col-span-1 border border-gray-300 rounded-2xl p-4">
                    <TopCustomerChart />
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="border border-gray-300 rounded-2xl p-4">
                        <LowStockTable />
                    </div>
                    <div className="border border-gray-300 rounded-2xl p-4">
                        <DebtCustomerTable />
                    </div>
                </div>

                <div className="col-span-1 border border-gray-300 rounded-2xl p-4">
                    {/* placeholder */}
                </div>

            </div>
        </main>
    );
}