"use client";

import { categories, colors, patterns, sizesLetter, sizesNumber } from "@/const/product";
import Image from "next/image";
import { useRef, useState } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { SearchInput } from "../FormInputs/SearchInput";
import { CreateProduct, Product } from "@/types/product";
import { SelectInput } from "../FormInputs/SelectInput";
import { SwitchInput } from "../FormInputs/SwitchInput";
import { AnalyzeImage, CreateProductIdByCategory, FetchApprovedProductByName, OwnerCreateProduct, SearchSimilarProduct } from "@/api/products/products";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { formatThousands, parseFormattedNumber } from "@/utilities/numberFormat";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/utilities/store";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { setOwnerEditingProduct } from "@/utilities/ownerProductEditStore";

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
    importPrice: number,
    salePrice: number,
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
    importPrice: 0,
    salePrice: 0,
};

export function OwnerImportProductForm() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);

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

    const createMutation = useMutation({
        mutationFn: (newProduct: CreateProduct) => OwnerCreateProduct(newProduct),

        onSuccess: () => {
            setForm(initialFormState);
        },

        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Thêm sản phẩm thất bại" }));
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if(!user.id) {
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

        if(!form.importPrice) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập giá nhập" }));
            return;
        }

        if(!form.salePrice) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập giá bán" }));
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

        const newProduct : CreateProduct = {
            productId: form.productId,
            productName: form.productName,
            category: form.category,
            color: form.color,
            pattern: form.pattern,
            sizeType: form.isNumberSize ? "Number" : "Letter",
            quantities: formattedQuantities,
            createdBy: user.id,
            image: form.imageFile,
            importPrice: form.importPrice,
            salePrice: form.salePrice,
        }

        createMutation.mutate(newProduct);
    };

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

                    <SearchInput<Product>
                        label={"Tên sản phẩm"}
                        placeHolder=""
                        value={form.productName}
                        onChange={(e) => setField("productName", e.target.value)}
                        suggestions={suggestions}
                        onSuggestionClick={(item) => { dispatch(setOwnerEditingProduct(item.data)) }}
                        renderItem={(item) => (
                            <div className="flex items-center gap-3">
                                <Image src={item.data.imageURL} alt="" width={32} height={32} className="object-cover" unoptimized/>
                                <span>{item.label}</span>
                            </div>
                        )}
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
                            {createMutation.isPending ? "Đang thêm..." : "Thêm sản phẩm"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}