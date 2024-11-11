import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  paymentSplittingData:{},
};

export const paymentSplitting = createSlice({
  name: "paymentSplitting",
  initialState,
  reducers: {
    addPaymentSplittingData: (state, action) => {
      state.paymentSplittingData = action.payload;
    },
    removeAll: (state) => {
      Object.assign(state, initialState);
    },


  },
  extraReducers: (builder) => {
    builder
      .addCase("salesSecondary/updateItem", (state) => {
        // Reset payment splitting when final amount changes
        Object.assign(state, initialState);
      })
      .addCase("salesSecondary/addAdditionalCharges", (state) => {
        // Reset payment splitting when new item is added
        Object.assign(state, initialState);
      })
      .addCase("salesSecondary/AddFinalAmount", (state) => {
        Object.assign(state, initialState);
      })
      .addCase("salesSecondary/removeAdditionalCharge", (state) => {
        Object.assign(state, initialState);
      })
      .addCase("salesSecondary/setFinalAmount", (state) => {
        Object.assign(state, initialState);
      })
      .addCase("salesSecondary/deleteRow", (state) => {
        Object.assign(state, initialState);
      })
      .addCase("salesSecondary/removeGodownOrBatch", (state) => {
        Object.assign(state, initialState);
      });
  },
});

// Action creators are generated for each case reducer function
export const { addPaymentSplittingData, removeAll } = paymentSplitting.actions;

export default paymentSplitting.reducer;
