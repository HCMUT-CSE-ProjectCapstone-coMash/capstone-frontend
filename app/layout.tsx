import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "./providers";
import { AlertContainer } from "@/components/Alert/AlertContainer";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	
	return (
		<html lang="en">
			<body className="flex flex-col h-screen">
				<Providers>
					<Header/>

					<AlertContainer/>
					
					<main className="flex-1">
						{children}
					</main>
					
					<Footer/>
				</Providers>
			</body>
		</html>
	);
}
