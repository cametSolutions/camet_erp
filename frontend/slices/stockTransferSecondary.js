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
      const { id, godown } = action.payload;

      state.selectedGodown = {
        godown,
        godown_id: id,
      };
    },
    removeAll: (state) => {
      Object.assign(state, initialState);
    },

    removeGodown: (state) => {
      state.selectedGodown = initialState.selectedGodown;
    },
  },
});

export const { addSelectedGodown, removeAll ,removeGodown} = stockTransferSlice.actions;
export default stockTransferSlice.reducer;
