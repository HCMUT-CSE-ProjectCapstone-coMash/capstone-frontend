"use client";

import { Category, Color, Pattern, Product, UpdateProduct } from "@/types/product";
import { useEffect, useMemo, useState } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import { SwitchInput } from "../FormInputs/SwitchInput";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { sizesLetter, sizesNumber } from "@/const/product";
import { useDispatch, useSelector } from "react-redux";
import { clearEditingProduct } from "@/utilities/productEditStore";
import { OwnerUpdateProductInProductsOrder, EmployeeUpdateProductInProductsOrder, FetchAllCategories, FetchAllColors, FetchAllPatterns } from "@/api/products/products";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { addProductToOrder, updateProductInOrder } from "@/utilities/productsOrderStore";
import { RootState } from "@/utilities/store";
import { formatThousands, parseFormattedNumber } from "@/utilities/numberFormat";
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
    importPrice: number;
    salePrice: number;
}

interface UpdateProductFormProps {
    editProduct: Product;
}

const createInitialQuantities = (sizes: string[]) => Object.fromEntries(sizes.map((size) => [size, 0]));

const mapProductToForm = (product: Product, categories: Category[] = [], colors: Color[] = [], patterns: Pattern[] = []): FormState => {
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
        imageFile: null,
        imagePreviewUrl: product.imageURL ?? null,
        status: product.status,
        importPrice: product.importPrice,
        salePrice: product.salePrice,
    };
};

const getMinQuantities = (product: Product, sizes: string[]): Record<string, number> => {
    const map = createInitialQuantities(sizes);
    product.quantities.forEach((qty) => { map[qty.size] = qty.quantities; });
    return map;
};

