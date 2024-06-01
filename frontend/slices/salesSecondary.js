import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  party: {},
  items: [],
  selectedPriceLevel: "",
  additionalCharges: [],
  finalAmount: 0,
  persistScrollId: "",
  brand: "",
  category: "",
  subcategory: "",
  id: "",
  heights: {},
};

export const salesSecondarySlice = createSlice({
  name: "salesSecondary",
  initialState,
  reducers: {
    addParty: (state, action) => {
      state.party = action.payload;
    },
    removeParty: (state) => {
      state.party = {};
    },

    addAllProducts: (state, action) => {
      state.products = action.payload;
    },
    removeItem: (state, action) => {
      const id = action.payload._id;
      const index = state.items.findIndex((el) => el._id === id);

      state.items.splice(index, 1);
    },
    changeCount: (state, action) => {
      const id = action.payload._id;
      const newCount = action.payload?.count;
      const indexToUpdate = state.items.findIndex((el) => el._id === id);
      if (indexToUpdate !== -1) {
        state.items[indexToUpdate].count = newCount;
      }
    },
    changeGodownCount: (state, action) => {
      const id = action.payload._id;
      const indexToUpdate = state.items.findIndex((el) => el._id == id);
      if (indexToUpdate !== -1) {
        state.items[indexToUpdate].GodownList = action.payload.GodownList;
      }
    },
    changeTotal: (state, action) => {
      const id = action.payload._id;
      const newTotal = action.payload?.total || 0;
      const indexToUpdate = state.items.findIndex((el) => el._id == id);
      if (indexToUpdate !== -1) {
        state.items[indexToUpdate].total = newTotal;
      }
    },
    changeIgstAndDiscount: (state, action) => {
      const id = action.payload._id;
      const igst = action.payload?.igst || 0;
      const count = action.payload?.count || 0;
      const discount = action.payload?.discount || 0;
      const discountPercentage = action.payload?.discountPercentage || 0;
      const newTotal = action.payload?.total.toFixed(2) || 0;
      const godownList = action.payload?.GodownList;
      console.log(godownList);

      const indexToUpdate = state.items.findIndex((el) => el._id === id);
      if (indexToUpdate !== -1) {
        state.items[indexToUpdate].total = newTotal;
        state.items[indexToUpdate].discount = discount;
        state.items[indexToUpdate].igst = igst;
        state.items[indexToUpdate].discountPercentage = discountPercentage;
        state.items[indexToUpdate].count = count;
        state.items[indexToUpdate].GodownList = godownList;
      }
    },

    addAdditionalCharges: (state, action) => {
      // state.items.additionalCharges=action.payload
      const { index, row } = action.payload;
      state.additionalCharges[index] = row;
    },
    removeAdditionalCharge: (state) => {
      state.additionalCharges = [];
    },
    deleteRow(state, action) {
      const index = action.payload;
      state.additionalCharges.splice(index, 1);
    },
    AddFinalAmount: (state, action) => {
      state.finalAmount = action.payload;
    },
    setPriceLevel: (state, action) => {
      state.selectedPriceLevel = action.payload;
    },
    removeAll: (state) => {
      Object.assign(state, initialState);
    },
    persistScroll: (state, action) => {
      state.persistScrollId = action.payload;
    },
    setBrandInRedux: (state, action) => {
      state.brand = action.payload;
    },
    setCategoryInRedux: (state, action) => {
      state.category = action.payload;
    },
    setSubCategoryInRedux: (state, action) => {
      state.subcategory = action.payload;
    },
    setParty: (state, action) => {
      state.party = action.payload;
    },
    setItem: (state, action) => {
      state.items = action.payload;
    },
    setSelectedPriceLevel: (state, action) => {
      state.selectedPriceLevel = action.payload;
    },
    setAdditionalCharges: (state, action) => {
      state.additionalCharges = action.payload;
    },
    setFinalAmount: (state, action) => {
      state.finalAmount = action.payload;
    },

    saveId: (state, action) => {
      state.id = action.payload;
    },
    removeAllSales: (state) => {
      Object.assign(state, initialState);
    },

    addItem: (state, action) => {
      const index = state.items.findIndex(
        (el) => el._id === action.payload._id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      } else {
        state.items.push(action.payload);
      }
    },

    updateItem: (state, actions) => {
      const index = state.items.findIndex(
        (el) => el._id === actions.payload._id
      );
      if (index !== -1) {
        state.items[index] = actions.payload;
      }
    },

    setBatchHeight: (state, action) => {
      state.heights = action.payload;
    },

    removeGodownOrBatch: (state, action) => {
      const id = action.payload.id;
      const idx = action.payload.idx;

      const index = state.items.findIndex((el) => el._id === id);
      if (index !== -1) {
        const currentItem = state.items[index];
        currentItem.GodownList[idx].added = false;

        const allAddedFalse = currentItem.GodownList.every(
          (item) => item.added === false || item.added == undefined
        );

        // If allAddedFalse is true, set currentItem.added to false
        if (allAddedFalse) {
          state.items.splice(index, 1);
        }
      }
    },

  },
});

// Action creators are generated for each case reducer function
export const {
  addParty,
  removeParty,
  addItem,
  removeItem,
  changeCount,
  setPriceLevel,
  changeTotal,
  changeIgstAndDiscount,
  addAdditionalCharges,
  AddFinalAmount,
  deleteRow,
  removeAll,
  removeAdditionalCharge,
  persistScroll,
  setBrandInRedux,
  setCategoryInRedux,
  setSubCategoryInRedux,
  setParty,
  setItem,
  setSelectedPriceLevel,
  setFinalAmount,
  setAdditionalCharges,
  saveId,
  removeAllSales,
  changeGodownCount,
  addAllProducts,
  updateItem,
  setBatchHeight,
  removeGodownOrBatch,
  addAllFieldsFromEditSalesPage} = salesSecondarySlice.actions;

export default salesSecondarySlice.reducer;
