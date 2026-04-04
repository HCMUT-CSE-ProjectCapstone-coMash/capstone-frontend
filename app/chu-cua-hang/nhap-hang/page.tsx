import { OwnerImportProductForm } from "@/components/Forms/OwnerImportProductForm"

export default function ImportPage() {

    return (
        <main className="px-20 pt-10 pb-25">
            <p className="text-purple text-3xl font-medium">Nhập hàng</p>

            <div className="mt-5">
                <OwnerImportProductForm/>
            </div>
        </main>
    )
}