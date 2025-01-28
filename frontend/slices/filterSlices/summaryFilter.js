import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    selectedOption: "Ledger",
};

export const summaryFilterSlice = createSlice({
  name: "summaryFilter",
  initialState,
  reducers: {
    setSelectedOption: (state, action) => {
      state.selectedOption = action.payload;
    },

    removeAll: (state) => {
      Object.assign(state, initialState);
    },
  },
});

// Action creators are generated for each case reducer function
export const { setSelectedOption, removeAll } = summaryFilterSlice.actions;

export default summaryFilterSlice.reducer;
