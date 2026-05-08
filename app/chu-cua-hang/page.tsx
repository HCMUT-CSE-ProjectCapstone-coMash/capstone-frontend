import { IncomeChart } from "@/components/Charts/IncomeChart";
import { TopCustomerChart } from "@/components/Charts/TopCustomerChart";

export default function Home() {

	return (
		<main className="px-20 pt-10 pb-25">
			<div className="grid grid-cols-3 gap-x-10">
				<div className="col-span-2">
					<IncomeChart />
				</div>

				<div className="col-span-1">
					<TopCustomerChart />
				</div>
			</div>
		</main>
	);
}