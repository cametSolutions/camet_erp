import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  date: "",
  products: [],
  party: {},
  items: [],
  selectedPriceLevel: "",
  additionalCharges: [],
  finalAmount: 0,
  persistScrollId: "",
  despatchDetails: {
    challanNo: "",
    containerNo: "",
    despatchThrough: "",
    destination: "",
    vehicleNo: "",
    orderNo: "",
    // eWayNo: "",
    // irnNo: "",
    termsOfPay: "",
    termsOfDelivery: "",
  },
};

export const invoiceSliceSecondary = createSlice({
  name: "invoiceSecondary",
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
        state.items[indexToUpdate].actualCount = newCount;
      }

      if (newCount <= 0 && indexToUpdate !== -1) {
        state.items.splice(indexToUpdate, 1);
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

    addPriceRate: (state, action) => {
      const id = action.payload._id;
      const selectedPriceRate = action.payload?.selectedPriceRate || 0;
      // console.log(selectedPriceRate);
      const indexToUpdate = state.items.findIndex((el) => el._id == id);
      if (indexToUpdate !== -1) {
        state.items[indexToUpdate].selectedPriceRate = selectedPriceRate;
      }
    },

    changeIgstAndDiscount: (state, action) => {
      const id = action.payload._id;
      const igst = action.payload?.igst || 0;
      const discount = action.payload?.discount || 0;
      const count = action.payload?.count || 0;
      const actualCount = action.payload?.actualCount || 0;
      const isTaxInclusive = action.payload?.isTaxInclusive || false;
      const discountType = action.payload?.discountType || false;

      const discountPercentage = action.payload?.discountPercentage || 0;
      const newTotal = Number(action.payload?.total).toFixed(2) || 0;

      const indexToUpdate = state.items.findIndex((el) => el._id === id);

      if (count <= 0 && indexToUpdate !== -1) {
        state.items.splice(indexToUpdate, 1);
        return;
      }
      if (indexToUpdate !== -1) {
        state.items[indexToUpdate].total = newTotal;
        state.items[indexToUpdate].discount = discount;
        state.items[indexToUpdate].igst = igst;
        state.items[indexToUpdate].count = count;
        state.items[indexToUpdate].isTaxInclusive = isTaxInclusive;
        state.items[indexToUpdate].discountPercentage = discountPercentage;
        state.items[indexToUpdate].discountType = discountType;
        state.items[indexToUpdate].actualCount = actualCount;
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
    addNewAddress: (state, action) => {
      state.party.newBillToShipTo = action.payload;
    },
    addDespatchDetails: (state, action) => {
      return {
        ...state,
        despatchDetails: action.payload,
      };
    },
    changeDate: (state, action) => {
      state.date = action.payload;
    },

    updateItem: (state, actions) => {
      const { item } = actions.payload;

      const index = state.items.findIndex((el) => el?._id === item?._id);

      if (index !== -1) {
        state.items[index] = item;
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
  addAllProducts,
  addPriceRate,
  addNewAddress,
  addDespatchDetails,
  changeDate,
  updateItem,
} = invoiceSliceSecondary.actions;

export default invoiceSliceSecondary.reducer;
