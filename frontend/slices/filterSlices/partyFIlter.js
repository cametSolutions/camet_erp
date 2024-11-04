import { createSlice } from "@reduxjs/toolkit";

const initialState = {
selectedParty:{}
};

export const partyFilter = createSlice({
  name: "partyFilter",
  initialState,
  reducers: {
    setSelectedParty: (state, action) => {
      state.selectedParty = action.payload;
    },

    removeAll: (state) => {
      Object.assign(state, initialState);
    },
  },
});

// Action creators are generated for each case reducer function
export const { setSelectedParty,removeAll } = partyFilter.actions;

export default partyFilter.reducer;
