import { createSlice } from "@reduxjs/toolkit";
const now=new Date()
const utcMidnight = new Date(
  Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
);
// → a Date object at 00:00 UTC of today

const isoUtcMidnight = utcMidnight.toISOString();
console.log(isoUtcMidnight)

const initialState = {
  start:isoUtcMidnight,
  end: isoUtcMidnight,
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
export const { addDate, removeAll } = dateSlice.actions;

export default dateSlice.reducer;
