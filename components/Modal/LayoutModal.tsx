import { CloseLineIcon } from "@/public/assets/Icons";
import { useEffect } from "react";

interface LayoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function LayoutModal({ isOpen, onClose, children }: LayoutModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-5 flex items-center justify-center bg-black/50">
            <div 
                className="bg-white rounded-xl p-6 shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute right-3 top-3 cursor-pointer"
                    onClick={onClose}
                >
                    <CloseLineIcon width={24} height={24} className=""/>
                </button>

                {children}
            </div>
        </div>
    )
}