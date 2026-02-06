import { createSlice } from "@reduxjs/toolkit";
import { split } from "postcss/lib/list";

const initialState = {
  paymentDetails: {
    total: 0,
  },
  selectedParty: null,
  paymentMode: "single",
  splitPayment: [],
  onlinePartyName:"",
  onlineType:"",
  printData: {},
};

export const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setPaymentDetails: (state, action) => {
      state.paymentDetails = action.payload;
    },
    setSelectedParty: (state, action) => {
      state.selectedParty = action.payload;
    },
    setSelectedPaymentMode: (state, action) => {
      state.paymentMode = action.payload;
    },
    setSelectedSplitPayment: (state, action) => {
      state.splitPayment = action.payload;
    },
    setOnlinepartyName: (state, action) => {
      state.onlinePartyName = action.payload;
    },
    setOnlineType: (state, action) => {
      state.onlineType = action.payload;
    },
     setPrintDetails: (state, action) => {
      state.printData = action.payload;
    },
    removeAll: () => initialState,
  },
});

export const {
  setPaymentDetails,
  setSelectedParty,
  setSelectedPaymentMode,
  setSelectedSplitPayment,
  setOnlinepartyName,
  setOnlineType,
  removeAll,
  setPrintDetails
} = paymentSlice.actions;

export default paymentSlice.reducer;
