import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "./providers";
import { AlertContainer } from "@/components/Alert/AlertContainer";
import { cookies } from "next/headers";
import { decrypt } from "@/utilities/session";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const accessToken = (await cookies()).get("accessToken")?.value;
	const session = await decrypt(accessToken);

	return (
		<html lang="en" suppressHydrationWarning>
			<body className="flex flex-col h-screen">
				<Providers userId={session?.sub as string}>
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
