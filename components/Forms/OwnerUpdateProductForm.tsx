"use client";

import { categories, colors, patterns, sizesLetter, sizesNumber } from "@/const/product";
import { AlertType } from "@/types/alert";
import { Product, UpdateProduct } from "@/types/product"
import { addAlert } from "@/utilities/alertStore";
import { formatThousands, parseFormattedNumber } from "@/utilities/numberFormat";
import { clearOwnerEditingProduct } from "@/utilities/ownerProductEditStore";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { SelectInput } from "../FormInputs/SelectInput";
import { SwitchInput } from "../FormInputs/SwitchInput";
import { TextInput } from "../FormInputs/TextInput";
import Image from "next/image";
import { OwnerUpdateProduct } from "@/api/products/products";

interface FormState {
    productId: string;
    productName: string;
    category: string;
    color: string;
    pattern: string;
    isNumberSize: boolean;
    letterQuantities: Record<string, number>;
    numberQuantities: Record<string, number>;
    imageFile: File | null;
    imagePreviewUrl: string | null;
    status: "Pending" | "Approved";
    salePrice: number;
    importPrice: number
}

interface OwnerUpdateProductFormProps {
    editProduct: Product
}

const createInitialQuantities = (sizes: string[]) => Object.fromEntries(sizes.map((size) => [size, 0]));

// Chuyển dữ liệu sản phẩm từ API về dạng state của form, bao gồm mapping số lượng theo size và tạo URL preview ảnh
const mapProductToForm = (product: Product): FormState => {
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

    return {
        productId: product.productId,
        productName: product.productName,
        category: product.category,
        color: product.color,
        pattern: product.pattern,
        isNumberSize: isNumber,
        letterQuantities: isNumber ? createInitialQuantities(sizesLetter) : quantityMap,
        numberQuantities: isNumber ? quantityMap : createInitialQuantities(sizesNumber),
        imageFile: null,
        imagePreviewUrl: product.imageURL ?? null,
        status: product.status,
        salePrice: product.salePrice,
        importPrice: product.importPrice
    };
};

