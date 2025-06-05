import { createSlice } from "@reduxjs/toolkit";

const LABELS = [
  {
    id: 0,
    name: "Work",
    color: "yellow",
  },
  {
    id: 1,
    name: "Promissing offers",
    color: "purple",
  },
  {
    id: 2,
    name: "Read later",
    color: "red",
  },
];
export type Label = (typeof LABELS)[number];

const initialState: { labels: Label[] } = {
  labels: LABELS,
};

export const labelSlice = createSlice({
  name: "labels",
  initialState,
  reducers: {
    createLabel: (state, action) => {
      state.labels = [action.payload, ...state.labels];
    },
    updateLabel: (state, action) => {
      state.labels = state.labels.map((label) => {
        if (label.id === action.payload.id) {
          return { ...label, ...action.payload };
        } else return label;
      });
    },
  },
});
export const { updateLabel, createLabel } = labelSlice.actions;
export default labelSlice.reducer;
