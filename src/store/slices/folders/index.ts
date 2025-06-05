import { createSlice } from "@reduxjs/toolkit";

const FOLDERS = [
  {
    id: 0,
    name: "Work",
  },
  {
    id: 1,
    name: "Promissing offers",
  },
  {
    id: 2,
    name: "Read later",
  },
];
export type Folder = (typeof FOLDERS)[number];

const initialState: { folders: Folder[] } = {
  folders: FOLDERS,
};

export const folderSlice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    createFolder: (state, action) => {
      state.folders = [action.payload, ...state.folders];
    },
    updateFolder: (state, action) => {
      state.folders = state.folders.map((folder) => {
        if (folder.id === action.payload.id) {
          return { ...folder, ...action.payload };
        } else return folder;
      });
    },
  },
});
export const { updateFolder, createFolder } = folderSlice.actions;
export default folderSlice.reducer;
