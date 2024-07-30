import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  date:"",
  selectedGodown: {
    godown: "",
    godown_id: "",
  },
  products: [],
  items: [],
  brand: "",
  category: "",
  subcategory: "",
  finalAmount:0
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
      state.products = [];
    },
    removeAll: (state) => {
      Object.assign(state, initialState);
    },

    removeGodown: (state) => {
      state.selectedGodown = initialState.selectedGodown;
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
    addAllProducts: (state, action) => {
      state.products = action.payload;
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

    removeItem: (state, action) => {
      const id = action.payload._id;
      const index = state.items.findIndex((el) => el._id === id);

      state.items.splice(index, 1);
    },

    removeGodownOrBatch: (state, action) => {
      const id = action.payload.id;
      const idx = action.payload.idx;

      const index = state.items.findIndex((el) => el._id === id);
      if (index !== -1) {
        const currentItem = state.items[index];
        currentItem.GodownList[idx].added = false;

        const newCount = currentItem.GodownList.reduce((acc, curr) => {
          if (curr.added) {
            return acc + curr.count;
          } else {
            return acc;
          }
        }, 0);

        currentItem.count = newCount;

        const allAddedFalse = currentItem.GodownList.every(
          (item) => item.added === false || item.added == undefined
        );

        // If allAddedFalse is true, set currentItem.added to false
        if (allAddedFalse) {
          state.items.splice(index, 1);
        }
      }
    },

    changeDate: (state, action) => {
      state.date = action.payload;
    },
    AddFinalAmount: (state, action) => {
      state.finalAmount = action.payload;
    },
  },
});

export const {
  addSelectedGodown,
  removeAll,
  removeGodown,
  setBrandInRedux,
  setCategoryInRedux,
  setSubCategoryInRedux,
  addAllProducts,
  updateItem,
  addItem,
  removeItem,
  removeGodownOrBatch,
  changeDate,
  AddFinalAmount
} = stockTransferSlice.actions;
export default stockTransferSlice.reducer;
