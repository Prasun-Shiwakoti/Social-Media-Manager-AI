import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  isAuthenticated: false,
  userId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});
export default authSlice.reducer;
export const { loginSuccess, logout } = authSlice.actions;

