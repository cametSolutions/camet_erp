import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedUser: null,
};

export const userFilter = createSlice({
  name: "userFilter",
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },

    removeAll: (state) => {
      Object.assign(state, initialState);
    },
  },
});

// Action creators are generated for each case reducer function
export const { setSelectedUser, removeAll } = userFilter.actions;

export default userFilter.reducer;
