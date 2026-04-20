import { DeleteEmployee } from "@/api/employees/employees";
import { AlertType } from "@/types/alert";
import { addAlert } from "@/utilities/alertStore";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { OwnerEmployeeManagementPageRoute } from "@/const/routes";

interface DeleteEmployeeModalProps {
    employeeId: string;
    onClose: () => void;
}

export function DeleteEmployeeModal({ employeeId, onClose } : DeleteEmployeeModalProps) {
    const router = useRouter();
    const dispatch = useDispatch()

    const deleteMutation = useMutation({
        mutationFn: DeleteEmployee,

        onSuccess: () => {
            // Thông báo thành công
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Xóa nhân viên thành công!" }));
            // Điều hướng về trang danh sách nhân viên
            router.push(OwnerEmployeeManagementPageRoute); // Thay đổi path này cho đúng với project của bạn
        },

        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Xoá nhân viên thất bại" }));
        }
    });

    return (
        <div className="w-lg flex flex-col gap-5 p-5">
            <p className="text-lg text-center">Bạn có chắc chắn muốn xoá nhân viên này?</p>

            <div className="flex items-center justify-center gap-5">
                <button
                    onClick={() => deleteMutation.mutate(employeeId)}
                    className="py-2 px-4 rounded-lg w-20 border border-red-500 bg-red-500 text-white text-sm font-medium transition hover:bg-red-600 hover:cursor-pointer"
                >
                    <p> Xoá </p>
                </button>

                <button
                    onClick={onClose}
                    className="py-2 px-4 rounded-lg w-20 border border-purple bg-purple text-white text-sm font-medium transition hover:bg-purple/80 hover:cursor-pointer"
                >
                    <p> Huỷ </p>
                </button>
            </div>
        </div>
    )
}