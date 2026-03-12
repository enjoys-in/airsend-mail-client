import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Label {
  id: number;
  name: string;
  color: string;
}

interface LabelsState {
  labels: Label[];
}

const initialState: LabelsState = {
  labels: [],
};

const labelsSlice = createSlice({
  name: "labels",
  initialState,
  reducers: {
    createLabel(state, action: PayloadAction<Label>) {
      state.labels.push(action.payload);
    },
  },
});

export const { createLabel } = labelsSlice.actions;
export default labelsSlice.reducer;
