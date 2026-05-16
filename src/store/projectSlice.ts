import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchProjects = createAsyncThunk(
    "projects/fetchProjects",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/project/get-all", {
                method: "GET",
                headers: {
                    accept: "text/plain",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error(`Ошибка ${res.status}: ${res.statusText}`);
            }
            const data = await res.json();
            return data; // массив проектов
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const projectSlice = createSlice({
    name: "projects",
    initialState: {
        items: [],
        status: "idle", // idle | loading | succeeded | failed
        error: null,
    },
    reducers: {
        // при необходимости локальные изменения
        addProject(state, action) {
            state.items.push(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const { addProject } = projectSlice.actions;
export default projectSlice.reducer;
