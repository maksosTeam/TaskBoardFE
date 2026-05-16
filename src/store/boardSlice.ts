import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/*
  Структура хранилища
  boards = {
    byProject: {
      [projectId]: Board[]
    },
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: null | string
  }
*/

export const fetchBoardsByProject = createAsyncThunk(
    "boards/fetchByProject",
    async (projectId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/board/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Ошибка ${res.status}`);
            return { projectId, boards: await res.json() };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

const boardSlice = createSlice({
    name: "boards",
    initialState: {
        byProject: {},
        status: "idle",
        error: null,
    },
    reducers: {
        addBoard(state, action) {
            const { projectId, board } = action.payload;
            if (!state.byProject[projectId]) state.byProject[projectId] = [];
            state.byProject[projectId].push(board);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBoardsByProject.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchBoardsByProject.fulfilled, (state, action) => {
                state.status = "succeeded";
                const { projectId, boards } = action.payload;
                state.byProject[projectId] = boards;
            })
            .addCase(fetchBoardsByProject.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const { addBoard } = boardSlice.actions;
export default boardSlice.reducer;
