"use client";

import { sizesLetter, sizesNumber } from "@/const/product";
import { AlertType } from "@/types/alert";
import { Category, Color, Pattern, Product, UpdateProduct } from "@/types/product"
import { addAlert } from "@/utilities/alertStore";
import { clampPrice, clampQuantity, formatThousands, MAX_STRING, parseFormattedNumber } from "@/utilities/numberFormat";
import { clearOwnerEditingProduct } from "@/utilities/ownerProductEditStore";
import { useMutation, useQueries } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { SelectInput } from "../FormInputs/SelectInput";
import { SwitchInput } from "../FormInputs/SwitchInput";
import { TextInput } from "../FormInputs/TextInput";
import Image from "next/image";
import { FetchAllCategories, FetchAllColors, FetchAllPatterns, OwnerUpdateProduct } from "@/api/products/products";
import { LayoutModal } from "../Modal/LayoutModal";
import { DeleteProductModal } from "../Modal/DeleteProductModal";
import { pinkPlaceholder } from "@/const/placeholder";

interface FormState {
    productId: string;
    productName: string;
    categoryId: string;
    colorId: string;
    patternId: string;
    isNumberSize: boolean;
    letterQuantities: Record<string, number>;
    numberQuantities: Record<string, number>;
    imageFile: File | null;
    imagePreviewUrl: string | null;
    status: "Pending" | "Approved";
    salePrice: number;
    importPrice: number;
}

interface OwnerUpdateProductFormProps {
    editProduct: Product;
    isHasCancelButton?: boolean;
}

const createInitialQuantities = (sizes: string[]) => Object.fromEntries(sizes.map((size) => [size, 0]));

const mapProductToForm = (product: Product, categories: Category[] = [], colors: Color[] = [], patterns: Pattern[] = []): FormState => {
    const isNumber = product.sizeType === "Number";
    const sizes = isNumber ? sizesNumber : sizesLetter;

    const quantityMap = createInitialQuantities(sizes);
    product.quantities.forEach((qty) => {
        quantityMap[qty.size] = qty.quantities;
    });

    if (product.quantityChanges && product.quantityChanges.length > 0) {
        product.quantityChanges.forEach((change) => {
            quantityMap[change.size] = change.newQuantity;
        });
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
        imageFile: null,
        imagePreviewUrl: product.imageURL ?? null,
        status: product.status,
        salePrice: product.salePrice,
        importPrice: product.importPrice,
    };
};

