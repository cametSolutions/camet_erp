import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
};

export const tallyDataSlice = createSlice({
  name: "tallyData",
  initialState,
  reducers: {
    addData: (state, action) => {

      console.log(action.payload);
      action.payload.map((item)=>(
        
        state.data.push(item)

      ))
    },
  },
});

// Action creators are generated for each case reducer function
export const { addData} = tallyDataSlice.actions;

export default tallyDataSlice.reducer;
