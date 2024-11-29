import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  _id: "",
  paymentNumber: "",
  date: new Date().toISOString(),
  outstandings: [],
  modifiedOutstandings: [], ////used in the case of edit

  billData: [],
  party: {},
  totalBillAmount: 0,
  enteredAmount: 0,
  advanceAmount: 0,
  remainingAmount: 0,
  paymentMethod: "",
  paymentDetails: {
    _id: null,
    bank_name: null,
    bank_ledname: null,
    chequeNumber: "",
    chequeDate: new Date().toISOString(),
  },
  bankList: [],
  cashList: [],

  note: "",
  isNoteOpen: false,
};

export const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    addPaymentNumber: (state, action) => {
      state.paymentNumber = action.payload;
    },
    changeDate: (state, action) => {
      state.date = action.payload;
    },
    removeAll: (state) => {
      Object.assign(state, initialState);
    },
    removeParty: (state) => {
      state.party = {};
      state.enteredAmount = 0;
    },
    addParty: (state, action) => {
      state.party = action.payload;
      state.enteredAmount = 0;
    },
    addSettlementData: (state, action) => {
      const { billData, totalBillAmount, enteredAmount } = action.payload;

      state.billData = billData;
      state.totalBillAmount = totalBillAmount;
      state.enteredAmount = enteredAmount;

      if (enteredAmount > totalBillAmount) {
        state.advanceAmount = enteredAmount - totalBillAmount;
        state.remainingAmount = 0;
      } else {
        state.advanceAmount = 0;
        state.remainingAmount = totalBillAmount - enteredAmount;
      }
    },
    addOutstandings: (state, action) => {
      state.outstandings = action.payload;
    },
    setTotalBillAmount: (state, action) => {
      state.totalBillAmount = action.payload;
    },
    addBankPaymentDetails: (state, action) => {
      const { _id, bank_ledname, bank_name } = action.payload;

      const chequeDate = state.paymentDetails.chequeDate;

      state.paymentDetails = {
        chequeDate,
        _id,
        bank_ledname,
        bank_name,
      };
    },
    addCashPaymentDetails: (state, action) => {
      const { _id, cash_ledname } = action.payload;

      const chequeDate = state.paymentDetails.chequeDate;

      state.paymentDetails = {
        // ...state.paymentDetails,
        chequeDate,
        _id,
        cash_ledname,
      };
    },
    addPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    addAllBankList: (state, action) => {
      state.bankList = action.payload;
    },
    addAllCashList: (state, action) => {
      state.cashList = action.payload;
    },
    addChequeNumber: (state, action) => {
      // state.chequeNumber = action.payload;

      state.paymentDetails.chequeNumber = action.payload;
    },
    addChequeDate: (state, action) => {
      // state.chequeDate = action.payload;

      state.paymentDetails.chequeDate = action.payload;
    },

    addNote: (state, action) => {
      state.note = action.payload;
    },

    addIsNoteOpen: (state, action) => {
      state.isNoteOpen = action.payload;
    },

    addReceiptId: (state, action) => {
      state._id = action.payload;
    },
    setModifiedOutstandings: (state, action) => {
      state.modifiedOutstandings = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  addPaymentNumber,
  changeDate,
  removeAll,
  removeParty,
  addParty,
  addSettlementData,
  addOutstandings,
  setTotalBillAmount,
  addPaymentMethod,
  addAllBankList,
  addNote,
  addChequeNumber,
  addChequeDate,
  addIsNoteOpen,
  addReceiptId,
  setModifiedOutstandings,
  addBankPaymentDetails,
  addCashPaymentDetails,
  addAllCashList
} = paymentSlice.actions;

export default paymentSlice.reducer;
