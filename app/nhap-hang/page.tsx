import { Button } from "@/components/Button";
import { ImageUpload } from "@/components/imageUpload";
import { ImportProductForm } from "@/components/Forms/ImportProductForm";
import { PendingProductsTable } from "@/components/Tables/PendingProductsTable";

export default function ImportPage() {

    return (
        <main className="px-20 pt-10 pb-25">
            <p className="text-purple text-2xl font-medium">Nhập hàng</p>

            <div className="flex justify-between gap-55 mt-5">
                <div>
                    <p>Hình ảnh sản phẩm</p>
                    <ImageUpload/>
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between mb-5">
                        <p>Thông tin sản phẩm</p>
                        <div className="flex items-center gap-3">
                            <Button 
                                label={"Thêm ảnh từ máy tính"} 
                                className={"bg-purple text-white text-sm"} 
                            />

                            <Button 
                                label={"Thêm ảnh từ điện thoại"} 
                                className={"bg-pink text-white text-sm"} 
                            />
                        </div>
                    </div>

                    <ImportProductForm/>
                </div>
            </div>

            <div className="mt-10 flex flex-col gap-5">
                <p className="text-purple text-lg font-medium">
                    Danh sách sản phẩm chưa duyệt
                </p>
                <PendingProductsTable/>
            </div>  
        </main>
    )
}