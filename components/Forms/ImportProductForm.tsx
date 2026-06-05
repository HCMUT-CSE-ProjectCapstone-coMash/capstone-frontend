"use client";

import { useRef, useState } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import { SwitchInput } from "../FormInputs/SwitchInput";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { AnalyzeImage, CreateProductAsync, CreateProductIdByCategoryId, DeleteTemporaryProduct, FetchAllCategories, FetchAllColors, FetchAllPatterns, FetchApprovedProductByName, SearchSimilarProduct } from "@/api/products/products";
import { useDispatch, useSelector } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { Category, Color, CreateProduct, Pattern, Product, ProductWithOrderStatus, TemporaryProduct } from "@/types/product";
import { RootState } from "@/utilities/store";
import Image from "next/image";
import { sizesLetter, sizesNumber  } from "@/const/product";
import { addProductToOrder } from "@/utilities/productsOrderStore";
import { SearchInput } from "../FormInputs/SearchInput";
import { useDebounce } from "@/hooks/useDebounce";
import { setEditingProduct } from "@/utilities/productEditStore";
import { parseFormattedNumber } from "@/utilities/numberFormat";
import { LayoutModal } from "../Modal/LayoutModal";
import { SuggestionModal } from "../Modal/SuggestionModal";
import { UploadIcon } from "@/public/assets/Icons";
import ImgCrop from "antd-img-crop";             
import { Spin, Upload } from "antd";
import type { RcFile } from "antd/es/upload/interface";
import { TemporaryModal } from "../Modal/TemporaryModal";
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
    temporaryProductId: string | null;
}

const createInitialQuantities = (sizes: string[]) => Object.fromEntries(sizes.map(size => [size, 0]));

const initialFormState : FormState = {
    productId: "",
    productName: "",
    categoryId: "",
    colorId: "",
    patternId: "",
    isNumberSize: false,
    letterQuantities: createInitialQuantities(sizesLetter),
    numberQuantities: createInitialQuantities(sizesNumber),
    imageFile: null,
    temporaryProductId: null,
};

