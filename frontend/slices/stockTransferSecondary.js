import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedGodown: {
    godown: "",
    godown_id: "",
  },

  item: [],
};

const stockTransferSlice = createSlice({
  name: "stockTransfer",
  initialState,
  reducers: {
    addSelectedGodown: (state, action) => {
      console.log(action.payload);
    },
  },
});

export const {addSelectedGodown} = stockTransferSlice.actions;
export default stockTransferSlice.reducer;
