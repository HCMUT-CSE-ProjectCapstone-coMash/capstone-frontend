import "./globals.css";
import Header from "@/components/Header";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	
	return (
		<html lang="en">
			<body className="flex flex-col h-screen">
				<Header/>
				<main className="flex-1">
					{children}
				</main>
			</body>
		</html>
	);
}
