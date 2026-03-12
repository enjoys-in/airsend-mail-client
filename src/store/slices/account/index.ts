import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "@/lib/types/user.interface";
import { deleteCookie } from "@/lib/utils";
import { instance } from "@/lib/api/api.instance";

export const fetchCurrentUser = createAsyncThunk<IUser>(
  "account/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await instance.get(`/api/v1/profile`);
      
      if (!data.success) {
        await instance.post('/api/v1/auth/logout');
        deleteCookie("access_token")
        window.location.href = "/v2";
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch user profile")
      }
      // Only pick declared IUser fields — strip sensitive data (PGP keys, DKIM private, etc.)
      const raw = data.result;
      return {
        mid: raw.mid,
        email: raw.email,
        domain_name: raw.domain_name,
        tenant_name: raw.tenant_name,
        name: raw.name,
        role: raw.role,
        hasOrgs: raw.hasOrgs ?? null,
      } as IUser;
    } catch (err) {
      deleteCookie("access_token")
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

const emailAccounts: EmailAccount[] = [];

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
