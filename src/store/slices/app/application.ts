import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    isRefreshing: false,
    isConnected: false,
    isDisabled: false,
};

export const applicationSlice = createSlice({
    name: "application",
    initialState,
    reducers: { 
        setApplicationStatus: (state, action) => {
            state = {...state, ...action.payload};
        },
        
    },
});
export const {setApplicationStatus} = applicationSlice.actions;
export default applicationSlice.reducer;
