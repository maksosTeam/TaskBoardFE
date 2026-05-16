import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchStatusesByBoard = createAsyncThunk(
    "statuses/fetchByBoard",
    async (boardId: number, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/board/get-statuses/1`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Ошибка ${res.status}`);
            return { boardId, statuses: await res.json() };
            console.log(res.json());
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

interface Status {
    id: number;
    name: string;
    boardId: number;
    order: number;
    isDone: boolean;
    isRejected: boolean;
}

interface StatusesState {
    byBoard: {
        [boardId: number]: Status[];
    };
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: StatusesState = {
    byBoard: {},
    status: "idle",
    error: null,
};

const statusesSlice = createSlice({
    name: "statuses",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStatusesByBoard.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchStatusesByBoard.fulfilled, (state, action) => {
                state.status = "succeeded";
                const { boardId, statuses } = action.payload;
                state.byBoard[boardId] = statuses;
            })
            .addCase(fetchStatusesByBoard.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });
    },
});

export default statusesSlice.reducer;
