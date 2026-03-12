import { createSlice } from "@reduxjs/toolkit";

interface Mail {
  synced: boolean;
}

interface MailsState {
  mails: Mail[];
}

const initialState: MailsState = {
  mails: [],
};

const mailsSlice = createSlice({
  name: "mails",
  initialState,
  reducers: {},
});

export default mailsSlice.reducer;
