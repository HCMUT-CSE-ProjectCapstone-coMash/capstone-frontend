"use client";

import { useRef, useState } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import { SwitchInput } from "../FormInputs/SwitchInput";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnalyzeImage, CreateProductAsync, CreateProductIdByCategory, FetchApprovedProductByName, SearchSimilarProduct } from "@/api/products/products";
import { useDispatch, useSelector } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { CreateProduct, Product, ProductWithOrderStatus } from "@/types/product";
import { RootState } from "@/utilities/store";
import Image from "next/image";
import { categories, colors, patterns, sizesLetter, sizesNumber  } from "@/const/product";
import { addProductToOrder } from "@/utilities/productsOrderStore";
import { SearchInput } from "../FormInputs/SearchInput";
import { useDebounce } from "@/hooks/useDebounce";
import { setEditingProduct } from "@/utilities/productEditStore";
import { parseFormattedNumber } from "@/utilities/numberFormat";

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
}

const createInitialQuantities = (sizes: string[]) => Object.fromEntries(sizes.map(size => [size, 0]));

const initialFormState : FormState = {
    productId: "",
    productName: "",
    category: "",
    color: "",
    pattern: "",
    isNumberSize: false,
    letterQuantities: createInitialQuantities(sizesLetter),
    numberQuantities: createInitialQuantities(sizesNumber),
    imageFile: null,
};

export function ImportProductForm() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const productsOrder = useSelector((state: RootState) => state.productsOrder.productsOrder);

    const [form, setForm] = useState(initialFormState);
    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    // Tuỳ theo loại size mà hiển thị các ô nhập số lượng tương ứng (UI)
    const sizes = form.isNumberSize ? sizesNumber : sizesLetter;
    const quantities = form.isNumberSize ? form.numberQuantities : form.letterQuantities;

    const handleQuantityChange = (size: string, value: number) => {
        const key = form.isNumberSize ? "numberQuantities" : "letterQuantities";
        setForm(prev => ({ ...prev, [key]: { ...prev[key], [size]: value } }));
    }

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Tạo mã sản phẩm tự động khi chọn phân loại
    const createProductIdMutation = useMutation({
        mutationFn: (productName: string) => CreateProductIdByCategory(productName),

        onSuccess: (data) => {
            setField("productId", data.productId);
        },

        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Không thể tạo mã sản phẩm tự động" }));
        }
    });

    // Tạo sản phẩm mới
    const createMutation = useMutation({
        mutationFn: ({ productData, productsOrderId } : { productData: CreateProduct, productsOrderId: string }) => CreateProductAsync(productData, productsOrderId),

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
                importPrice: data.importPrice,
                salePrice: data.salePrice,
            }
            dispatch(addProductToOrder(newProduct));
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Thêm sản phẩm thành công" }));

            setForm(initialFormState);
        },

        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Thêm sản phẩm thất bại" }));
        }
    });

    // Xử lý submit form thêm sản phẩm mới
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if(!user.id || !productsOrder?.id) {
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

        const productData: CreateProduct = {
            productId: form.productId,
            productName: form.productName,
            category: form.category,
            color: form.color,
            pattern: form.pattern,
            sizeType: form.isNumberSize ? "Number" : "Letter",
            quantities: formattedQuantities,
            createdBy: user.id,
            image: form.imageFile
        };

        createMutation.mutate({ productData, productsOrderId: productsOrder.id });
    }

    // Xử lý khi người dùng chọn hình ảnh để tải lên
    const imageSearchMutation = useMutation({
        mutationFn: (imageFile: File) => SearchSimilarProduct(imageFile),

        onSuccess: (data) => {
            console.log(data);
        },

        onError: () => {

        }
    });

    // Xử lý khi người dùng chọn hình ảnh để phân tích và tự động điền thông tin sản phẩm
    const analyzeImageMutation = useMutation({
        mutationFn: (imageFile: File) => AnalyzeImage(imageFile),

        onSuccess: (data) => {
            setField("productId", data.productId);
            setField("productName", data.productName);
            setField("category", data.category);
            setField("color", data.color);
            setField("pattern", data.pattern);
        },

        onError: () => {

        }
    });

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setField("imageFile", files[0]);

        // imageSearchMutation.mutate(files[0]);
        // analyzeImageMutation.mutate(files[0]);
    }

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    const removeImage = () => {
        setField("imageFile", null);
    };

    const debouncedName = useDebounce(form.productName, 500);

    const { data: products = [] } = useQuery({
        queryKey: ["products", debouncedName],
        queryFn: () => FetchApprovedProductByName(debouncedName),
        enabled: debouncedName.length > 2,
        staleTime: 0,
        gcTime: 0
    });

    const suggestions = products.map((p: Product) => ({
        label: p.productName,
        value: p.productName,
        data: p
    }));

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
                    {form.imageFile ? (
                        <div className="relative group h-118.75 w-full">   
                            <Image 
                                src={URL.createObjectURL(form.imageFile)} 
                                alt=""
                                fill
                                className="object-cover" unoptimized
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
                            className={`py-2 px-3 rounded-lg text-white bg-purple text-sm cursor-pointer`}
                            onClick={openFilePicker}
                        >
                            Thêm ảnh từ máy tính
                        </button>

                        <button
                            className={`py-2 px-3 rounded-lg text-white bg-pink text-sm cursor-pointer`}
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
                        onChange={(e) => setField("productId" , e.target.value)}
                    />

                    <SearchInput<ProductWithOrderStatus>
                        label={"Tên sản phẩm"}
                        placeHolder=""
                        value={form.productName}
                        onChange={(e) => setField("productName", e.target.value)}
                        suggestions={suggestions}
                        isItemDisabled={(item) => item.data.isInPendingOrder}
                        onSuggestionClick={(item) => { dispatch(setEditingProduct(item.data)) }}
                        renderItem={(item) => (
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-8 h-8">
                                        <Image src={item.data.imageURL} placeholder="blur" blurDataURL={"/assets/image/light-pink.png"} fill alt="" className="object-cover" unoptimized/>
                                    </div>
                                    <span>{item.label}</span>
                                </div>

                                {item.data.isInPendingOrder && <p className="text-sm text-pink">Đang chờ duyệt</p>}
                            </div>
                        )}
                    />

                    <div className="flex items-center justify-between gap-5">
                        <SelectInput 
                            label={"Phân loại"} 
                            options={categories} 
                            value={form.category} 
                            onChange={(value) => {
                                setField("category", value);
                                createProductIdMutation.mutate(value);
                            }}/>

                        <SelectInput label={"Màu sắc"} options={colors} value={form.color} onChange={(value) => setField("color", value)}/>

                        <SelectInput label={"Hoạ tiết"} options={patterns} value={form.pattern} onChange={(value) => setField("pattern", value)}/>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm">Kích cỡ - Số lượng</p>
                        <SwitchInput label={"Size số"} checked={form.isNumberSize} onChange={(checked) => setField("isNumberSize", checked)}/>
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

                    <div className="flex justify-end mt-5">
                        <button className={`
                            py-2 px-3 rounded-lg text-white bg-pink text-sm
                            ${createMutation.isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`} 
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? "Đang thêm..." : "Thêm vào danh sách duyệt"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}