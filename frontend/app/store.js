import { configureStore } from "@reduxjs/toolkit";
import tallyDataReducer from "../slices/tallyDataSlice";
import setSelectedOrganizationReducer from "../slices/PrimarySelectedOrgSlice";
import secSelectedOrgReducer from "../slices/secSelectedOrgSlice";
import settlementDataReducer from "../slices/settlementDataSlice";
import prSettlementDataReducer from "../slices/prSettlementDataSlice";
import adminDataReducer from "../slices/adminData";
import invoice from "../slices/invoice";
import invoiceSecondary from "../slices/invoiceSecondary";
import sales from '../slices/sales'
import salesSecondary from '../slices/salesSecondary'

export const store = configureStore({
  reducer: {
    tallyData: tallyDataReducer,
    setSelectedOrganization: setSelectedOrganizationReducer,
    secSelectedOrganization: secSelectedOrgReducer,
    settlementData: settlementDataReducer,
    prSettlementData: prSettlementDataReducer,
    adminData: adminDataReducer,
    invoice: invoice,
    invoiceSecondary: invoiceSecondary,
    sales:sales,
    salesSecondary:salesSecondary
  },
});
