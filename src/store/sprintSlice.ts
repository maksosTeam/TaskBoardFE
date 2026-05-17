import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface SprintItem {
    id: number;
    name: string;
}

export interface Sprint {
    id: number;
    boardId: number;
    name: string;
    startDate: string;
    endDate: string;
    items?: SprintItem[];
}

interface SprintsState {
    byBoard: Record<number, Sprint[]>;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

export const fetchSprintsByBoard = createAsyncThunk(
    "sprints/fetchByBoard",
    async (boardId: number, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/sprint/get/board/${boardId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Ошибка ${res.status}`);
            const data = await res.json();
            const sprints = Array.isArray(data) ? data : [];
            return { boardId, sprints };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const createSprint = createAsyncThunk(
    "sprints/create",
    async (
        payload: { boardId: number; sprint: Omit<Sprint, "id"> },
        { rejectWithValue }
    ) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/sprint/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload.sprint),
            });
            if (!res.ok) throw new Error(`Ошибка ${res.status}`);
            const newSprint = await res.json();
            if (!newSprint || !newSprint.id) {
                throw new Error("Invalid response: missing sprint ID");
            }
            return { boardId: payload.boardId, sprint: newSprint };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const updateSprint = createAsyncThunk(
    "sprints/update",
    async (sprint: Sprint, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/sprint/update`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(sprint),
            });
            if (!res.ok) throw new Error(`Ошибка ${res.status}`);
            const updated = await res.json();
            if (!updated || !updated.id) {
                throw new Error("Invalid response: missing sprint ID");
            }
            return updated;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteSprint = createAsyncThunk(
    "sprints/delete",
    async (
        payload: { boardId: number; sprintId: number },
        { rejectWithValue }
    ) => {
        try {
            if (!payload.sprintId) {
                throw new Error("Sprint ID is required for deletion");
            }
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/sprint/delete/${payload.sprintId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Ошибка ${res.status}`);
            return payload;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const addItemToSprint = createAsyncThunk(
    "sprints/addItem",
    async (
        payload: { sprintId: number; itemId: number; boardId: number },
        { rejectWithValue }
    ) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `/api/sprint/add-item/${payload.sprintId}?itemId=${payload.itemId}`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) throw new Error(`Ошибка ${res.status}`);
            return payload;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

const sprintSlice = createSlice({
    name: "sprints",
    initialState: {
        byBoard: {} as Record<number, Sprint[]>,
        status: "idle" as "idle" | "loading" | "succeeded" | "failed",
        error: null as string | null,
    } as SprintsState,
    reducers: {
        addSprint(state, action) {
            const { boardId, sprint } = action.payload;
            if (!state.byBoard[boardId]) state.byBoard[boardId] = [];
            state.byBoard[boardId].push(sprint);
        },
        clearSprints(state) {
            state.byBoard = {};
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch sprints
            .addCase(fetchSprintsByBoard.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchSprintsByBoard.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.byBoard[action.payload.boardId] = action.payload.sprints;
            })
            .addCase(fetchSprintsByBoard.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            })
            // Create sprint
            .addCase(createSprint.fulfilled, (state, action) => {
                const { boardId, sprint } = action.payload;
                if (!state.byBoard[boardId]) {
                    state.byBoard[boardId] = [];
                }
                state.byBoard[boardId].push(sprint);
                // ✅ Сбрасываем статус, чтобы UI знал, что операция завершена
                state.status = "succeeded";
            })
            .addCase(createSprint.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            })
            // Update sprint
            .addCase(updateSprint.fulfilled, (state, action) => {
                const updated = action.payload;
                // ✅ Ищем спринт по всем доскам и обновляем
                let found = false;
                Object.keys(state.byBoard).forEach((boardId) => {
                    const boardIdNum = parseInt(boardId);
                    const index = state.byBoard[boardIdNum].findIndex(
                        (s) => s.id === updated.id
                    );
                    if (index !== -1) {
                        state.byBoard[boardIdNum][index] = updated;
                        found = true;
                    }
                });
                // Если спринт не найден, но у него есть boardId - добавляем
                if (!found && updated.boardId) {
                    if (!state.byBoard[updated.boardId]) {
                        state.byBoard[updated.boardId] = [];
                    }
                    state.byBoard[updated.boardId].push(updated);
                }
                state.status = "succeeded";
            })
            .addCase(updateSprint.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            })
            // Delete sprint
            .addCase(deleteSprint.fulfilled, (state, action) => {
                const { boardId, sprintId } = action.payload;
                if (state.byBoard[boardId]) {
                    state.byBoard[boardId] = state.byBoard[boardId].filter(
                        (s) => s.id !== sprintId
                    );
                }
                state.status = "succeeded";
            })
            .addCase(deleteSprint.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            })
            // Add item to sprint
            .addCase(addItemToSprint.fulfilled, (state, action) => {
                // Здесь можно добавить логику обновления items если нужно
                state.status = "succeeded";
            });
    },
});

export const { addSprint, clearSprints } = sprintSlice.actions;
export default sprintSlice.reducer;