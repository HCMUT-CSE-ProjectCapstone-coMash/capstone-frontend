"use client";

import { Product, ProductQuantity, UpdateProduct } from "@/types/product";
import { useEffect, useMemo, useState } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import { SwitchInput } from "../FormInputs/SwitchInput";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { categories, colors, patterns, sizesLetter, sizesNumber  } from "@/const/product";
import { useDispatch, useSelector } from "react-redux";
import { clearEditingProduct } from "@/utilities/productEditStore";
import { CreateProductsOrderDetailForApprovedProduct, OwnerUpdateProductInProductsOrder, PatchProductInProductsOrder } from "@/api/products/products";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { addProductToOrder, updateProductInOrder } from "@/utilities/productsOrderStore";
import { RootState } from "@/utilities/store";
import { formatThousands, parseFormattedNumber } from "@/utilities/numberFormat";

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
    status: "Pending" | "Approved",
    importPrice: number;
    salePrice: number;
}

interface UpdateProductFormProps {
    editProduct: Product;
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
        importPrice: product.importPrice,
        salePrice: product.salePrice
    };
};

const getMinQuantities = (product: Product, sizes: string[]): Record<string, number> => {
    const map = createInitialQuantities(sizes);
    product.quantities.forEach((qty) => {
        map[qty.size] = qty.quantities;
    });
    return map;
};

