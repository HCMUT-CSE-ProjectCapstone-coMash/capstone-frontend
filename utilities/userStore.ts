import { User } from "@/types/user";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: User = {
    id: null,
    email: null,
    fullName: null,
    role: null,
    createdAt: null
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (_, action: PayloadAction<User>) => {
            return action.payload;
        },

        clearUser: () => {
            return initialState;
        }
    }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;