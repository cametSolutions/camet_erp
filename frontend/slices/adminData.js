import { createSlice } from '@reduxjs/toolkit';

const storedAdminData = localStorage.getItem('adminData');

const initialState={
    loginData:storedAdminData?JSON.parse(storedAdminData):null
}
const adminDataSlice = createSlice({
    name: 'adminData',
    initialState,
    reducers: {
        addAdminData: (state, action) => {

        console.log(action.payload);
        state.loginData=action.payload
        const adminData=JSON.stringify(action.payload)
        localStorage.setItem('adminData',adminData)
      },

      removeAdminData:(state,action)=>{
        state.loginData=""
        localStorage.removeItem('adminData')
      }
    },
  });


  export const {addAdminData,removeAdminData}=adminDataSlice.actions
  export default adminDataSlice.reducer;