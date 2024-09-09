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
import purchase from '../slices/purchase'
import salesSecondary from '../slices/salesSecondary'
import stockTransferSecondary from "../slices/stockTransferSecondary";
import receipt from "../slices/receipt";
import payment from "../slices/payment";

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
    salesSecondary:salesSecondary,
    purchase:purchase,
    stockTransferSecondary:stockTransferSecondary,
    receipt:receipt,
    payment:payment
    
  },
});
