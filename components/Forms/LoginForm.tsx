"use client"
import { useState } from "react"
import { TextInput } from "../FormInputs/TextInput"
import { Button } from "../Button";

export function LoginForm() {
    const [userName, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    return (
        <form>
            <h2 className="text-purple font-semibold text-xl text-center mb-4">ĐĂNG NHẬP</h2>

            <div className="flex flex-col gap-y-5">
                <TextInput 
                    label={"Tên đăng nhập"} 
                    placeHolder={"Điền tên đăng nhập"}
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)}
                />

                <TextInput
                    label={"Mật khẩu"}
                    placeHolder={"Điền mật khẩu"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    inputType="password"
                />
            </div>

            <div className="flex justify-center mt-10">
                <Button
                    label={"Đăng nhập"}
                    className={"text-white bg-pink"}
                />
            </div>
        </form>
    )
}