import { createSlice } from '@reduxjs/toolkit';

const initialState={
    settlementData:JSON.parse(localStorage.getItem('settlementData'))===null ?"":JSON.parse(localStorage.getItem('settlementData'))
}

const settlementDataSlice = createSlice({
    name: 'settlementData',
    initialState,
    reducers: {
        addSettlementData: (state, action) => {

        console.log(action.payload);
        state.settlementData=action.payload
        const settlementData=JSON.stringify(action.payload)
        localStorage.setItem('settlementData',settlementData)
      },

      removeSettlementData:(state,action)=>{
        state.settlementData=""
        localStorage.removeItem('settlementData')
      }
    },
  });


  export const {addSettlementData,removeSettlementData}=settlementDataSlice.actions
  export default settlementDataSlice.reducer;