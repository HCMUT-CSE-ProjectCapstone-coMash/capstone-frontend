import { pinkPlaceholder } from "@/const/placeholder";
import { sizesLetter, sizesNumber } from "@/const/product";
import { Category, Color, Pattern, Product, UpdateProduct } from "@/types/product"
import Image from "next/image";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { TextInput } from "../FormInputs/TextInput";
import { formatThousands, parseFormattedNumber } from "@/utilities/numberFormat";
import { SelectInput } from "../FormInputs/SelectInput";
import { SwitchInput } from "../FormInputs/SwitchInput";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { FetchAllCategories, FetchAllColors, FetchAllPatterns, GenerateModalImage, OwnerUpdateProduct } from "@/api/products/products";
import { AlertType } from "@/types/alert";
import { addAlert } from "@/utilities/alertStore";
import { LayoutModal } from "../Modal/LayoutModal";
import { DeleteProductModal } from "../Modal/DeleteProductModal";

interface FormState {
    productId: string;
    productName: string;
    categoryId: string;
    colorId: string;
    patternId: string;
    isNumberSize: boolean;
    letterQuantities: Record<string, number>;
    numberQuantities: Record<string, number>;
    imagePreviewUrl: string | null;
    imageModalPreviewUrl: string | null;
    status: "Pending" | "Approved";
    salePrice: number;
    importPrice: number;
}

const createInitialQuantities = (sizes: string[]) => Object.fromEntries(sizes.map((size) => [size, 0]));

const mapProductToForm = (
    product: Product,
    categories: Category[] = [],
    colors: Color[] = [],
    patterns: Pattern[] = []
): FormState => {
    const isNumber = product.sizeType === "Number";
    const sizes = isNumber ? sizesNumber : sizesLetter;

    const quantityMap = createInitialQuantities(sizes);
    product.quantities.forEach((qty) => { quantityMap[qty.size] = qty.quantities; });

    if (product.quantityChanges && product.quantityChanges.length > 0) {
        product.quantityChanges.forEach((change) => { quantityMap[change.size] = change.newQuantity; });
    }

    const categoryId = categories.find(c => c.categoryName === product.category)?.id ?? "";
    const colorId = colors.find(c => c.colorName === product.color)?.id ?? "";
    const patternId = patterns.find(p => p.patternName === product.pattern)?.id ?? "";

    return {
        productId: product.productId,
        productName: product.productName,
        categoryId,
        colorId,
        patternId,
        isNumberSize: isNumber,
        letterQuantities: isNumber ? createInitialQuantities(sizesLetter) : quantityMap,
        numberQuantities: isNumber ? quantityMap : createInitialQuantities(sizesNumber),
        imagePreviewUrl: product.imageURL ?? null,
        imageModalPreviewUrl: product.modelImageURL ?? null,
        status: product.status,
        salePrice: product.salePrice,
        importPrice: product.importPrice,
    };
};

type ProductDetailProps = { product: Product; }

