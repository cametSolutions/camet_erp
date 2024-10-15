import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  receiptNumber: "",
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
  note: "",
  isNoteOpen: false,
};

export const receiptSlice = createSlice({
  name: "receipt",
  initialState,
  reducers: {
    addReceiptNumber: (state, action) => {
      state.receiptNumber = action.payload;
    },
    changeDate: (state, action) => {
      state.date = new Date(action.payload).toISOString();
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
    addPaymentDetails: (state, action) => {
      const { _id, bank_ledname, bank_name } = action.payload;

      console.log(state.paymentDetails);

      state.paymentDetails = {
        ...state.paymentDetails,
        _id,
        bank_ledname,
        bank_name,
      };
    },
    addPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    addAllBankList: (state, action) => {
      state.bankList = action.payload;
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
  addIsNoteOpen,
  addReceiptId,
  setModifiedOutstandings 
} = receiptSlice.actions;

export default receiptSlice.reducer;
