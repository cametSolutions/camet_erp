import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedVoucher: {
    title:"All Vouchers",
    value:"all"
  }
};

export const voucherType = createSlice({
  name: "voucherType",
  initialState,
  reducers: {
    setSelectedVoucher: (state, action) => {
      state.selectedVoucher = action.payload;
    },

    removeAll: (state) => {
      Object.assign(state, initialState);
    },
  },
});

// Action creators are generated for each case reducer function
export const { setSelectedVoucher,removeAll } = voucherType.actions;

export default voucherType.reducer;
