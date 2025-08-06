import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  voucherNumber: "",
  voucherType: "",
  voucherSeries: null,
  selectedVoucherSeries: null,
  mode: "create",
  date: "",
  outstandings: [],
  modifiedOutstandings: [], ////used in the case of edit
  billData: null,
  party: null,
  totalBillAmount: 0,
  enteredAmount: null,
  advanceAmount: null,
  remainingAmount: null,
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

export const commonAccountingVoucherSlice = createSlice({
  name: "commonAccountingVoucher",
  initialState,
  reducers: {
    addVoucherNumber: (state, action) => {
      state.voucherNumber = action.payload;
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
      const {
        billData,
        totalBillAmount,
        enteredAmount,
        advanceAmount,
        remainingAmount,
      } = action.payload;
      console.log(advanceAmount);

      state.billData = billData;
      state.totalBillAmount = totalBillAmount;
      state.enteredAmount = enteredAmount;
      state.advanceAmount = advanceAmount || 0;
      state.remainingAmount = remainingAmount || 0;

      // if (enteredAmount > totalBillAmount) {
      //   state.advanceAmount = enteredAmount - totalBillAmount;
      //   state.remainingAmount = 0;
      // } else {
      //   state.advanceAmount = 0;
      //   state.remainingAmount = totalBillAmount - enteredAmount;
      // }
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
    addVoucherType: (state, action) => {
      state.voucherType = action.payload;
    },
    addMode: (state, action) => {
      state.mode = action.payload;
    },
    addEnteredAmount: (state, action) => {
      state.enteredAmount = action.payload;
    },
    addRemainingAmount: (state, action) => {
      state.remainingAmount = action.payload;
    },
    addAdvanceAmount: (state, action) => {
      state.advanceAmount = action.payload;
    },
    addTotalBillAmount: (state, action) => {
      state.totalBillAmount = action.payload;
    },
    addBillData: (state, action) => {
      state.billData = action.payload;
    },
    addVoucherSeries: (state, action) => {
      state.voucherSeries = action.payload;
    },

    addSelectedVoucherSeries: (state, action) => {
      state.selectedVoucherSeries = action.payload;
    },

    addReceiptId: (state, action) => {
      state._id = action.payload;
    },
    
  },
});

// Action creators are generated for each case reducer function
export const {
  addVoucherNumber,
  changeDate,
  removeAll,
  removeParty,
  addParty,
  addSettlementData,
  addOutstandings,
  setTotalBillAmount,
  addPaymentMethod,
  addAllBankList,
  addAllCashList,
  addNote,
  addChequeNumber,
  addChequeDate,
  addIsNoteOpen,
  addReceiptId,
  setModifiedOutstandings,
  addBankPaymentDetails,
  addCashPaymentDetails,
  addVoucherType,
  addMode,
  addEnteredAmount,
  addRemainingAmount,
  addAdvanceAmount,
  addTotalBillAmount,
  addBillData,
  addVoucherSeries,
  addSelectedVoucherSeries,
} = commonAccountingVoucherSlice.actions;

export default commonAccountingVoucherSlice.reducer;
