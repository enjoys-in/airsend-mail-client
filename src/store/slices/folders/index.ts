import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Folder {
  id: number;
  name: string;
}

interface FoldersState {
  folders: Folder[];
}

const initialState: FoldersState = {
  folders: [],
};

const foldersSlice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    createFolder(state, action: PayloadAction<Folder>) {
      state.folders.push(action.payload);
    },
  },
});

export const { createFolder } = foldersSlice.actions;
export default foldersSlice.reducer;
