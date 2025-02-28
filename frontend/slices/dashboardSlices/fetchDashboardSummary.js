import api from "@/api/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch dashboard summary
export const fetchDashboardSummary = createAsyncThunk(
  "dashboard/fetchSummary",
  async (cmp_id, { getState, rejectWithValue }) => {
    const { lastFetched } = getState().dashboardSummary; // Get last fetch timestamp

    if (lastFetched && Date.now() - lastFetched < 5*60*1000) {
      return rejectWithValue("Data was fetched recently. Skipping request.");
    }

    try {
      const response = await api.get(
        `/api/sUsers/getDashboardSummary/${cmp_id}`,
        {
          params: { lastFetched }, // Send last fetch time to fetch only new data
          withCredentials: true,
        }
      );

      return { data: response.data.data, fetchedAt: Date.now() };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  loading: false,
  data: {
    sales: 0,
    purchases: 0,
    saleOrders: 0,
    receipts: 0,
    payments: 0,
    cashOrBank: 0,
    outstandingPayables: 0,
    outstandingReceivables: 0,
  },
  lastFetched: null,
  error: null,
  pendingUpdates: {
    sales: 0,
    purchases: 0,
    saleOrders: 0,
    receipts: 0,
    payments: 0,
    cashOrBank: 0,
    outstandingPayables: 0,
    outstandingReceivables: 0,
  },
};

const dashboardSlice = createSlice({
  name: "dashboardSummary",
  initialState,
  reducers: {
    resetDashboard: (state) => {
      state.data = initialState.data;
      state.lastFetched = null;
      state.error = null;
      state.pendingUpdates = {
        sales: 0,
        purchases: 0,
        saleOrders: 0,
        receipts: 0,
        payments: 0,
        cashOrBank: 0,
        outstandingPayables: 0,
        outstandingReceivables: 0,
      };
    },

    updateDashboardSummaryManually: (state, action) => {
      const { voucher, amount } = action.payload;
      const parsedAmount = parseFloat(amount) || 0;
    
      const validVouchers = [
        "sales",
        "purchases",
        "saleOrders",
        "receipts",
        "payments",
        "cashOrBank",
        "outstandingPayables",
        "outstandingReceivables",
      ];
    
      if (validVouchers.includes(voucher)) {
        // Update main data
        state.data[voucher] += parsedAmount;
        
        // Track in pending updates
        state.pendingUpdates[voucher] += parsedAmount;
      }
    },
    
    // Clear all pending updates after sync
    clearAllPendingUpdates: (state) => {
      Object.keys(state.pendingUpdates).forEach(key => {
        state.pendingUpdates[key] = 0;
      });
    },
    
    // Clear specific pending update
    clearPendingUpdate: (state, action) => {
      const { voucher } = action.payload;
      if (state.pendingUpdates[voucher] !== undefined) {
        state.pendingUpdates[voucher] = 0;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          const newData = action.payload.data;
          
          // For each field in newData, subtract pending updates and add API values
          Object.keys(newData).forEach(key => {
            if (state.data[key] !== undefined) {
              // Remove pending amounts (to avoid double-counting)
              state.data[key] -= state.pendingUpdates[key];
              
              // Add new amounts from API
              state.data[key] += newData[key] || 0;
              
              // Clear the corresponding pending update
              state.pendingUpdates[key] = 0;
            }
          });
          
          state.lastFetched = action.payload.fetchedAt;
        }
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { 
  resetDashboard, 
  updateDashboardSummaryManually, 
  clearAllPendingUpdates,
  clearPendingUpdate
} = dashboardSlice.actions;
export default dashboardSlice.reducer;