import { Promotion } from "@/types/promotion";
import { TextInput } from "../FormInputs/TextInput";

export function UpdatePromotionForm({ promotion } : { promotion: Promotion }) {

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    }

    return (
        <form
            className="py-10 flex flex-col gap-6"
            onSubmit={handleSubmit}
        >
            {/* Tên khuyến mãi + Mã khuyến mãi */}
            <div className="grid grid-cols-2 gap-6">
                <TextInput
                    label="Mã khuyến mãi"
                    value={promotion.promotionId}
                    placeHolder=""
                    onChange={() => {}}
                    disabled={true}
                />

                {/* <TextInput
                    label="Tên khuyến mãi"
                    value={promotion.promotionName}
                    placeHolder="Nhập tên khuyến mãi"
                    onChange={(e) => setField("promotionName" ,e.target.value)}
                /> */}
            </div>
        </form>
    )
}