import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allParties: [],  ///globally saving parties which can be used in bill to ship to of every voucher
};

export const partySlice = createSlice({
  name: "partySlice",
  initialState,
  reducers: {
    addAllParties: (state, action) => {

      state.allParties = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { addAllParties} = partySlice.actions;

export default partySlice.reducer;
