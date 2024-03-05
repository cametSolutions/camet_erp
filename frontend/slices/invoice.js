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
    changeTotal:(state,action)=>{
      const id = action.payload._id;
      const newTotal = action.payload?.total|| 0;
      const indexToUpdate = state.items.findIndex((el) => el._id === id);
      if (indexToUpdate !== -1) {
        state.items[indexToUpdate].total = newTotal;
      }
    },
    changeIgstAndDiscount:(state,action)=>{
      const id = action.payload._id;
      const igst = action.payload?.igst|| 0;
      const discount = action.payload?.discount|| 0;
      const newTotal = action.payload?.total|| 0;

      const indexToUpdate = state.items.findIndex((el) => el._id === id);
      if (indexToUpdate !== -1) {
        state.items[indexToUpdate].total = newTotal;
        state.items[indexToUpdate].discount = discount;
        state.items[indexToUpdate].igst = igst;
      }
    },
 

    setPriceLevel:(state,action)=>{
      state.selectedPriceLevel=action.payload
    }
  },
});



// Action creators are generated for each case reducer function
export const { addParty, removeParty, addItem, changeCount ,setPriceLevel,changeTotal,changeIgstAndDiscount} =
  invoiceSlice.actions;

export default invoiceSlice.reducer;
