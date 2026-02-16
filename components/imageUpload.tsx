

export function ImageUpload() {


    return (
        <div className={`w-md h-118.75 bg-tgray05 flex items-center justify-center`}>

            <div className="flex flex-col items-center gap-4">
                <p className="text-lg text-gray-700 mb-2">
                    Kéo & thả hình ảnh muốn tải lên
                </p>

                <button className="text-lg font-medium underline cursor-pointer text-gray-dark">
                    hoặc từ máy tính của bạn
                </button>

                <button className="text-lg font-medium underline cursor-pointer text-gray-dark">
                    hoặc từ điện thoại của bạn
                </button>
            </div>
        </div>
    )
}