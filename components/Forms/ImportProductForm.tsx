"use client";

import { useRef, useState } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import { SwitchInput } from "../FormInputs/SwitchInput";
import { Button } from "../Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateProductAsync } from "@/api/authentication/product";
import { useDispatch, useSelector } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { CreateProduct, Product } from "@/types/product";
import { RootState } from "@/utilities/store";
import Image from "next/image";

const categories = [
    { label: "Đầm", value: "Đầm" },
    { label: "Áo", value: "Áo" },
    { label: "Quần", value: "Quần" },
    { label: "Váy", value: "Váy" },
];

const colors = [
    { label: "Đen", value: "Đen" },
    { label: "Trắng", value: "Trắng" },
    { label: "Đỏ", value: "Đỏ" },
    { label: "Cam", value: "Cam" },
    { label: "Vàng", value: "Vàng" },
    { label: "Xanh Lá", value: "Xanh Lá" },
    { label: "Xanh Dương", value: "Xanh Dương" },
    { label: "Tím", value: "Tím" },
    { label: "Hồng", value: "Hồng" },
];

const patternOptions = [
    { label: "Trơn", value: "Trơn" },
    { label: "Sọc Dọc", value: "Sọc Dọc" },
    { label: "Sọc Ngang", value: "Sọc Ngang" },
    { label: "Caro", value: "Caro" },
    { label: "Hoa Văn", value: "Hoa Văn" },
];

const sizesLetter = ["Freesize", "S", "M", "L", "XL", "2XL", "3XL", "4XL++"];
const sizesNumber = ["Freesize", "28", "30", "32", "34", "36", "38", "40"];

export function ImportProductForm() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    
    const [productID, setProductID] = useState<string>("");
    const [productName, setProductName] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [color, setColor] = useState<string>("");
    const [pattern, setPattern] = useState<string>("");

    const createInitialQuantities = (sizes: string[]) => Object.fromEntries(sizes.map(size => [size, 0]));

    const [letterQuantities, setLetterQuantities] = useState<Record<string, number>>(
        createInitialQuantities(sizesLetter)
    );
    
    const [numberQuantities, setNumberQuantities] = useState<Record<string, number>>(
        createInitialQuantities(sizesNumber)
    );

    const [isNumberSize, setIsNumberSize] = useState<boolean>(false);
    const sizes = isNumberSize ? sizesNumber : sizesLetter;
    const quantities = isNumberSize ? numberQuantities : letterQuantities;

    const handleQuantityChange = (size: string, value: number) => {
        if (isNumberSize) {
            setNumberQuantities(prev => ({ ...prev, [size]: value }));
        } else {
            setLetterQuantities(prev => ({ ...prev, [size]: value }));
        }
    };

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (productData: CreateProduct) => CreateProductAsync(productData),

        onSuccess: (data: Product) => {
            queryClient.setQueryData<Product[]>(["pendingProducts"], (oldData = []) => [...oldData, data]);
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Thêm sản phẩm thành công" }));
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
        
        if(!productID) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập mã sản phẩm" }));
            return;
        }

        if(!productName) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập tên sản phẩm "}));
            return;
        }

        if(!category) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui chọn phân loại" }));
            return;
        }

        if(!color) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng chọn màu" }));
            return;
        }

        const sizeQuantities = isNumberSize ? numberQuantities : letterQuantities;
        
        const formattedQuantities = Object.entries(sizeQuantities)
            .filter(([, qty]) => qty > 0)
            .map(([size, qty]) => ({ size, quantities: qty }));

        if (formattedQuantities.length === 0) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập số lượng cho ít nhất một size" }));
            return;
        }

        const productData: CreateProduct = {
            productID, 
            productName, 
            category, 
            color, 
            pattern, 
            sizeType: isNumberSize ? "number" : "letter",
            quantities: formattedQuantities,
            createdBy: user.id,
        };

        mutation.mutate(productData);
    }

    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        if (imageFiles.length + files.length > 4) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Bạn chỉ có thể tải lên tối đa 4 hình ảnh" }));
            return;
        }

        const newFiles = Array.from(files);

        setImageFiles([...imageFiles, ...newFiles]);
    }

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="flex gap-[10vw]">
            <div>
                <p>Hình ảnh sản phẩm</p>

                <input 
                    type="file" 
                    className="hidden"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => handleFiles(e.target.files)}
                />

                <div className="w-md">
                    {imageFiles.length > 0 ? (
                        <div className="flex flex-col gap-5">
                            <div className="relative group h-118.75 w-full">   
                                <Image 
                                    src={URL.createObjectURL(imageFiles[0])} 
                                    alt=""
                                    fill
                                    className="object-cover" unoptimized
                                />

                                <button
                                    type="button"
                                    onClick={() => removeImage(0)}
                                    className="absolute top-2 right-2 bg-white text-pink w-7 h-7 rounded-full 
                                            flex items-center justify-center text-sm
                                            opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-5">
                                {imageFiles.slice(1,4).map((file, index) => (
                                    <div key={index} className="relative group h-30 w-30">
                                        <Image 
                                            src={URL.createObjectURL(file)} 
                                            alt=""
                                            fill
                                            className="object-cover" unoptimized
                                        />

                                        <button
                                            type="button"
                                            onClick={() => removeImage(0)}
                                            className="absolute top-2 right-2 bg-white text-pink w-7 h-7 rounded-full 
                                                    flex items-center justify-center text-sm
                                                    opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
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
                        <Button 
                            label={"Thêm ảnh từ máy tính"} 
                            className={"bg-purple text-white text-sm"} 
                            onClick={openFilePicker}
                        />

                        <Button 
                            label={"Thêm ảnh từ điện thoại"} 
                            className={"bg-pink text-white text-sm"} 
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <TextInput 
                        label={"Mã sản phẩm"} 
                        placeHolder="" 
                        value={productID}
                        onChange={(e) => setProductID(e.target.value)}
                    />

                    <TextInput 
                        label={"Tên sản phẩm"} 
                        placeHolder="" 
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                    />

                    <div className="flex items-center justify-between gap-5">
                        <SelectInput label={"Phân loại"} options={categories} value={category} onChange={setCategory}/>

                        <SelectInput label={"Màu sắc"} options={colors} value={color} onChange={setColor}/>

                        <SelectInput label={"Hoạ tiết"} options={patternOptions} value={pattern} onChange={setPattern}/>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm">Kích cỡ - Số lượng</p>
                        <SwitchInput label={"Size số"} checked={isNumberSize} onChange={(checked) => setIsNumberSize(checked)}/>
                    </div>

                    <div className="grid grid-cols-4 gap-x-10 gap-y-5">
                        {sizes.map((size) => (
                            <TextInput
                                key={size}
                                label={size}
                                placeHolder=""
                                value={quantities[size]}
                                labelPosition="left"
                                inputType="number"
                                onChange={(e) => handleQuantityChange(size, Number(e.target.value))}
                            />
                        ))}
                    </div>

                    <div className="flex justify-end mt-5">
                        <Button 
                            label={mutation.isPending ? "Đang thêm..." : "Thêm vào danh sách duyệt"} 
                            className={"bg-pink text-white"}
                            isLoading={mutation.isPending}
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}