function UpdateProductInProductsOrderFormInner({ editProduct, categories, colors, patterns }: { editProduct: Product; categories: Category[]; colors: Color[]; patterns: Pattern[];}) {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const user = useSelector((state: RootState) => state.user);
    const productsOrder = useSelector((state: RootState) => state.productsOrder.productsOrder);

    const categoryOptions = categories.map((c: Category) => ({ label: c.categoryName, value: c.id }));
    const colorOptions = colors.map((c: Color) => ({ label: c.colorName, value: c.id }));
    const patternOptions = patterns.map((p: Pattern) => ({ label: p.patternName, value: p.id }));

    const [form, setForm] = useState<FormState>(() => mapProductToForm(editProduct, categories, colors, patterns));

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const isUnchanged = JSON.stringify(form) === JSON.stringify( mapProductToForm(editProduct, categories, colors, patterns));

    const allSizes = useMemo(() => [...sizesLetter, ...sizesNumber], []);
    const minQuantities = useMemo(() => getMinQuantities(editProduct, allSizes), [editProduct, allSizes]);

    const sizes = form.isNumberSize ? sizesNumber : sizesLetter;
    const quantities = form.isNumberSize ? form.numberQuantities : form.letterQuantities;

    const handleQuantityChange = (size: string, value: number) => {
        const key = form.isNumberSize ? "numberQuantities" : "letterQuantities";
        setForm((prev) => ({ ...prev, [key]: { ...prev[key], [size]: value } }));
    };

    const OwnerUpdateMutation = useMutation({
        mutationFn: ({ productId, productsOrderId, ownerUpdateData }: { productId: string; productsOrderId: string; ownerUpdateData: UpdateProduct }) =>
            OwnerUpdateProductInProductsOrder(productId, productsOrderId, ownerUpdateData),
        onSuccess: () => {
            if (productsOrder?.id) queryClient.invalidateQueries({ queryKey: ["productsOrderDetails", productsOrder.id] });
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Cập nhật sản phẩm thành công" }));
            dispatch(clearEditingProduct());
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Cập nhật sản phẩm thất bại" }));
        },
    });

    const EmployeeUpdateMutation = useMutation({
        mutationFn: ({ productId, productsOrderId, employeeUpdateData }: { productId: string; productsOrderId: string; employeeUpdateData: UpdateProduct }) =>
            EmployeeUpdateProductInProductsOrder(productId, productsOrderId, employeeUpdateData),
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
                modelImageURL: data.modelImageURL,
                quantityChanges: data.quantityChanges,
                importPrice: data.importPrice,
                salePrice: data.salePrice,
            };

            const alreadyExists = productsOrder?.products.some(p => p.id === newProduct.id);
            if (alreadyExists) {
                dispatch(updateProductInOrder(newProduct));
            } else {
                dispatch(addProductToOrder(newProduct));
            }
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Cập nhật sản phẩm thành công" }));
            dispatch(clearEditingProduct());
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Cập nhật sản phẩm thất bại" }));
        },
    });

    const isPending = OwnerUpdateMutation.isPending || EmployeeUpdateMutation.isPending;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (productsOrder?.id == null) return;

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

        if (form.status === "Approved") {
            const belowMin = formattedQuantities.some(({ size, quantities: qty }) => qty < (minQuantities[size] ?? 0));
            if (belowMin) {
                dispatch(addAlert({ type: AlertType.WARNING, message: "Số lượng không được thấp hơn số lượng đã duyệt" }));
                return;
            }
        }

        const updateData: UpdateProduct = {
            productId: form.productId,
            productName: form.productName,
            categoryId: form.categoryId,
            colorId: form.colorId,
            patternId: form.patternId,
            sizeType: form.isNumberSize ? "Number" : "Letter",
            quantities: formattedQuantities,
        };

        if (user.role === "owner") {
            updateData.importPrice = form.importPrice;
            updateData.salePrice = form.salePrice;
            OwnerUpdateMutation.mutate({ productId: editProduct.id, productsOrderId: productsOrder.id, ownerUpdateData: updateData });
        } else {
            EmployeeUpdateMutation.mutate({ productId: editProduct.id, productsOrderId: productsOrder.id, employeeUpdateData: updateData });
        }
    };

    const objectUrl = useMemo(() => {
        if (!form.imageFile) return null;
        return URL.createObjectURL(form.imageFile);
    }, [form.imageFile]);

    useEffect(() => {
        return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [objectUrl]);

    const previewSrc = objectUrl ?? form.imagePreviewUrl ?? null;

    return (
        <div className="flex gap-[10vw]">
            <div>
                <p>Hình ảnh sản phẩm</p>
                <div className="w-md">
                    <div className="relative group h-118.75 w-full mt-3">
                        <Image src={previewSrc ?? "/placeholder-image.png"} alt="" fill className="object-cover" unoptimized placeholder="blur" blurDataURL={pinkPlaceholder} />
                    </div>
                </div>
            </div>

            <div>
                <p className="mb-5">Thông tin sản phẩm</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <TextInput disabled label={"Mã sản phẩm"} placeHolder="" value={form.productId} onChange={(e) => setField("productId", e.target.value)} />

                    <TextInput
                        disabled={form.status === "Approved" && user.role === "employee"}
                        label={"Tên sản phẩm"} placeHolder=""
                        value={form.productName}
                        onChange={(e) => setField("productName", e.target.value)}
                    />

                    {user.role === "owner" && (
                        <div className="flex items-center justify-between gap-5">
                            <TextInput label={"Giá nhập"} placeHolder="" value={formatThousands(form.importPrice)} inputType="text" onChange={(e) => setField("importPrice", parseFormattedNumber(e.target.value))} />
                            <TextInput label={"Giá bán"} placeHolder="" value={formatThousands(form.salePrice)} inputType="text" onChange={(e) => setField("salePrice", parseFormattedNumber(e.target.value))} />
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-5">
                        <SelectInput disabled label={"Phân loại"} options={categoryOptions} value={form.categoryId} onChange={(value) => setField("categoryId", value)} />
                        <SelectInput disabled={form.status === "Approved" && user.role === "employee"} label={"Màu sắc"} options={colorOptions} value={form.colorId} onChange={(value) => setField("colorId", value)} />
                        <SelectInput disabled={form.status === "Approved" && user.role === "employee"} label={"Hoạ tiết"} options={patternOptions} value={form.patternId} onChange={(value) => setField("patternId", value)} />
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm">Kích cỡ - Số lượng</p>
                        <SwitchInput disabled={form.status === "Approved"} label={"Size số"} checked={form.isNumberSize} onChange={(checked) => setField("isNumberSize", checked)} />
                    </div>

                    <div className="grid grid-cols-4 gap-x-10 gap-y-5">
                        {sizes.map((size) => (
                            <div key={size} className="flex flex-col gap-1">
                                <TextInput
                                    label={size} placeHolder="" value={quantities[size]}
                                    labelPosition="left" inputType="text"
                                    onChange={(e) => handleQuantityChange(size, parseFormattedNumber(e.target.value))}
                                />
                                {form.status === "Approved" && (minQuantities[size] ?? 0) > 0 && (
                                    <p className="text-xs text-gray-600 text-right">Tối thiểu: {minQuantities[size]}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end mt-5 gap-x-5">
                        {user.role === "employee" && (
                            <button type="button" className="py-2 px-3 rounded-lg text-white bg-purple text-sm cursor-pointer" onClick={() => dispatch(clearEditingProduct())}>
                                Huỷ bỏ
                            </button>
                        )}
                        <button
                            className={`py-2 px-3 rounded-lg text-white bg-pink text-sm ${isPending || isUnchanged ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                            disabled={isPending || isUnchanged}
                        >
                            {isPending
                                ? (form.status === "Pending" && user.role === "employee") ? "Đang lưu..." : "Đang cập nhật..."
                                : (form.status === "Pending" && user.role === "employee") ? "Lưu thay đổi" : "Cập nhật"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function UpdateProductInProductsOrderForm({ editProduct }: UpdateProductFormProps) {
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
        <UpdateProductInProductsOrderFormInner
            editProduct={editProduct}
            categories={categoriesQuery.data}
            colors={colorsQuery.data}
            patterns={patternsQuery.data}
        />
    );
}