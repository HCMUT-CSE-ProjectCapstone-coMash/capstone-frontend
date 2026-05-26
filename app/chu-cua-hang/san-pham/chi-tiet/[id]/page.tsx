"use client";

import { FetchProductById } from "@/api/products/products";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail/ProductDetail";
import { OwnerProductPageRoute } from "@/const/routes";

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const { data } = useQuery({
        queryKey: ["productDetail", id],
        queryFn: () => FetchProductById(id as string),
        enabled: !!id,
        refetchOnWindowFocus: false,
    });
    
    return (
        <main className="px-20 pt-10 pb-25">
            <div className="flex items-center justify-between mb-5">
                <p className="text-purple text-3xl font-medium">Chi tiết sản phẩm</p>

                <button
                    type="button"
                    onClick={() => router.replace(OwnerProductPageRoute)}
                    className="py-2 px-4 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/5 hover:cursor-pointer"
                >
                    Danh sách sản phẩm
                </button>
            </div>

            {data && <ProductDetail key={JSON.stringify(data)} product={data} />}
        </main>
    )
}