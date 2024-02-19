import { createSlice } from '@reduxjs/toolkit';

const initialState={
    prSettlementData:JSON.parse(localStorage.getItem('primarySettlementData'))?JSON.parse(localStorage.getItem('primarySettlementData')):""
}

const PrSettlementDataSlice = createSlice({
    name: 'PrSettlementData',
    initialState,
    reducers: {
        PrAddSettlementData: (state, action) => {

        console.log(action.payload);
        state.prSettlementData=action.payload
        const settlementData=JSON.stringify(action.payload)
        localStorage.setItem('primarySettlementData',settlementData)
      },

      prRemoveSettlementData:(state,action)=>{
        state.prSettlementData=""
        localStorage.removeItem('primarySettlementData')
      }
    },
  });


  export const {PrAddSettlementData,prRemoveSettlementData}=PrSettlementDataSlice.actions
  export default PrSettlementDataSlice.reducer;