export function UpdateProductForm({ editProduct }: UpdateProductFormProps) {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const productsOrder = useSelector((state: RootState) => state.productsOrder.productsOrder);

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

    const allSizes = useMemo(() => [...sizesLetter, ...sizesNumber], []);
    const minQuantities = useMemo(
        () => getMinQuantities(editProduct, allSizes),
        [editProduct, allSizes]
    );

    // Tuỳ theo loại size đang chọn, hiển thị input số lượng tương ứng (UI)
    const sizes = form.isNumberSize ? sizesNumber : sizesLetter;
    const quantities = form.isNumberSize ? form.numberQuantities : form.letterQuantities;

    const handleQuantityChange = (size: string, value: number) => {
        const key = form.isNumberSize ? "numberQuantities" : "letterQuantities";
        setForm((prev) => ({ ...prev, [key]: { ...prev[key], [size]: value } }));
    };

    // Tạo mutation cập nhật sản phẩm, gọi API update và xử lý kết quả
    const updateMutation = useMutation({
        mutationFn: ({ productId, updateData }: { productId: string, updateData: UpdateProduct }) => PatchProductInProductsOrder(productId, updateData),

        onSuccess: (data) => {
            const newProduct: Product = {
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
                quantityChanges: data.quantityChanges,
                importPrice: data.importPrice,
                salePrice: data.salePrice
            }

            dispatch(updateProductInOrder(newProduct));

            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Cập nhật sản phẩm thành công" }));

            dispatch(clearEditingProduct());
        },

        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Cập nhật sản phẩm thất bại"}));
        }
    });

    const AddMoreProductMutation = useMutation({
        mutationFn: ({ productId, productsOrderId, productQuantities } : { productId: string, productsOrderId: string, productQuantities: ProductQuantity[] }) => CreateProductsOrderDetailForApprovedProduct(productId, productsOrderId, productQuantities),

        onSuccess: (data) => {
            const newProduct: Product = {
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
                quantityChanges: data.quantityChanges,
                importPrice: data.importPrice,
                salePrice: data.salePrice
            }

            const alreadyExists = productsOrder?.products.some(p => p.id === newProduct.id);

            if (alreadyExists) {
                dispatch(updateProductInOrder(newProduct));
                dispatch(addAlert({ type: AlertType.SUCCESS, message: "Cập nhật sản phẩm thành công" }));
            } else {
                dispatch(addProductToOrder(newProduct));
                dispatch(addAlert({ type: AlertType.SUCCESS, message: "Thêm sản phẩm thành công" }));
            }

            dispatch(clearEditingProduct());
        },

        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Thêm sản phẩm thất bại"}));
        }
    });

    const OwnerUpdateProductInProductsOrderMutation = useMutation({
        mutationFn: ({ productId, productsOrderId, ownerUpdateData } : 
            { productId: string, productsOrderId: string, ownerUpdateData : UpdateProduct }) => OwnerUpdateProductInProductsOrder(productId, productsOrderId, ownerUpdateData),

        onSuccess: () => {
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Cập nhật sản phẩm thành công" }));
            dispatch(clearEditingProduct());
        },

        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Cập nhật sản phẩm thất bại"}));
        }
    });

    // Xử lý submit form: validate dữ liệu, gọi mutation cập nhật sản phẩm
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (productsOrder?.id == null) return;

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

        if (form.status === "Approved") {
            const belowMin = formattedQuantities.some(
                ({ size, quantities: qty }) => qty < (minQuantities[size] ?? 0)
            );
            if (belowMin) {
                dispatch(addAlert({ type: AlertType.WARNING, message: "Số lượng không được thấp hơn số lượng đã duyệt" }));
                return;
            }
        }

        const updateData: UpdateProduct = {
            productId: form.productId,
            productName: form.productName,
            category: form.category,
            color: form.color,
            pattern: form.pattern,
            sizeType: form.isNumberSize ? "Number" : "Letter",
            quantities: formattedQuantities
        };

        if (user.role === "owner") {
            updateData.importPrice = form.importPrice;
            updateData.salePrice = form.salePrice;
            OwnerUpdateProductInProductsOrderMutation.mutate({ productId: editProduct.id, productsOrderId: productsOrder.id, ownerUpdateData: updateData });
            return;
        }
        
        if (form.status === "Pending") {
            updateMutation.mutate({ productId: editProduct.id, updateData });
        }
        else {
            AddMoreProductMutation.mutate({ productId: editProduct.id, productsOrderId: productsOrder.id, productQuantities: formattedQuantities });
        }
    }

    // Sử dụng useMemo để tạo URL preview từ file ảnh, và useEffect để giải phóng URL khi component unmount hoặc file thay đổi
    const objectUrl = useMemo(() => {
        if (!form.imageFile) return null;
        const url = URL.createObjectURL(form.imageFile);
        return url;
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
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                </div>
            </div>

            <div>
                <p className="mb-5">Thông tin sản phẩm</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <TextInput
                        disabled={true}
                        label={"Mã sản phẩm"}
                        placeHolder=""
                        value={form.productId}
                        onChange={(e) => setField("productId", e.target.value)}
                    />

                    <TextInput
                        disabled={form.status === "Approved" && user.role === "employee"}
                        label={"Tên sản phẩm"}
                        placeHolder=""
                        value={form.productName}
                        onChange={(e) => setField("productName", e.target.value)}
                    />

                    {user.role === "owner" && (
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
                    )}

                    <div className="flex items-center justify-between gap-5">
                        <SelectInput disabled={form.status === "Approved"} label={"Phân loại"} options={categories} value={form.category} onChange={(value) => setField("category", value)} />
                        <SelectInput disabled={form.status === "Approved" && user.role === "employee"} label={"Màu sắc"} options={colors} value={form.color} onChange={(value) => setField("color", value)} />
                        <SelectInput disabled={form.status === "Approved" && user.role === "employee"} label={"Hoạ tiết"} options={patterns} value={form.pattern} onChange={(value) => setField("pattern", value)} />
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm">Kích cỡ - Số lượng</p>
                        <SwitchInput disabled={form.status === "Approved"} label={"Size số"} checked={form.isNumberSize} onChange={(checked) => setField("isNumberSize", checked)} />
                    </div>

                    <div className="grid grid-cols-4 gap-x-10 gap-y-5">
                        {sizes.map((size) => (
                            <div key={size} className="flex flex-col gap-1">
                                <TextInput
                                    label={size}
                                    placeHolder=""
                                    value={quantities[size]}
                                    labelPosition="left"
                                    inputType="text"
                                    onChange={(e) =>
                                        handleQuantityChange(size, parseFormattedNumber(e.target.value))
                                    }
                                />
                                {form.status === "Approved" && (minQuantities[size] ?? 0) > 0 && (
                                    <p className="text-xs text-gray-600 text-right">
                                        Tối thiểu: {minQuantities[size]}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end mt-5 gap-x-5">
                        <button
                            className="py-2 px-3 rounded-lg text-white bg-purple text-sm cursor-pointer"
                            onClick={() => dispatch(clearEditingProduct())}
                        >
                            {"Huỷ bỏ"}
                        </button>

                        {form.status === "Pending" ? (
                            <button
                                className={`py-2 px-3 rounded-lg text-white bg-pink text-sm
                                    ${updateMutation.isPending || isUnchanged ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? "Đang cập nhật..." : "Lưu thay đổi"}
                            </button>
                        ) : (
                            <button
                                className={`py-2 px-3 rounded-lg text-white bg-pink text-sm
                                    ${AddMoreProductMutation.isPending || isUnchanged ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                                disabled={AddMoreProductMutation.isPending}
                            >
                                {AddMoreProductMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}