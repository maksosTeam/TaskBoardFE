import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/*
  Структура хранилища:
  items = {
    byBoard: {
      [boardId]: Item[]
    },
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: null | string
  }
*/

export const fetchItemsByBoard = createAsyncThunk(
    "items/fetchByBoard",
    async (boardId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/item/board/${boardId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Ошибка ${res.status}`);
            const data = await res.json();
            console.log(data);
            return { boardId, items: data };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

const itemsSlice = createSlice({
    name: "items",
    initialState: {
        byBoard: {},
        status: "idle",
        error: null,
    },
    reducers: {
        addItem(state, action) {
            const { boardId, item } = action.payload;
            if (!state.byBoard[boardId]) state.byBoard[boardId] = [];
            state.byBoard[boardId].push(item);
        },
        updateItem(state, action) {
            const { boardId, item } = action.payload;
            const index = state.byBoard[boardId]?.findIndex(i => i.id === item.id);
            if (index !== -1) {
                state.byBoard[boardId][index] = item;
            }
        },
        removeItem(state, action) {
            const { boardId, itemId } = action.payload;
            state.byBoard[boardId] = state.byBoard[boardId]?.filter(i => i.id !== itemId);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchItemsByBoard.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchItemsByBoard.fulfilled, (state, action) => {
                state.status = "succeeded";
                const { boardId, items } = action.payload;
                state.byBoard[boardId] = items;
            })
            .addCase(fetchItemsByBoard.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const { addItem, updateItem, removeItem } = itemsSlice.actions;
export default itemsSlice.reducer;
