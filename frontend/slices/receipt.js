import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  receiptNumber: "",
  date: new Date(),
  outStandings: [],
  party: {},
  finalAmount: 0,
  enteredAmount: 0,
  paymentMethod: "",
  paymentDetails: "",
};

export const salesSecondarySlice = createSlice({
  name: "salesSecondary",
  initialState,
  reducers: {
    addReceiptNumber: (state, action) => {
      state.receiptNumber = action.payload;
    },
    changeDate: (state, action) => {
      state.date = action.payload;
    },
    removeAll: (state) => {
      Object.assign(state, initialState);
    },
    removeParty: (state) => {
      state.party = {};
    },
  },
});

// Action creators are generated for each case reducer function
export const { addReceiptNumber, changeDate, removeAll, removeParty } =
  salesSecondarySlice.actions;

export default salesSecondarySlice.reducer;
