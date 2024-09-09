import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  receiptNumber: "",
  date: new Date().toISOString(),
  outstandings: [],
  billData: [],
  party: {},
  totalBillAmount: 0,
  enteredAmount: 0,
  paymentMethod: "",
  paymentDetails: {},
  bankList: [],
  chequeNumber: "",
  chequeDate: new Date().toISOString(),
  note: "",
  isNoteOpen: false,
};

export const paymentSlice = createSlice({
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
    addPaymentDetails: (state, action) => {
      state.paymentDetails = action.payload;
    },
    addPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    addAllBankList: (state, action) => {
      state.bankList = action.payload;
    },
    addChequeNumber: (state, action) => {
      state.chequeNumber = action.payload;
    },
    addChequeDate: (state, action) => {
      state.chequeDate = action.payload;
    },

    addNote: (state, action) => {
      state.note = action.payload;
    },

    addIsNoteOpen: (state, action) => {
      state.isNoteOpen = action.payload;
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
  setTotalBillAmount,
  addPaymentDetails,
  addPaymentMethod,
  addAllBankList,
  addNote,
  addChequeNumber,
  addChequeDate,
  addIsNoteOpen
} = paymentSlice.actions;

export default paymentSlice.reducer;
