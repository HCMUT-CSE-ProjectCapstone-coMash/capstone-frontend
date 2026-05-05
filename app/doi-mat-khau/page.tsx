import { ChangePasswordForm } from "@/components/Forms/ChangePasswordForm";
import Image from "next/image";

export default function ChangePasswordPage() {

    return (
        <div className="flex justify-center items-center h-full">
            <div className="w-7xl flex items-center justify-center">
                <div className="flex-4 flex items-center justify-center">
                    <Image width={526} height={432} src={"/assets/image/loginImg.png"} alt="Illustration" priority/>
                </div>

                <div className="flex-3">
                    <ChangePasswordForm/>
                </div>
            </div>
        </div>
    );
}