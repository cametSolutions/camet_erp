import FoodPlanReportPage from "@/pages/Hotel/Pages/FoodPlanReportPage ";
import { createSlice } from "@reduxjs/toolkit";
const get29DaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return date.toISOString().slice(0, 10);
};
const getToday = () => new Date().toISOString().slice(0, 10);
const initialState = {
  bookingDate: {
    start: get29DaysAgo(),
    end: new Date().toISOString().split("T")[0],
  },
  billSummaryDate: {
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
    autoFetch: false,
  },
  foDailyBillDate: {
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
    autoFetch: false,
  },
  flashReportDate: {
    date: new Date().toISOString().split("T")[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    autoFetch: false,
  },

  paxReportDate: {
    start: get29DaysAgo(),
    end: getToday(),
    autoFetch: false,
  },

  foodPlanReportDate: {
    start: get29DaysAgo(),
    end: getToday(),
    autoFetch: false,
  },
  occupancyReportDate: {
    date: new Date().toISOString().split("T")[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    autoFetch: false,
  },
  roomSummaryReportDate: {
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
    autoFetch: false,
  },
  receiptReportDate: {
    start: get29DaysAgo(),
    end: getToday(),
    autoFetch: false,
  },
  travelAgentReportDate: {
    start: get29DaysAgo(),
    end: getToday(),
    autoFetch: false,
  },
  foSalesSummaryDate: {
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
    autoFetch: false,
  },
  cancellationDate: {
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
    under: "all",
    searchFilter: "",
    autoFetch: false,
  },
  kotPageDate: {
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
    autoFetch: false,
  },
};

export const dateSlice = createSlice({
  name: "dateSlice",
  initialState,
  reducers: {
    addBookingDate: (state, action) => {
      state.bookingDate = action.payload;
    },
    setBillSummaryDate: (state, action) => {
      state.billSummaryDate = action.payload;
    },
    setFoDailyBillDate: (state, action) => {
      state.foDailyBillDate = action.payload;
    },

    setFlashReportDate: (state, action) => {
      state.flashReportDate = action.payload;
    },
    setPaxReportDate: (state, action) => {
      state.paxReportDate = action.payload;
    },
    setFoodPlanReportDate: (state, action) => {
      state.foodPlanReportDate = action.payload;
    },
    setOccupancyReportDate: (state, action) => {
      state.occupancyReportDate = action.payload;
    },
    setRoomSummaryReportDate: (state, action) => {
      state.roomSummaryReportDate = action.payload;
    },
    setReceiptReportDate: (state, action) => {
      state.receiptReportDate = action.payload;
    },
    setTravelAgentReportDate: (state, action) => {
      state.travelAgentReportDate = action.payload;
    },
    setFoSalesReportDate: (state, action) => {
      state.foSalesSummaryDate = action.payload;
    },
    setCancellationReportDate: (state, action) => {
      state.cancellationDate = action.payload;
    },
    setKotDate: (state, action) => {
      state.kotPageDate = action.payload;
    },
    removeAll: (state) => {
      Object.assign(state, initialState);
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  addBookingDate,
  setBillSummaryDate,
  setFoDailyBillDate,
  setFlashReportDate,
  setPaxReportDate,
  setFoodPlanReportDate,
  setOccupancyReportDate,
  setRoomSummaryReportDate,
  setReceiptReportDate,
  setTravelAgentReportDate,
  setFoSalesReportDate,
  setCancellationReportDate,
  setKotDate,
} = dateSlice.actions;

export default dateSlice.reducer;
