import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  barcodeList: [],
  index: null,
  _id: "",
  stickerName: "",
  printOn: "", // Print on details (e.g., material or surface)
  format1: "", // Format of the sticker 1
  format2: "", // Format of the sticker 2
  printOff: "",
};
const barcodeSlice = createSlice({
  name: "barcode",
  initialState,
  reducers: {
    addBarcodeData: (state, action) => {
      state.index = action.payload.index ? action.payload.index : state.index;
      state._id = action.payload._id ? action.payload._id : state._id;
      state.stickerName = action.payload.stickerName
        ? action.payload.stickerName
        : state.stickerName;
      state.printOn = action.payload.printOn
        ? action.payload.printOn
        : state.printOn;
      state.format1 = action.payload.format1
        ? action.payload.format1
        : state.format1;
      state.format2 = action.payload.format2
        ? action.payload.format2
        : state.format2;
      state.printOff = action.payload.printOff
        ? action.payload.printOff
        : state.printOff;
    },

    editBarcodeDataInList: (state, action) => {
      const index = action.payload.index;
      const dataToEdit = state.barcodeList[index];

      if (dataToEdit) {
        dataToEdit.stickerName = action.payload.stickerName ?? state.stickerName;
        dataToEdit.printOn = action.payload.printOn??state.printOn;
        dataToEdit.format1 = action.payload.format1 ?? state.format1;
        dataToEdit.format2 = action.payload.format2 ?? state.format2;
        dataToEdit.printOff = action.payload.printOff ?? state.printOff;
      }
    },

    addBarcodeList: (state, action) => {
      state.barcodeList = action.payload;
    },

    addStickerName: (state, action) => {
      const data = {
        stickerName: action.payload,
        printOn: "",
        format1: "",
        format2: "",
        printOff: "",
      };

      if (
        state.barcodeList.find((item) => item.stickerName === data.stickerName)
      )
        return;

      state.barcodeList.push(data);
    },

    deleteBarcodeFromList: (state, action) => {
      const index = action.payload.index;
      state.barcodeList.splice(index, 1);
    },

    removeAll: (state) => {
      Object.assign(state, initialState);
    },
    removeData: (state) => {
      state._id = "";
      state.stickerName = "";
      state.printOn = "";
      state.format1 = "";
      state.format2 = "";
      state.printOff = "";
    },
  },
});

export const {
  addBarcodeData,
  removeAll,
  addStickerName,
  addBarcodeList,
  editBarcodeDataInList,
  deleteBarcodeFromList,
  removeData,
} = barcodeSlice.actions;
export default barcodeSlice.reducer;
