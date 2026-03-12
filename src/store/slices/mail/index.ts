import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MailFilter {
  type: string;
  value: string;
}

interface MailState {
  filter: MailFilter | null;
}

const initialState: MailState = {
  filter: null,
};

const mailSlice = createSlice({
  name: "mail",
  initialState,
  reducers: {
    updateFilter(state, action: PayloadAction<MailFilter>) {
      state.filter = action.payload;
    },
  },
});

export const { updateFilter } = mailSlice.actions;
export default mailSlice.reducer;