function OwnerUpdateProductFormInner({ editProduct, isHasCancelButton, categories, colors, patterns }: { editProduct: Product; isHasCancelButton: boolean; categories: Category[]; colors: Color[]; patterns: Pattern[];}) {
    const dispatch = useDispatch();
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

    const categoryOptions = categories.map((c: Category) => ({ label: c.categoryName, value: c.id }));
    const colorOptions = colors.map((c: Color) => ({ label: c.colorName, value: c.id }));
    const patternOptions = patterns.map((p: Pattern) => ({ label: p.patternName, value: p.id }));

    const [form, setForm] = useState<FormState>(() => mapProductToForm(editProduct, categories, colors, patterns));

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const isUnchanged = JSON.stringify(form) === JSON.stringify(mapProductToForm(editProduct, categories, colors, patterns));

    const sizes = form.isNumberSize ? sizesNumber : sizesLetter;
    const quantities = form.isNumberSize ? form.numberQuantities : form.letterQuantities;

    const handleQuantityChange = (size: string, value: number) => {
        const key = form.isNumberSize ? "numberQuantities" : "letterQuantities";
        setForm((prev) => ({ ...prev, [key]: { ...prev[key], [size]: value } }));
    };

    const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length > MAX_STRING) {
            dispatch(addAlert({ type: AlertType.WARNING, message: `Tên sản phẩm không được vượt quá ${MAX_STRING} ký tự` }));
            return;
        }
        setField("productName", value);
    };    

    const updateMutation = useMutation({
        mutationFn: ({ updateData, productId }: { updateData: UpdateProduct; productId: string }) => OwnerUpdateProduct(updateData, productId),
        onSuccess: () => {
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Cập nhật sản phẩm thành công" }));
            dispatch(clearOwnerEditingProduct());
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Cập nhật sản phẩm thất bại" }));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editProduct.id) {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Sản phẩm không tồn tại" }));
            return;
        }
        if (!form.imageFile && !form.imagePreviewUrl) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng thêm hình ảnh sản phẩm" }));
            return;
        }
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
            image: form.imageFile,
            importPrice: form.importPrice,
            salePrice: form.salePrice,
        };

        updateMutation.mutate({ updateData, productId: editProduct.id });
    };

    const objectUrl = useMemo(() => {
        if (!form.imageFile) return null;
        return URL.createObjectURL(form.imageFile);
    }, [form.imageFile]);

    useEffect(() => {
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [objectUrl]);

    const previewSrc = objectUrl ?? form.imagePreviewUrl ?? null;

    return (
        <div className="flex gap-[10vw]">
            <div>
                <p>Hình ảnh sản phẩm</p>
                <div className="w-md">
                    <div className="relative group h-118.75 w-full mt-3">
                        <Image
                            src={previewSrc ?? "/placeholder-image.png"}
                            alt="" fill
                            className="object-cover"
                            unoptimized
                            placeholder="blur"
                            blurDataURL={pinkPlaceholder}
                        />
                    </div>
                </div>
            </div>

            <div>
                <p className="mb-5">Thông tin sản phẩm</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <TextInput disabled label={"Mã sản phẩm"} placeHolder="" value={form.productId} onChange={(e) => setField("productId", e.target.value)} />

                    <TextInput label={"Tên sản phẩm"} placeHolder="" value={form.productName} onChange={(e) => handleProductNameChange(e)} />

                    <div className="flex justify-between gap-5 h-20">
                        <div className="flex-1">
                            <TextInput
                                label={"Giá nhập"} placeHolder="" inputType="text"
                                value={formatThousands(form.importPrice)}
                                onChange={(e) => setField("importPrice", clampPrice(parseFormattedNumber(e.target.value)))}
                            />
                        </div>
                        <div className="flex-1 flex flex-col gap-0.5">
                            <TextInput
                                label={"Giá bán"} placeHolder="" inputType="text"
                                value={formatThousands(form.salePrice)}
                                onChange={(e) => setField("salePrice", clampPrice(parseFormattedNumber(e.target.value)))}
                            />
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
                            <TextInput
                                key={size} label={size} placeHolder=""
                                value={quantities[size]} labelPosition="left" inputType="text"
                                onChange={(e) => handleQuantityChange(size, clampQuantity(parseFormattedNumber(e.target.value)))}
                            />
                        ))}
                    </div>

                    <div className="flex justify-end mt-5 gap-x-6">
                        {isHasCancelButton ? (
                            <button type="button" className="py-2 px-3 rounded-lg text-white bg-purple text-sm cursor-pointer" onClick={() => dispatch(clearOwnerEditingProduct())}>
                                Huỷ bỏ
                            </button>
                        ) : (
                            <button type="button" className="py-2 px-4 rounded-lg border border-red-500 bg-red-500 text-white text-sm font-medium transition hover:bg-red-600 hover:cursor-pointer" onClick={() => setConfirmModalOpen(true)}>
                                Xoá sản phẩm
                            </button>
                        )}
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
                <DeleteProductModal productId={editProduct.id} onClose={() => setConfirmModalOpen(false)} />
            </LayoutModal>
        </div>
    );
}

export function OwnerUpdateProductForm({ editProduct, isHasCancelButton = true }: OwnerUpdateProductFormProps) {
    const [categoriesQuery, colorsQuery, patternsQuery] = useQueries({
        queries: [
            { queryKey: ["categories"], queryFn: () => FetchAllCategories(), refetchOnWindowFocus: false },
            { queryKey: ["colors"], queryFn: () => FetchAllColors(), refetchOnWindowFocus: false },
            { queryKey: ["patterns"], queryFn: () => FetchAllPatterns(), refetchOnWindowFocus: false },
        ],
    });

    const allLoaded = categoriesQuery.isSuccess && colorsQuery.isSuccess && patternsQuery.isSuccess;

    if (!allLoaded) return <div>Đang tải...</div>;

    return (
        <OwnerUpdateProductFormInner
            editProduct={editProduct}
            isHasCancelButton={isHasCancelButton}
            categories={categoriesQuery.data}
            colors={colorsQuery.data}
            patterns={patternsQuery.data}
        />
    );
}