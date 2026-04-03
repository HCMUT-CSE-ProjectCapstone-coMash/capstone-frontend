import { EmployeeForm } from "@/components/Forms/EmployeeForm";
export default function EmployeeAdd() {
    return (
        <main className="px-20 py-5">
            <div className="flex justify-between items-center mb-12.5">
                <div className="text-purple text-3xl font-medium">Nhân viên</div>
                <button className="border border-purple text-purple font-medium px-3 py-2 rounded-lg text-sm cursor-pointer inline-block text-center hover:bg-purple-50">
                    Danh sách nhân viên
                </button>
            </div>

            <div className="flex flex-column justify-between gap-10">
                <div className="w-1/3">
                    <p className="text-lg mb-2.5">Thông tin nhân viên</p>
                    <div className=" w-75 h-75 bg-tgray05 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-lg text-gray-700 mb-2">
                            Kéo & thả hình ảnh muốn tải lên
                            </p>
                            <button
                            className="text-lg font-medium underline cursor-pointer text-gray-dark"
                            // onClick={openFilePicker}
                            >
                            hoặc từ máy tính của bạn
                            </button>
                        </div>
                    </div>
                </div>
                <div className="w-2/3">
                    <EmployeeForm/>
                </div>
            </div>
        
        </main>
    );
}