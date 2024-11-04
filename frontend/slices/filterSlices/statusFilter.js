import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedStatus: {},
};

export const statusFilter = createSlice({
  name: "statusFilter",
  initialState,
  reducers: {
    setSelectedStatus: (state, action) => {
      if (action.payload.value === "all") {
        state.selectedStatus = {};
      } else {
        state.selectedStatus = action.payload;
      }
    },

    removeAll: (state) => {
      Object.assign(state, initialState);
    },
  },
});

// Action creators are generated for each case reducer function
export const { setSelectedStatus, removeAll } = statusFilter.actions;

export default statusFilter.reducer;
