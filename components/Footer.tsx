import { PhoneIcon } from "@/public/assets/Icons";

export function Footer() {

    return (
        <footer className="bg-pink flex justify-end items-center px-40 py-2.5 font-display text-white text-sm">
            <div className="flex gap-x-2">
                <PhoneIcon width={18} height={18} fill={"none"} />
                <div>Liên hệ hỗ trợ</div>
                <div>(090 - 181 - 1306)</div>
            </div>
        </footer>
    )
}