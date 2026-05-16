import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import projectReducer from "./projectSlice";
import boardReducer from "./boardSlice";
import itemsReducer from "./itemsSlice.ts";
import statusesReducer from "./statusSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        projects: projectReducer,
        boards: boardReducer,
        items: itemsReducer,
        statuses: statusesReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
