"use client";

import { useState } from "react";
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

    return (
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

            <div className="flex justify-end mt-0.5">
                <Button 
                    label={mutation.isPending ? "Đang thêm..." : "Thêm vào danh sách duyệt"} 
                    className={"bg-pink text-white"}
                    isLoading={mutation.isPending}
                />
            </div>
        </form>
    )
}