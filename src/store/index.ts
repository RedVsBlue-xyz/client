import { configureStore } from "@reduxjs/toolkit";
import { eventSlice } from "./events";
//import { load, save } from "redux-localstorage-simple";
import { createWrapper } from "next-redux-wrapper";
import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from "react-redux";

export const makeStore = () => configureStore({
  reducer: {
    events: eventSlice.reducer,
  },
  // preloadedState: load({
  //   states: ["events"],
  // }),
  // middleware: (getDefaultMiddleware) =>
  //     getDefaultMiddleware({ serializableCheck: false })
  //         .concat(save({ states: ["events"], debounce: 100})),
  devTools: true,

});

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore: () => AppStore = useStore