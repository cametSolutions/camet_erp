import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  paymentSplittingData:{},
  initial:true //// for edit sale case/checking data is added in the first api call
};

export const paymentSplitting = createSlice({
  name: "paymentSplitting",
  initialState,
  reducers: {
    addPaymentSplittingData: (state, action) => {
      state.paymentSplittingData = action.payload;
      state.initial=false
    },
    removeAll: (state) => {
      Object.assign(state, initialState);
    },


  },
  extraReducers: (builder) => {
    builder
      .addCase("salesSecondary/updateItem", (state) => {
        // Reset payment splitting when final amount changes
        state.paymentSplittingData = {};
      })
      .addCase("salesSecondary/addAdditionalCharges", (state) => {
        // Reset payment splitting when new item is added
        state.paymentSplittingData = {};
      })
      .addCase("salesSecondary/AddFinalAmount", (state) => {
        state.paymentSplittingData = {};
      })
      .addCase("salesSecondary/removeAdditionalCharge", (state) => {
        state.paymentSplittingData = {};
      })
      .addCase("salesSecondary/setFinalAmount", (state) => {
        state.paymentSplittingData = {};
      })
      .addCase("salesSecondary/deleteRow", (state) => {
        state.paymentSplittingData = {};
      })
      .addCase("salesSecondary/removeGodownOrBatch", (state) => {
        state.paymentSplittingData = {};
      });
  },
});

// Action creators are generated for each case reducer function
export const { addPaymentSplittingData, removeAll } = paymentSplitting.actions;

export default paymentSplitting.reducer;
