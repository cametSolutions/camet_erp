import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  receiptNumber: "",
  date: new Date(),
  outstandings:[],
  billData: [],
  party: {},
  totalBillAmount: 0,
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
    addParty: (state, action) => {
      state.party = action.payload;
    },
    addSettlementData: (state, action) => {
      const { billData, totalBillAmount, enteredAmount } = action.payload;

      state.billData = billData;
      state.totalBillAmount = totalBillAmount;
      state.enteredAmount = enteredAmount;
    },
    addOutstandings: (state, action) => {
      state.outstandings = action.payload;
    },
    setTotalBillAmount: (state, action) => {
      state.totalBillAmount = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  addReceiptNumber,
  changeDate,
  removeAll,
  removeParty,
  addParty,
  addSettlementData,
  addOutstandings,
  setTotalBillAmount
} = salesSecondarySlice.actions;

export default salesSecondarySlice.reducer;
