import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // selectedGodownName:"",
  // selectedGodownId:"",
  date: "",
  convertedFrom: [],
  products: [],
  priceLevels:[],
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

export const salesSecondarySlice = createSlice({
  name: "salesSecondary",
  initialState,
  reducers: {
    addParty: (state, action) => {
      state.party = action.payload;
      state.newBillToShipTo = {};
    },
    removeParty: (state) => {
      state.party = {};
    },

    addAllProducts: (state, action) => {
      state.products = action.payload;
    },
    addAllPriceLevels: (state, action) => {
      state.priceLevels = action.payload;
    },

    removeItem: (state, action) => {
      const id = action.payload;
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

    addPriceRate: (state, action) => {
      const id = action.payload._id;
      const selectedPriceRate = action.payload?.selectedPriceRate || 0;
      console.log(selectedPriceRate);
      const indexToUpdate = state.items.findIndex((el) => el._id == id);
      if (indexToUpdate !== -1) {
        state.items[indexToUpdate].selectedPriceRate = selectedPriceRate;
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
      const isTaxInclusive = action.payload?.isTaxInclusive || false;

      const indexToUpdate = state.items.findIndex((el) => el._id === id);
      if (indexToUpdate !== -1) {
        state.items[indexToUpdate].total = newTotal;
        state.items[indexToUpdate].discount = discount;
        state.items[indexToUpdate].igst = igst;
        state.items[indexToUpdate].discountPercentage = discountPercentage;
        state.items[indexToUpdate].count = count;
        state.items[indexToUpdate].GodownList = godownList;
        state.items[indexToUpdate].isTaxInclusive = isTaxInclusive;
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
      const { payload, moveToTop } = action.payload;

      const index = state.items.findIndex((el) => el?._id === payload?._id);

      if (index !== -1) {
        // If the item already exists, update it
        state.items[index] = payload;

        if (moveToTop) {
          // Remove the item from its current position and move it to the top
          const [updatedItem] = state.items.splice(index, 1);
          state.items.unshift(updatedItem);
        }
      } else {
        // If the item doesn't exist, add it
        if (moveToTop) {
          state.items.unshift(payload);
        } else {
          state.items.push(payload);
        }
      }
    },

    // updateItem: (state, actions) => {
    //   const index = state.items.findIndex(
    //     (el) => el._id === actions.payload._id
    //   );
    //   if (index !== -1) {
    //     state.items[index] = actions.payload;
    //   }
    // },
    updateItem: (state, actions) => {
      const { item, moveToTop = false } = actions.payload;

      const index = state.items.findIndex((el) => el?._id === item?._id);

      if (index !== -1) {
        state.items[index] = item;

        if (moveToTop) {
          // Remove the item from its current position and move it to the top
          const [updatedItem] = state.items.splice(index, 1);

          state.items.unshift(updatedItem);
        }
      }
    },

    removeGodownOrBatch: (state, action) => {
      const id = action.payload.id;
      const idx = action.payload.idx;

      const index = state.items.findIndex((el) => el._id === id);
      if (index !== -1) {
        const currentItem = state.items[index];
        currentItem.GodownList[idx].added = false;
        currentItem.GodownList[idx].count = 0;
        currentItem.GodownList[idx].count = 0;
        currentItem.GodownList[idx].individualTotal = 0;

        const newCount = currentItem.GodownList.reduce((acc, curr) => {
          if (curr.added) {
            return acc + curr.count;
          } else {
            return acc;
          }
        }, 0);

        const newTotal = currentItem.GodownList.reduce((acc, curr) => {
          if (curr.added) {
            return acc + curr.individualTotal;
          } else {
            return acc;
          }
        }, 0);

        currentItem.count = newCount;
        currentItem.total = newTotal;

        const allAddedFalse = currentItem.GodownList.every(
          (item) => item.added === false || item.added == undefined
        );

        // If allAddedFalse is true, set currentItem.added to false
        if (allAddedFalse) {
          state.items.splice(index, 1);
        }
      }
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

    changeTaxInclusive: (state, action) => {
      const id = action.payload;

      // const isTaxInclusive = action.payload?.isTaxInclusive || false;
      const indexToUpdate = state.items.findIndex((el) => el._id === id);

      if (indexToUpdate !== -1) {
        const item = state.items[indexToUpdate];
        console.log("Item:", JSON.parse(JSON.stringify(item)));

        // item.isTaxInclusive = isTaxInclusive;

        item.GodownList.forEach((godown) => {
          if (godown.added) {
            if (item.isTaxInclusive) {
              godown.individualTotal = godown.selectedPriceRate * godown.count;
            } else {
              const taxAmount =
                (parseFloat(item?.igst) / 100) *
                (godown.selectedPriceRate * godown.count);
              godown.individualTotal =
                godown.selectedPriceRate * godown.count + taxAmount;
            }
          }
        });

        item.total = item.GodownList.reduce((acc, curr) => {
          const individualTotal = parseFloat(curr?.individualTotal) || 0;
          return acc + individualTotal;
        }, 0);
      }
    },

    addOrderConversionDetails: (state, action) => {
      const {
        party,
        items,
        additionalCharges,
        convertedFrom,
        despatchDetails,
      } = action.payload;

      state.items = items;
      state.party = party;
      state.additionalCharges = additionalCharges;
      state.convertedFrom = convertedFrom;
      state.despatchDetails = despatchDetails;
    },

    addConvertedFrom: (state, action) => {
      state.convertedFrom = action.payload;
    },

    // updateAllGodowns: (state, action) => {
    
    //   const {
    //     _id,
    //     index:currentInedex,
    //     newPrice: selectedPriceRate,
    //     discountAmount: discount,
    //     discountPercentage,
    //     type: discountType,
    //     isTaxInclusive,
    //     igst: igstValue,
    //   } = action.payload;
    
    //   // Find the item by _id
    //   const item = state.items.find((el) => el._id == _id);
    //   if (!item) return;
    
    //   // Make sure it is godown only (every godown must have godown_id and no batch)
    //   if (item.GodownList?.every((g) => g?.godown_id && !g?.batch)) {
    //     // Update all godowns
    //     item?.GodownList?.forEach((godown,index) => {
    //       if (godown && index!== currentInedex) {
    //         godown.selectedPriceRate = Number(selectedPriceRate);
    //         godown.discountType = discountType;
    //         godown.isTaxInclusive = isTaxInclusive;
    
    //         let calculatedDiscountAmount = 0;
    //         let calculatedDiscountPercentage = 0;
    
    //         if (isTaxInclusive) {
    //           const taxInclusivePrice = selectedPriceRate * (godown.count || 1);
    //           const taxBasePrice = Number(
    //             (taxInclusivePrice / (1 + igstValue / 100)).toFixed(2)
    //           );
    
    //           if (discountType === 'amount') {
    //             calculatedDiscountAmount = discount; // Treat as amount
    //             calculatedDiscountPercentage =
    //               Number(((discount / taxBasePrice) * 100).toFixed(2)) || 0;
    //           } else if (discountType === 'percentage') {
    //             calculatedDiscountPercentage = discountPercentage; // Treat as percentage
    //             calculatedDiscountAmount = Number(
    //               ((discountPercentage / 100) * taxBasePrice).toFixed(2)
    //             );
    //           }
    //         } else {
    //           const taxExclusivePrice = selectedPriceRate * (godown?.count || 1);
    
    //           if (discountType === 'amount') {
    //             calculatedDiscountAmount = discount;
    //             calculatedDiscountPercentage =
    //               Number(((discount / taxExclusivePrice) * 100).toFixed(2)) || 0;
    //           } else if (discountType === 'percentage') {
    //             calculatedDiscountPercentage = discountPercentage;
    //             calculatedDiscountAmount = Number(
    //               ((discountPercentage / 100) * taxExclusivePrice).toFixed(2)
    //             );
    //           }
    //         }
    
    //         godown.discount = calculatedDiscountAmount;
    //         godown.discountPercentage = calculatedDiscountPercentage;
    
    //         console.log(godown);
       
    //       }
    //     });
    //   } else {
    //     return;
    //   }
    // }
    
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
  addAllFieldsFromEditSalesPage,
  addPriceRate,
  addNewAddress,
  addDespatchDetails,
  changeDate,
  changeTaxInclusive,
  addOrderConversionDetails,
  addConvertedFrom,
  addAllPriceLevels
  // updateAllGodowns
} = salesSecondarySlice.actions;

export default salesSecondarySlice.reducer;
