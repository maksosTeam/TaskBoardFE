import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface User {
    id: number;
    username?: string;
    email: string;
    password?: string;
    imagePath?: string | null;
    salt?: string;
}

interface UserState {
    user: User | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: UserState = {
    user: null,
    status: 'idle',
    error: null,
};

export const fetchCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
    'user/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('token');
        if (!token) {
            return rejectWithValue('Токен не найден');
        }
        try {

            const currentResp = await fetch('/api/auth/current', {
                method: 'GET',
                headers: {
                    'accept': 'text/plain',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!currentResp.ok) {
                const errorText = await currentResp.text();
                return rejectWithValue(errorText || 'Ошибка при получении userId');
            }

            const currentData = await currentResp.json();
            const { userId } = currentData;
            if (!userId) {
                return rejectWithValue('userId не найден');
            }

            const userResp = await fetch(`/api/user/current/${userId}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!userResp.ok) {
                const errorText = await userResp.text();
                return rejectWithValue(errorText || 'Ошибка при получении пользователя');
            }

            const userData = await userResp.json();
            return userData as User;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Ошибка при fetch');
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchCurrentUser.pending, state => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message || 'Ошибка';
            });
    },
});

export default userSlice.reducer;