function ProductDetailInner({ product, categories, colors, patterns }: {
    product: Product;
    categories: Category[];
    colors: Color[];
    patterns: Pattern[];
}) {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isGenerateImageModalOpen, setGenerateImageModalOpen] = useState(false);

    const categoryOptions = categories.map((c: Category) => ({ label: c.categoryName, value: c.id }));
    const colorOptions = colors.map((c: Color) => ({ label: c.colorName, value: c.id }));
    const patternOptions = patterns.map((p: Pattern) => ({ label: p.patternName, value: p.id }));

    const [form, setForm] = useState<FormState>(() => mapProductToForm(product, categories, colors, patterns));

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const isUnchanged = JSON.stringify(form) === JSON.stringify(mapProductToForm(product, categories, colors, patterns));

    const sizes = form.isNumberSize ? sizesNumber : sizesLetter;
    const quantities = form.isNumberSize ? form.numberQuantities : form.letterQuantities;

    const handleQuantityChange = (size: string, value: number) => {
        const key = form.isNumberSize ? "numberQuantities" : "letterQuantities";
        setForm((prev) => ({ ...prev, [key]: { ...prev[key], [size]: value } }));
    };

    const createModalImageMutation = useMutation({
        mutationFn: () => GenerateModalImage(product.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productDetail", product.id] });
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Tạo mẫu ảnh thành công" }));
            setGenerateImageModalOpen(true);
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Tạo mẫu ảnh thất bại" }));
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ updateData, productId }: { updateData: UpdateProduct; productId: string }) => OwnerUpdateProduct(updateData, productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productDetail", product.id] });
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Cập nhật sản phẩm thành công" }));
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Cập nhật sản phẩm thất bại" }));
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.productName) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập tên sản phẩm" }));
            return;
        }
        if (!form.categoryId) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui chọn phân loại" }));
            return;
        }
        if (!form.colorId) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng chọn màu" }));
            return;
        }

        const sizeQuantities = form.isNumberSize ? form.numberQuantities : form.letterQuantities;
        const formattedQuantities = Object.entries(sizeQuantities)
            .filter(([, qty]) => qty > 0)
            .map(([size, qty]) => ({ size, quantities: qty }));

        if (formattedQuantities.length === 0) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập số lượng cho ít nhất một size" }));
            return;
        }

        const updateData: UpdateProduct = {
            productId: form.productId,
            productName: form.productName,
            categoryId: form.categoryId,
            colorId: form.colorId,
            patternId: form.patternId,
            sizeType: form.isNumberSize ? "Number" : "Letter",
            quantities: formattedQuantities,
            importPrice: form.importPrice,
            salePrice: form.salePrice,
        };

        updateMutation.mutate({ updateData, productId: product.id });
    };

    const handleDownload = async () => {
        if (!form.imageModalPreviewUrl) return;
        try {
            const response = await fetch(form.imageModalPreviewUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${form.productName}_mau_anh.jpg`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Tải ảnh thất bại" }));
        }
    };

    return (
        <div className="flex gap-[10vw]">
            <div>
                <div className="flex items-center justify-between">
                    <p>Hình ảnh sản phẩm</p>
                    {form.imageModalPreviewUrl ? (
                        <button type="button" className="py-2 px-3 rounded-lg text-white bg-pink text-sm cursor-pointer" onClick={() => setGenerateImageModalOpen(true)}>
                            Xem mẫu ảnh
                        </button>
                    ) : (
                        <button type="button" className="py-2 px-3 rounded-lg text-white bg-pink text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-60" disabled={createModalImageMutation.isPending} onClick={() => createModalImageMutation.mutate()}>
                            {createModalImageMutation.isPending ? "Đang tải..." : "Tạo mẫu ảnh"}
                        </button>
                    )}
                </div>
                <div className="w-md">
                    <div className="relative group h-118.75 w-full mt-3">
                        {form.imagePreviewUrl ? (
                            <Image src={form.imagePreviewUrl} alt="" fill className="object-cover" unoptimized placeholder="blur" blurDataURL={pinkPlaceholder} />
                        ) : (
                            <div className="w-full h-full bg-gray-100 rounded-lg" />
                        )}
                    </div>
                </div>
            </div>

            <div>
                <p className="mb-5">Thông tin sản phẩm</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <TextInput disabled label={"Mã sản phẩm"} placeHolder="" value={form.productId} onChange={(e) => setField("productId", e.target.value)} />
                    <TextInput label={"Tên sản phẩm"} placeHolder="" value={form.productName} onChange={(e) => setField("productName", e.target.value)} />

                    <div className="flex justify-between gap-5 h-20">
                        <div className="flex-1">
                            <TextInput label={"Giá nhập"} placeHolder="" inputType="text" value={formatThousands(form.importPrice)} onChange={(e) => setField("importPrice", parseFormattedNumber(e.target.value))} />
                        </div>
                        <div className="flex-1 flex flex-col gap-0.5">
                            <TextInput label={"Giá bán"} placeHolder="" inputType="text" value={formatThousands(form.salePrice)} onChange={(e) => setField("salePrice", parseFormattedNumber(e.target.value))} />
                            {form.salePrice > 0 && form.importPrice > 0 && form.salePrice <= form.importPrice && (
                                <p className="text-xs text-yellow-600">Bạn đang nhập giá bán nhỏ hơn hoặc bằng giá nhập</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-5">
                        <SelectInput disabled={form.status === "Approved"} label={"Phân loại"} options={categoryOptions} value={form.categoryId} onChange={(value) => setField("categoryId", value)} />
                        <SelectInput label={"Màu sắc"} options={colorOptions} value={form.colorId} onChange={(value) => setField("colorId", value)} />
                        <SelectInput label={"Hoạ tiết"} options={patternOptions} value={form.patternId} onChange={(value) => setField("patternId", value)} />
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm">Kích cỡ - Số lượng</p>
                        <SwitchInput disabled={form.status === "Approved"} label={"Size số"} checked={form.isNumberSize} onChange={(checked) => setField("isNumberSize", checked)} />
                    </div>

                    <div className="grid grid-cols-4 gap-x-10 gap-y-5">
                        {sizes.map((size) => (
                            <TextInput key={size} label={size} placeHolder="" value={quantities[size]} labelPosition="left" inputType="text" onChange={(e) => handleQuantityChange(size, parseFormattedNumber(e.target.value))} />
                        ))}
                    </div>

                    <div className="flex justify-end gap-5 mt-5">
                        <button type="button" className="py-2 px-4 rounded-lg border border-red-500 bg-red-500 text-white text-sm font-medium transition hover:bg-red-600 hover:cursor-pointer" onClick={() => setConfirmModalOpen(true)}>
                            Xoá sản phẩm
                        </button>
                        <button
                            className={`py-2 px-3 rounded-lg text-white bg-pink text-sm ${updateMutation.isPending || isUnchanged ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                            disabled={updateMutation.isPending || isUnchanged}
                        >
                            {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
                        </button>
                    </div>
                </form>
            </div>

            <LayoutModal isOpen={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)}>
                <DeleteProductModal productId={product.id} onClose={() => setConfirmModalOpen(false)} />
            </LayoutModal>

            <LayoutModal isOpen={isGenerateImageModalOpen} onClose={() => setGenerateImageModalOpen(false)}>
                <div className="flex flex-col items-center gap-4 p-4">
                    <p className="text-base font-medium">Mẫu ảnh sản phẩm</p>
                    <div className="relative w-80 h-96">
                        {form.imageModalPreviewUrl ? (
                            <Image src={form.imageModalPreviewUrl} alt="Mẫu ảnh" fill className="object-cover rounded-lg" unoptimized placeholder="blur" blurDataURL={pinkPlaceholder} />
                        ) : (
                            <div className="w-full h-full bg-gray-100 rounded-lg" />
                        )}
                    </div>
                    <button type="button" onClick={handleDownload} className="py-2 px-4 rounded-lg text-white bg-pink text-sm cursor-pointer">
                        Tải xuống
                    </button>
                </div>
            </LayoutModal>
        </div>
    );
}

export function ProductDetail({ product }: ProductDetailProps) {
    const [categoriesQuery, colorsQuery, patternsQuery] = useQueries({
        queries: [
            { queryKey: ["categories"], queryFn: () => FetchAllCategories() },
            { queryKey: ["colors"], queryFn: () => FetchAllColors() },
            { queryKey: ["patterns"], queryFn: () => FetchAllPatterns() },
        ],
    });

    const allLoaded = categoriesQuery.isSuccess && colorsQuery.isSuccess && patternsQuery.isSuccess;

    if (!allLoaded) return <div>Đang tải...</div>;

    return (
        <ProductDetailInner
            product={product}
            categories={categoriesQuery.data}
            colors={colorsQuery.data}
            patterns={patternsQuery.data}
        />
    );
}