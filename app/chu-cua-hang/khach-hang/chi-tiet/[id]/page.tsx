"use client";

import { useRouter } from "next/navigation";
import { OwnerCustomerPageRoute} from "@/const/routes";
import { DetailCustomerByIdForm } from "@/components/Forms/DetailCustomerByIdForm";

export default function CustomerDetailPage() {
    const router = useRouter();

    return (
        <main className="px-20 pt-10 pb-25">
            <div className="flex justify-between items-center mb-12.5">
                <div className="text-purple text-3xl font-medium">Khách hàng</div>
                <button
                    onClick={() => router.push(`${OwnerCustomerPageRoute}`)}
                    className="border border-purple text-purple font-medium px-3 py-2 rounded-lg text-sm cursor-pointer inline-block text-center hover:bg-purple-50"
                >
                    Danh sách khách hàng
                </button>
            </div>
            <DetailCustomerByIdForm />
        </main>
    );
}