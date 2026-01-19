import Image from "next/image";
import { LoginForm } from "@/components/Forms/LoginForm";

export default function LoginPage() {

    return (
		<div className="flex justify-center items-center h-full">
			<div className="w-7xl flex items-center justify-center">
				<div className="flex-4 flex items-center justify-center">
                    <Image width={526} height={432} src={"/image/loginImg.png"} alt="Illustration" priority/>
                </div>

				<div className="flex-3">
                    <LoginForm/>
                </div>
			</div>
		</div>
    );
}