import { createSlice } from "@reduxjs/toolkit";

const storedSecOrg = localStorage.getItem("secOrg");
const initialState = {
  secSelectedOrg:
    storedSecOrg && storedSecOrg !== "undefined"
      ? JSON.parse(storedSecOrg)
      : null,

    refreshOrganizations:false
};

const secSelectedOrganizationSlice = createSlice({
  name: "setSecSelectedOrganization",
  initialState,
  reducers: {
    setSecSelectedOrganization: (state, action) => {
      console.log(action.payload);
      state.secSelectedOrg = action.payload;
      const org = JSON.stringify(action.payload);
      localStorage.setItem("secOrg", org);
    },
    removeSecSelectedOrg: (state) => {
      state.secSelectedOrg = "";
      localStorage.setItem("secOrg", "");
    },

    updateConfiguration: (state, action) => {
      state.secSelectedOrg = action.payload;
      localStorage.setItem("secOrg", JSON.stringify(action.payload));
    },
    refreshCompanies:(state)=>{
      state.refreshOrganizations=!state.refreshOrganizations
    }
  },
});

export const {
  setSecSelectedOrganization,
  removeSecSelectedOrg,
  updateConfiguration,
  refreshCompanies
} = secSelectedOrganizationSlice.actions;
export default secSelectedOrganizationSlice.reducer;
