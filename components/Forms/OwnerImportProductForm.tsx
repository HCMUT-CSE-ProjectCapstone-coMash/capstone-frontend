"use client";

import { categories, colors, patterns, sizesLetter, sizesNumber } from "@/const/product";
import Image from "next/image";
import { useRef, useState } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { SearchInput } from "../FormInputs/SearchInput";
import { CreateProduct, Product, ProductWithOrderStatus } from "@/types/product";
import { SelectInput } from "../FormInputs/SelectInput";
import { SwitchInput } from "../FormInputs/SwitchInput";
import { CreateProductIdByCategory, FetchApprovedProductByName, OwnerCreateProduct, SearchSimilarProduct } from "@/api/products/products";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { formatThousands, parseFormattedNumber } from "@/utilities/numberFormat";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/utilities/store";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { setOwnerEditingProduct } from "@/utilities/ownerProductEditStore";
import { UploadIcon } from "@/public/assets/Icons";
import { LayoutModal } from "../Modal/LayoutModal";
import { OwnerSuggestionModal } from "../Modal/OwnerSuggestionModal";
import ImgCrop from "antd-img-crop";
import { Spin, Upload } from "antd";
import type { RcFile } from "antd/es/upload/interface";

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
    importPrice: number;
    salePrice: number;
}

const createInitialQuantities = (sizes: string[]) => Object.fromEntries(sizes.map(size => [size, 0]));

const initialFormState: FormState = {
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

    const [suggestionModalOpen, setSuggestionModalOpen] = useState<boolean>(false);
    const [suggestedProducts, setSuggestedProducts] = useState<ProductWithOrderStatus[]>([]);

    const sizes = form.isNumberSize ? sizesNumber : sizesLetter;
    const quantities = form.isNumberSize ? form.numberQuantities : form.letterQuantities;

    const handleQuantityChange = (size: string, value: number) => {
        const key = form.isNumberSize ? "numberQuantities" : "letterQuantities";
        setForm(prev => ({ ...prev, [key]: { ...prev[key], [size]: value } }));
    };

    const uploadTriggerRef = useRef<HTMLButtonElement | null>(null);

    const imageSearchMutation = useMutation({
        mutationFn: (imageFile: File) => SearchSimilarProduct(imageFile),
        onSuccess: (data) => {
            setSuggestionModalOpen(true);
            setSuggestedProducts(data);
        },
    });

    const createProductIdMutation = useMutation({
        mutationFn: (productName: string) => CreateProductIdByCategory(productName),
        onSuccess: (data) => {
            setField("productId", data.productId);
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Không thể tạo mã sản phẩm tự động" }));
        }
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
        gcTime: 0,
    });

    const suggestions = products.map((p: Product) => ({
        label: p.productName,
        value: p.productName,
        data: p,
    }));

    const createMutation = useMutation({
        mutationFn: (newProduct: CreateProduct) => OwnerCreateProduct(newProduct),
        onSuccess: () => {
            setForm(initialFormState);
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Thêm sản phẩm thành công" }));
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Thêm sản phẩm thất bại" }));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user.id) return;

        if (!form.imageFile) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng thêm hình ảnh sản phẩm" }));
            return;
        }
        
        if (!form.productName) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập tên sản phẩm " }));
            return;
        }
        if (!form.category) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui chọn phân loại" }));
            return;
        }
        if (!form.color) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng chọn màu" }));
            return;
        }
        if (!form.importPrice) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập giá nhập" }));
            return;
        }
        if (!form.salePrice) {
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

        const newProduct: CreateProduct = {
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
        };

        createMutation.mutate(newProduct);
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
                                <UploadIcon width={64} height={64} className={"text-gray-400"} />

                                <button
                                    type="button"
                                    className="text-lg font-medium underline cursor-pointer text-gray-dark"
                                    onClick={openFilePicker}
                                >
                                    Chọn từ máy tính của bạn
                                </button>

                                <button type="button" className="text-lg font-medium underline cursor-pointer text-gray-dark">
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
                        onChange={(e) => setField("productId", e.target.value)}
                    />

                    <SearchInput<Product>
                        label={"Tên sản phẩm"}
                        placeHolder=""
                        value={form.productName}
                        onChange={(e) => setField("productName", e.target.value)}
                        suggestions={suggestions}
                        onSuggestionClick={(item) => { dispatch(setOwnerEditingProduct(item.data)); }}
                        renderItem={(item) => (
                            <div className="flex items-center gap-3">
                                <div className="relative w-8 h-8">
                                    <Image src={item.data.imageURL} placeholder="blur" blurDataURL={"/assets/image/light-pink.png"} alt="" fill className="object-cover" unoptimized />
                                </div>
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
                            onChange={(e) => setField("importPrice", parseFormattedNumber(e.target.value))}
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
                            }} />

                        <SelectInput label={"Màu sắc"} options={colors} value={form.color} onChange={(value) => setField("color", value)} />

                        <SelectInput label={"Hoạ tiết"} options={patterns} value={form.pattern} onChange={(value) => setField("pattern", value)} />
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm">Kích cỡ - Số lượng</p>
                        <SwitchInput label={"Size số"} checked={form.isNumberSize} onChange={(checked) => setField("isNumberSize", checked)} />
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

                        <button
                            className={`py-2 px-3 rounded-lg text-white bg-pink text-sm
                                ${createMutation.isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? "Đang thêm..." : "Thêm sản phẩm"}
                        </button>
                    </div>
                </form>
            </div>

            {suggestionModalOpen && form.imageFile && (
                <LayoutModal
                    onClose={() => setSuggestionModalOpen(false)}
                    isOpen={suggestionModalOpen}
                >
                    <OwnerSuggestionModal
                        products={suggestedProducts}
                        onClose={() => setSuggestionModalOpen(false)}
                        onAnalyzeResult={(data) => {
                            setField("productName", data.productName);
                            setField("category", data.category);
                            setField("color", data.color);
                            setField("pattern", data.pattern);
                            createProductIdMutation.mutate(data.category);
                        }}
                        imageFile={form.imageFile}
                    />
                </LayoutModal>
            )}
        </div>
    );
}