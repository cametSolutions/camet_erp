import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedCompany: {},
};

export const companyFilter = createSlice({
  name: "companyFilter",
  initialState,
  reducers: {
    setSelectedCompanyFilter: (state, action) => {
      state.selectedCompany = action.payload;
    },

    removeAll: (state) => {
      Object.assign(state, initialState);
    },
  },
});

// Action creators are generated for each case reducer function
export const { setSelectedCompanyFilter, removeAll } = companyFilter.actions;

export default companyFilter.reducer;
