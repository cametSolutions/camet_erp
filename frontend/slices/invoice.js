import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  party: {},
  items: [],
  selectedPriceLevel:""
};

export const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    addParty: (state, action) => {
      state.party = action.payload;
    },
    removeParty: (state) => {
      state.party = {};
    },
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    changeCount: (state, action) => {
      const id = action.payload._id;
      const newCount = action.payload.count;
      const indexToUpdate = state.items.findIndex((el) => el._id === id);
      if (indexToUpdate !== -1) {
        state.items[indexToUpdate].count = newCount;
      }
    },

    setPriceLevel:(state,action)=>{
      state.selectedPriceLevel=action.payload
    }
  },
});

// Action creators are generated for each case reducer function
export const { addParty, removeParty, addItem, changeCount ,setPriceLevel} =
  invoiceSlice.actions;

export default invoiceSlice.reducer;
