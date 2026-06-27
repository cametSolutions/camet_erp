import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  permissions: {},
  userType: null,
};

const permissionSlice = createSlice({
  name: "permissionData",
  
  initialState,
  reducers: {
    storingPermissions: (state, action) => {
      state.permissions = action.payload || {};
    },
    storingUserType: (state, action) => {
      state.userType = action.payload || null;
    },
    removePermissions: (state) => {
      state.permissions = {};
      state.userType = null;
    },
  },
});

export const {
  storingPermissions,
  storingUserType,
  removePermissions,
} = permissionSlice.actions;

export default permissionSlice.reducer;