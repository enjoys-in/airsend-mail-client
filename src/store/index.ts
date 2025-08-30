import { configureStore } from "@reduxjs/toolkit";
import mailsReducer from "./slices/mail";
import accountReducer from "./slices/account";
import adminReducer from "./slices/account/admin";
import labelsReducer from "./slices/labels";
import foldersReducer from "./slices/folders";
import layoutReducer from "./slices/layout";

export const makeStore = () => {
  return configureStore({
    reducer: {
      layout: layoutReducer,
      mails: mailsReducer,
      accounts: accountReducer,
      labels: labelsReducer,
      folders: foldersReducer,
      mailboxes: foldersReducer,
      admin: adminReducer
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
