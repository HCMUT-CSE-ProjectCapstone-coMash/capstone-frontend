import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	
	return (
		<html lang="en">
			<body className="flex flex-col h-screen">
				<Header/>

				<main className="flex-1">
					{children}
				</main>
				
				<Footer/>
			</body>
		</html>
	);
}