export function ImportProductForm() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const productsOrder = useSelector((state: RootState) => state.productsOrder.productsOrder);

    const [categoriesQuery, colorsQuery, patternsQuery] = useQueries({
        queries: [
            {
                queryKey: ["categories"],
                queryFn: () => FetchAllCategories(),
                refetchOnWindowFocus: false,
            },
            {
                queryKey: ["colors"],
                queryFn: () => FetchAllColors(),
                refetchOnWindowFocus: false,
            },
            {
                queryKey: ["patterns"],
                queryFn: () => FetchAllPatterns(),
                refetchOnWindowFocus: false,
            }
        ] 
    });
    
    const categoryOptions = (categoriesQuery.data ?? []).map((c: Category) => ({
        label: c.categoryName,
        value: c.id,
    }));
    
    const colorOptions = (colorsQuery.data ?? []).map((c: Color) => ({
        label: c.colorName,
        value: c.id,
    }));
    
    const patternOptions = (patternsQuery.data ?? []).map((p: Pattern) => ({
        label: p.patternName,
        value: p.id,
    }));

    const [form, setForm] = useState(initialFormState);
    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const [suggestionModalOpen, setSuggestionModalOpen] = useState<boolean>(false);
    const [suggestedProducts, setSuggestedProducts] = useState<ProductWithOrderStatus[]>([]);

    const sizes = form.isNumberSize ? sizesNumber : sizesLetter;
    const quantities = form.isNumberSize ? form.numberQuantities : form.letterQuantities;

    const handleQuantityChange = (size: string, value: number) => {
        const key = form.isNumberSize ? "numberQuantities" : "letterQuantities";
        setForm(prev => ({ ...prev, [key]: { ...prev[key], [size]: value } }));
    }

    const uploadTriggerRef = useRef<HTMLButtonElement | null>(null);

    const createProductIdMutation = useMutation({
        mutationFn: (categoryId: string) => CreateProductIdByCategoryId(categoryId),
        onSuccess: (data) => {
            setField("productId", data.productId);
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Không thể tạo mã sản phẩm tự động" }));
        }
    });

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
                modelImageURL: data.modelImageURL,
            }
            dispatch(addProductToOrder(newProduct));
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Thêm sản phẩm thành công" }));
            setForm(initialFormState);
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Thêm sản phẩm thất bại" }));
        }
    });

    const deleteTemporaryProductMutation = useMutation({
        mutationFn: (temporaryProductId: string) => DeleteTemporaryProduct(temporaryProductId),
        onSuccess: () => {},
        onError: () => {}
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if(!user.id || !productsOrder?.id) return;

        if (!form.imageFile) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng thêm hình ảnh sản phẩm" }));
            return;
        }

        if(!form.productName) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập tên sản phẩm "}));
            return;
        }
        if(!form.categoryId) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui chọn phân loại" }));
            return;
        }
        if(!form.colorId) {
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
            productName: form.productName,
            categoryId: form.categoryId,
            colorId: form.colorId,
            patternId: form.patternId,
            sizeType: form.isNumberSize ? "Number" : "Letter",
            quantities: formattedQuantities,
            createdBy: user.id,
            image: form.imageFile
        };

        createMutation.mutate({ productData, productsOrderId: productsOrder.id });

        if (form.temporaryProductId) {
            deleteTemporaryProductMutation.mutate(form.temporaryProductId);
        }
    }

    const imageSearchMutation = useMutation({
        mutationFn: (imageFile: File) => SearchSimilarProduct(imageFile),
        onSuccess: (data) => {
            if (data.length > 0) {
                setSuggestedProducts(data);
                setSuggestionModalOpen(true);
            } else {
                if (form.imageFile) analyzeImageMutation.mutate(form.imageFile);
            }
        }
    });

    // Xử lý khi người dùng chọn hình ảnh để phân tích và tự động điền thông tin sản phẩm
    const analyzeImageMutation = useMutation({
        mutationFn: (imageFile: File) => AnalyzeImage(imageFile),

        onSuccess: (data) => {
            setField("productName", data.productName);
        
            const matchedCategory = categoriesQuery.data?.find((c: Category) => c.categoryName === data.category);
            const matchedColor = colorsQuery.data?.find((c: Color) => c.colorName === data.color);
            const matchedPattern = patternsQuery.data?.find((p: Pattern) => p.patternName === data.pattern);
        
            if (matchedCategory) {
                setField("categoryId", matchedCategory.id);
                createProductIdMutation.mutate(matchedCategory.id);
            }
            if (matchedColor) setField("colorId", matchedColor.id);
            if (matchedPattern) setField("patternId", matchedPattern.id);
        },

        onError: () => {}
    });

    const handleBeforeUpload = (file: RcFile) => {
        setField("imageFile", file);
        imageSearchMutation.mutate(file);
        return false;
    };

    const openFilePicker = () => {
        uploadTriggerRef.current?.click();
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

    // -- Temporary products from phone capture --
    const [setShowTemporaryProducts, setSetShowTemporaryProducts] = useState<boolean>(false);

    const handleTemporaryProductSelect = async (product: TemporaryProduct) => {
        // Fetch the image from the URL and convert to File
        const response = await fetch(product.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "temporary-product.jpg", { type: blob.type });
    
        const matchedCategory = categoriesQuery.data?.find((c: Category) => c.categoryName === product.category);
        const matchedColor = colorsQuery.data?.find((c: Color) => c.colorName === product.color);
        const matchedPattern = patternsQuery.data?.find((p: Pattern) => p.patternName === product.pattern);
    
        setForm(prev => ({
            ...prev,
            imageFile: file,
            productName: product.productName,
            categoryId: matchedCategory?.id ?? "",
            colorId: matchedColor?.id ?? "",
            patternId: matchedPattern?.id ?? "",
            temporaryProductId: product.id,
        }));
    
        if (matchedCategory) createProductIdMutation.mutate(matchedCategory.id);
        setSetShowTemporaryProducts(false);
    };

    return (
        <div className="flex gap-[10vw]">
            <div className="flex flex-col gap-2">
                <p>Hình ảnh sản phẩm</p>

                <div style={{ display: "none" }}>
                    <ImgCrop
                        aspect={1}
                        quality={1}
                        aspectSlider={true}
                        showReset
                        resetText="Đặt lại"
                        modalTitle="Cắt ảnh sản phẩm"
                        modalOk="Xác nhận"
                        modalCancel="Huỷ"
                    >
                        <Upload
                            beforeUpload={handleBeforeUpload}
                            showUploadList={false}
                            accept="image/*"
                            maxCount={1}
                        >
                            <button ref={uploadTriggerRef} type="button">trigger</button>
                        </Upload>
                    </ImgCrop>
                </div>

                <div className="w-md">
                    {form.imageFile ? (
                        <div className="relative group h-118.75 w-full">   
                            <Image 
                                src={URL.createObjectURL(form.imageFile)} 
                                alt=""
                                fill
                                className="object-cover" unoptimized
                            />

                            {imageSearchMutation.isPending && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                    <Spin size="large" description="Đang tìm sản phẩm tương tự..." />
                                </div>
                            )}

                            {analyzeImageMutation.isPending && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                    <Spin size="large" description="Đang tạo sản phẩm..." />
                                </div>
                            )}

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
                            <div className="flex flex-col items-center gap-2">
                                <UploadIcon width={64} height={64} className={"text-gray-400"}/>

                                <button 
                                    type="button"
                                    className="text-lg font-medium underline cursor-pointer text-gray-dark"
                                    onClick={openFilePicker}
                                >
                                    Chọn từ máy tính của bạn
                                </button>

                                <button 
                                    type="button" 
                                    className="text-lg font-medium underline cursor-pointer text-gray-dark"
                                    onClick={() => setSetShowTemporaryProducts(true)}
                                >
                                    hoặc từ điện thoại của bạn
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <p>Thông tin sản phẩm</p>

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
                                        <Image src={item.data.imageURL} placeholder="blur" blurDataURL={pinkPlaceholder} fill alt="" className="object-cover" unoptimized/>
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
                            options={categoryOptions} 
                            value={form.categoryId} 
                            onChange={(value) => {
                                setField("categoryId", value);
                                if (value) {
                                    createProductIdMutation.mutate(value);
                                } else {
                                    setField("productId", "");
                                }
                            }}/>
                        <SelectInput label={"Màu sắc"} options={colorOptions} value={form.colorId} onChange={(value) => setField("colorId", value)}/>
                        <SelectInput label={"Hoạ tiết"} options={patternOptions} value={form.patternId} onChange={(value) => setField("patternId", value)}/>
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

                    <div className="flex justify-end mt-5 gap-x-6">
                        <button
                            type="button"
                            className="py-2 px-3 rounded-lg text-white bg-purple text-sm cursor-pointer"
                            onClick={() => setForm(initialFormState)}
                        >
                            Huỷ bỏ
                        </button>

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

            {suggestionModalOpen && productsOrder?.id && form.imageFile && (
                <LayoutModal
                    onClose={() => setSuggestionModalOpen(false)}
                    isOpen={suggestionModalOpen}
                >
                    <SuggestionModal 
                        products={suggestedProducts} 
                        productsOrdersId={productsOrder.id}
                        onClose={() => setSuggestionModalOpen(false)}
                        onAnalyzeResult={(data) => {
                            setField("productName", data.productName);
                        
                            const matchedCategory = categoriesQuery.data?.find((c: Category) => c.categoryName === data.category);
                            const matchedColor = colorsQuery.data?.find((c: Color) => c.colorName === data.color);
                            const matchedPattern = patternsQuery.data?.find((p: Pattern) => p.patternName === data.pattern);
                        
                            if (matchedCategory) {
                                setField("categoryId", matchedCategory.id);
                                createProductIdMutation.mutate(matchedCategory.id);
                            }
                            if (matchedColor) setField("colorId", matchedColor.id);
                            if (matchedPattern) setField("patternId", matchedPattern.id);
                        }}
                        imageFile={form.imageFile}
                    />
                </LayoutModal>
            )}

            {setShowTemporaryProducts && (
                <LayoutModal
                    onClose={() => setSetShowTemporaryProducts(false)}
                    isOpen={setShowTemporaryProducts}
                >
                    <TemporaryModal
                        onSelect={handleTemporaryProductSelect}
                    />
                </LayoutModal>
            )}
        </div>
    )
}