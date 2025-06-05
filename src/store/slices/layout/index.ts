import { createSlice } from "@reduxjs/toolkit";

const initialState: {
  sidebarTab: "Mailbox" | "Settings";
} = {
  sidebarTab: "Mailbox",
};

export const LayoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    setSidebarTab: (state, action) => {
      state.sidebarTab = action.payload;
    },
  },
});
export const { setSidebarTab } = LayoutSlice.actions;
export default LayoutSlice.reducer;
