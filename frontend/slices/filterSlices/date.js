import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  start: new Date().toISOString(),
  end: new Date().toISOString(),
  title: "Today",
};

export const dateSlice = createSlice({
  name: "date",
  initialState,
  reducers: {
    addDate: (state, action) => {
      
      (state.title = action.payload.rangeName),
        (state.start = action.payload.start),
        (state.end = action.payload.end);
    },
    removeAll: (state) => {
      Object.assign(state, initialState);
    },
  },
});

// Action creators are generated for each case reducer function
export const { addDate ,removeAll} = dateSlice.actions;

export default dateSlice.reducer;
