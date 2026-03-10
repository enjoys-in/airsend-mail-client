import { configureStore } from "@reduxjs/toolkit";

import accountReducer from "./slices/account";
import adminReducer from "./slices/account/admin";

import layoutReducer from "./slices/layout";

export const makeStore = () => {
  return configureStore({
    reducer: {
      layout: layoutReducer,
      accounts: accountReducer,
      admin: adminReducer
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
