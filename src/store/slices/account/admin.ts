import axios from "axios"
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { AdminAuthState, IAdmin } from "@/lib/types/user.interface"
import { __config } from "@/constants/config"
import { deleteCookie } from "@/lib/utils"

export const fetchAdminFromServer = createAsyncThunk<IAdmin>(
  "admin/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {

      const { data } = await axios.get(`${__config.APP.BASE_URL}/api/v1/admin/profile`, {
        withCredentials: true,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          'x-api-key': __config.APP.API_KEY as string,
        }
      });
      if (!data.success) {
        await axios.get(`${__config.APP.BASE_URL}/api/v1/admin/logout`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            'x-api-key': __config.APP.API_KEY as string,
          }
        });
        deleteCookie("admin_access_token")

        window.location.href = "/h-panel";
      }


      if (!data.success) {
        throw new Error(data.message || "Failed to fetch admin profile")
      }
      return data.result as IAdmin
    } catch (err) {
      deleteCookie("admin_access_token")
      return rejectWithValue("Failed to load admin")
    }
  }
)

const initialState: AdminAuthState = {
  user: null,
  isLoggedIn: false,
}

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.isLoggedIn = true;
    },
    setLogout: (state) => {
      state.user = null
      state.isLoggedIn = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminFromServer.fulfilled, (state, action: PayloadAction<IAdmin>) => {
        state.user = action.payload
        state.isLoggedIn = true
      })
      .addCase(fetchAdminFromServer.rejected, (state) => {
        state.user = null
        state.isLoggedIn = false
      })
  },
})

export const { setLogout, setLogin } = adminSlice.actions
export default adminSlice.reducer
