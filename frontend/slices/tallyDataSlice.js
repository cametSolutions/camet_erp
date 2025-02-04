import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  ledgerData: [],
  groupData: [],
  payableData: [],
  receivableData: [],
  expandedGroups: {},
  expandedSubGroups: {},
  scrollPosition: 0,
  tab: "",
  ledgerTotal: 0,
  groupTotal: 0,
  payableTotal: 0,
  receivableTotal: 0,
};

export const tallyDataSlice = createSlice({
  name: "tallyData",
  initialState,
  reducers: {
    addLedgerData: (state, action) => {
      state.ledgerData = action.payload || [];
    },
    addGroupData: (state, action) => {
      state.groupData = action.payload || [];
    },

    addPayableData: (state, action) => {
      state.payableData = action.payload || [];
    },

    addReceivableData: (state, action) => {
      state.receivableData = action.payload || [];
    },
    addExpandedGroups: (state, action) => {
      state.expandedGroups = action.payload;
    },
    addExpandedSubGroups: (state, action) => {
      state.expandedSubGroups = action.payload;
    },
    addScrollPosition: (state, action) => {
      state.scrollPosition = action.payload;
    },
    addTab: (state, action) => {
      state.tab = action.payload;
    },
    addLedgerTotal: (state, action) => {
      state.ledgerTotal = action.payload;
    },
    addGroupTotal: (state, action) => {
      state.groupTotal = action.payload;
    },
    addPayableTotal: (state, action) => {
      state.payableTotal = action.payload;
    },
    addReceivableTotal: (state, action) => {
      state.receivableTotal = action.payload;
    }
  },
});

export const {
  addLedgerData,
  addGroupData,
  addExpandedGroups,
  addExpandedSubGroups,
  addScrollPosition,
  addTab,
  addLedgerTotal,
  addGroupTotal,
  addPayableData,
  addReceivableData,
  addPayableTotal,
  addReceivableTotal  
} = tallyDataSlice.actions;

export default tallyDataSlice.reducer;
