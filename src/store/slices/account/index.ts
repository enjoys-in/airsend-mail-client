import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "@/lib/types/user.interface";
import { __config } from "@/constants/config"
export const fetchCurrentUser = createAsyncThunk<IUser>(
  "account/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {

      const { data } = await axios.get(`${__config.APP.BASE_URL}/api/v1/profile`, {
        withCredentials: true,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          'x-api-key': __config.APP.API_KEY as string,
        }
      });
      if (!data.success) {
        document.cookie = "access_token=; Max-Age=0; path=/";


        window.location.href = "/v2";
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch user profile")
      }
      return data.result as IUser;
    } catch (err) {
      return rejectWithValue("Failed to fetch current user");
    }
  }
);

export type Account = IUser;
interface EmailAccount {
  domain: string;
  email: string;
  name: string;
  usage: string;
  limit: string;
}
// dummyData.ts
const emailAccounts: EmailAccount[] = [
  { domain: "airsend.in", email: "mullayam06@airsend.in", name: "Mullayam", usage: "2GB", limit: "10GB" },
  { domain: "airsend.in", email: "lalu@airsend.in", name: "Lalu", usage: "3GB", limit: "10GB" },
  { domain: "airsend.in", email: "mayawati@airsend.in", name: "Mayawati", usage: "5GB", limit: "10GB" },
];

interface AccountState {
  currAccount: Account | null;
  accounts: EmailAccount[];
  domains: string[];
  loading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  currAccount: null,
  accounts: emailAccounts,
  domains: [],
  loading: false,
  error: null,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setCurrAccount: (state, action: PayloadAction<Account>) => {
      state.currAccount = action.payload;
    },
    setMyDomains: (state, action: PayloadAction<string[]>) => {
      state.domains = action.payload;
    },
    setAccounts: (state, action: PayloadAction<EmailAccount[]>) => {
      state.accounts = action.payload;
    },

    setLogout: (state) => {
      state.currAccount = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.currAccount = action.payload;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.currAccount = null;
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrAccount, setMyDomains, setLogout, setAccounts } = accountSlice.actions;
export default accountSlice.reducer;