export function OwnerUpdateProductForm({ editProduct }: OwnerUpdateProductFormProps) {
    const dispatch = useDispatch();

    const [form, setForm] = useState<FormState>(() => mapProductToForm(editProduct));
    const [initialForm, setInitialForm] = useState<FormState>(() => mapProductToForm(editProduct));
    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const isUnchanged = JSON.stringify(form) === JSON.stringify(initialForm);

    useEffect(() => {
        setForm(mapProductToForm(editProduct));
        setInitialForm(mapProductToForm(editProduct));
    }, [editProduct]);

    // Tuỳ theo loại size đang chọn, hiển thị input số lượng tương ứng (UI)
    const sizes = form.isNumberSize ? sizesNumber : sizesLetter;
    const quantities = form.isNumberSize ? form.numberQuantities : form.letterQuantities;

    const handleQuantityChange = (size: string, value: number) => {
        const key = form.isNumberSize ? "numberQuantities" : "letterQuantities";
        setForm((prev) => ({ ...prev, [key]: { ...prev[key], [size]: value } }));
    };

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const updateMutation = useMutation({
        mutationFn: ({ updateData, productId } : { updateData: UpdateProduct, productId: string }) => OwnerUpdateProduct(updateData, productId),

        onSuccess: (data) => {
            const updateProduct: Product = {
                id: data.id,
                productId: data.productId,
                productName: data.productName,
                category: data.category,
                color: data.color,
                pattern: data.pattern,
                sizeType: data.sizeType,
                quantities: data.quantities,
                createdBy: data.createdBy,
                createdAt: data.createdAt,
                status: data.status,
                imageURL: data.imageURL,
                importPrice: data.importPrice,
                salePrice: data.salePrice
            }

            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Cập nhật sản phẩm thành công" }));
            dispatch(clearOwnerEditingProduct());
        },

        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Cập nhật sản phẩm thất bại" }));
        }
    });

    // Xử lý submit form: validate dữ liệu, gọi mutation cập nhật sản phẩm
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editProduct.id) {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Sản phẩm không tồn tại" }));
            return;
        }

        if(!form.productName) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập tên sản phẩm "}));
            return;
        }

        if(!form.category) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui chọn phân loại" }));
            return;
        }

        if(!form.color) {
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
            category: form.category,
            color: form.color,
            pattern: form.pattern,
            sizeType: form.isNumberSize ? "Number" : "Letter",
            quantities: formattedQuantities,
            image: form.imageFile,
            importPrice: form.importPrice,
            salePrice: form.salePrice
        };

        updateMutation.mutate({ updateData: updateData, productId: editProduct.id });
    }
    
    // Xử lý file ảnh: lưu file vào state và tạo URL preview
    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setField("imageFile", files[0]);
        setField("imagePreviewUrl", null);
    };

    const openFilePicker = () => fileInputRef.current?.click();

    const removeImage = () => {
        setField("imageFile", null);
        setField("imagePreviewUrl", null);
    };

    const previewSrc = form.imageFile ? URL.createObjectURL(form.imageFile) : form.imagePreviewUrl ?? null;

    return (
        <div className="flex gap-[10vw]">
            <div>
                <p>Hình ảnh sản phẩm</p>

                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => handleFiles(e.target.files)}
                />

                <div className="w-md">
                    {previewSrc ? (
                        <div className="relative group h-118.75 w-full">
                            <Image
                                src={previewSrc}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-white text-pink w-7 h-7 rounded-full
                                           flex items-center justify-center text-sm
                                           opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div className="h-118.75 bg-tgray05 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-lg text-gray-700 mb-2">
                                    Kéo & thả hình ảnh muốn tải lên
                                </p>
                                <button
                                    className="text-lg font-medium underline cursor-pointer text-gray-dark"
                                    onClick={openFilePicker}
                                >
                                    hoặc từ máy tính của bạn
                                </button>
                                <button className="text-lg font-medium underline cursor-pointer text-gray-dark">
                                    hoặc từ điện thoại của bạn
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-5">
                    <p>Thông tin sản phẩm</p>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="py-2 px-3 rounded-lg text-white bg-purple text-sm cursor-pointer"
                            
                        >
                            Thêm ảnh từ máy tính
                        </button>
                        <button
                            type="button"
                            className="py-2 px-3 rounded-lg text-white bg-pink text-sm cursor-pointer"
                        >
                            Thêm ảnh từ điện thoại
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <TextInput
                        disabled={true}
                        label={"Mã sản phẩm"}
                        placeHolder=""
                        value={form.productId}
                        onChange={(e) => setField("productId", e.target.value)}
                    />

                    <TextInput
                        label={"Tên sản phẩm"}
                        placeHolder=""
                        value={form.productName}
                        onChange={(e) => setField("productName", e.target.value)}
                    />

                    <div className="flex items-center justify-between gap-5">
                        <TextInput
                            label={"Giá nhập"} 
                            placeHolder="" 
                            value={formatThousands(form.importPrice)}
                            inputType="text"
                            onChange={(e) => setField("importPrice", parseFormattedNumber(e.target.value))} // store raw number
                        />

                        <TextInput
                            label={"Giá bán"} 
                            placeHolder="" 
                            value={formatThousands(form.salePrice)}
                            inputType="text"
                            onChange={(e) => setField("salePrice", parseFormattedNumber(e.target.value))}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-5">
                        <SelectInput disabled={form.status === "Approved"} label={"Phân loại"} options={categories} value={form.category} onChange={(value) => setField("category", value)} />
                        <SelectInput label={"Màu sắc"} options={colors} value={form.color} onChange={(value) => setField("color", value)} />
                        <SelectInput label={"Hoạ tiết"} options={patterns} value={form.pattern} onChange={(value) => setField("pattern", value)} />
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm">Kích cỡ - Số lượng</p>
                        <SwitchInput disabled={form.status === "Approved"} label={"Size số"} checked={form.isNumberSize} onChange={(checked) => setField("isNumberSize", checked)} />
                    </div>

                    <div className="grid grid-cols-4 gap-x-10 gap-y-5">
                        {sizes.map((size) => (
                            <TextInput
                                key={size}
                                label={size}
                                placeHolder=""
                                value={quantities[size]}
                                labelPosition="left"
                                inputType="text"
                                onChange={(e) => handleQuantityChange(size, parseFormattedNumber(e.target.value))}
                            />
                        ))}
                    </div>

                    <div className="flex justify-end mt-5 gap-x-5">
                        <button
                            className="py-2 px-3 rounded-lg text-white bg-purple text-sm cursor-pointer"
                            onClick={() => dispatch(clearOwnerEditingProduct())}
                        >
                            {"Huỷ bỏ"}
                        </button>

                        <button
                            className={`py-2 px-3 rounded-lg text-white bg-pink text-sm
                                ${updateMutation.isPending || isUnchanged ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}