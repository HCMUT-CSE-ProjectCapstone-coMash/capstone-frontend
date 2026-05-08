import { IncomeChart } from "@/components/Charts/IncomeChart";

export default function Home() {

	return (
		<main className="px-20 pt-10 pb-25">
			<div className="grid grid-cols-2">
				<div>
					<IncomeChart />
				</div>
			</div>
		</main>
	);
}