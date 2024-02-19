import { createSlice } from '@reduxjs/toolkit';

const storedSecOrg = localStorage.getItem('secOrg');
const initialState = {
  secSelectedOrg: storedSecOrg ? JSON.parse(storedSecOrg) : null,
};

const secSelectedOrganizationSlice = createSlice({
    name: 'setSecSelectedOrganization',
    initialState,
    reducers: {
      setSecSelectedOrganization: (state, action) => {

        console.log(action.payload);
        state.secSelectedOrg=action.payload
        const org=JSON.stringify(action.payload)
        localStorage.setItem('secOrg',org)
      },
      removeSecSelectedOrg:(state,action)=>{

        state.secSelectedOrg=''
        localStorage.setItem('secOrg',"")

      }
    },
  });


  export const {setSecSelectedOrganization,removeSecSelectedOrg}=secSelectedOrganizationSlice.actions
  export default secSelectedOrganizationSlice.reducer;