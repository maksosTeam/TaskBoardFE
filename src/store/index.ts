import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import projectReducer from "./projectSlice";
import boardReducer from "./boardSlice";
import itemsReducer from "./itemsSlice.ts";
import statusesReducer from "./statusSlice";
import sprintReducer from "./sprintSlice.ts";

export const store = configureStore({
    reducer: {
        user: userReducer,
        projects: projectReducer,
        boards: boardReducer,
        items: itemsReducer,
        statuses: statusesReducer,
        sprints: sprintReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
