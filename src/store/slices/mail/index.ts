
 
import { MailData } from "@/lib/types/mail.interface";
import { createSlice } from "@reduxjs/toolkit";

export interface IMail  extends MailData{
  id: string;
  message_id: string;
  from: string;
  email: string;
  receipients: string[];
  to: string;
  hasAttachment: boolean;
  isRead: boolean;
  isStarred: boolean;
  timestamp: string;
  title: string;
  contents: string;
  shortContent: string;
}

const initialState: {
  selected: string[];
  currentMail: MailData | null;
  mails: MailData[];
  mainCheckbox: boolean;
} = {
  selected: [],
  currentMail: null,
  mails: [],
  mainCheckbox: false,
};

export const mailSlice = createSlice({
  name: "mail",
  initialState,
  reducers: {
    setCurrentMail: (state, action) => {  
          
      state.currentMail = {
        ...action.payload
      }
      if (state.currentMail) {
        state.currentMail.synced = true
      }

    },
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
    setMainCheckbox: (state, action) => {
      state.mainCheckbox = action.payload;
    },
    toggleMailStar: (state, action) => {
      const idx = state.mails.findIndex((mail) => mail.message_id === action.payload);
      // state.mails[idx].isStarred = !state.mails[idx].isStarred;
      state.currentMail = state.mails[idx];
    },
    removeMails: (state, action) => {
      state.mails = state.mails.filter(
        (mail) => !action.payload.includes(mail.message_id)
      );
      state.currentMail = null;
      state.selected = [];
    },
    updateReadStatus: (state, action) => {
      const { selectedIds, newIsRead } = action.payload;
      state.mails = state.mails.map((mail) => {
        if (selectedIds.includes(mail.message_id)) {
          return {
            ...mail,
            isRead: newIsRead,
          };
        }
        return mail;
      });
      state.selected = [];
      state.currentMail =
        state.mails.find((m) => m.message_id === state.currentMail?.message_id) || null;
    },
    addNewMail: (state, action) => {
      state.mails.unshift(action.payload);
    },
    updateFilter: (state, action) => {
      const { payload } = action;
      // if (payload.type === "cancel" || payload.value === "") {
      //   // state.mails = INBOX_DATA;
      // } else if (payload.type === "search") {
      //   state.mails = INBOX_DATA.filter(
      //     (mail) =>
      //       mail.title.toLowerCase().includes(payload.value.toLowerCase()) ||
      //       mail.contents?.includes(payload.value.toLowerCase())
      //   );
      // }
    },
  },
});
export const {
  setSelected,
  setMainCheckbox,
  setCurrentMail,
  toggleMailStar,
  removeMails,
  updateReadStatus,
  updateFilter, addNewMail
} = mailSlice.actions;
export default mailSlice.reducer;
