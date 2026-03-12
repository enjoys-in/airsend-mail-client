import { configureStore } from "@reduxjs/toolkit";

import accountReducer from "./slices/account";
import adminReducer from "./slices/account/admin";
import labelsReducer from "./slices/labels";
import foldersReducer from "./slices/folders";
import mailsReducer from "./slices/mails";
import mailReducer from "./slices/mail";

import layoutReducer from "./slices/layout";

export const makeStore = () => {
  return configureStore({
    reducer: {
      layout: layoutReducer,
      accounts: accountReducer,
      admin: adminReducer,
      labels: labelsReducer,
      folders: foldersReducer,
      mails: mailsReducer,
      mail: mailReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
