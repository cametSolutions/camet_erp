import { configureStore } from "@reduxjs/toolkit";
import tallyDataReducer from "../slices/tallyDataSlice";
import setSelectedOrganizationReducer from "../slices/PrimarySelectedOrgSlice";
import secSelectedOrgReducer from "../slices/secSelectedOrgSlice";
import settlementDataReducer from "../slices/settlementDataSlice";
import prSettlementDataReducer from "../slices/prSettlementDataSlice";
import adminDataReducer from "../slices/adminData";
// import invoice from "../slices/invoice";
// import invoiceSecondary from "../slices/invoiceSecondary";
// import sales from "../slices/sales";
// import purchase from "../slices/purchase";
// import salesSecondary from "../slices/salesSecondary";
import stockTransferSecondary from "../slices/stockTransferSecondary";
import receipt from "../slices/receipt";
import payment from "../slices/payment";
// import creditNote from "../slices/creditNote";
// import debitNote from "../slices/debitNote";
import date from "../slices/filterSlices/date";
import voucherType from "../slices/filterSlices/voucherType";
import partyFilter from "../slices/filterSlices/partyFIlter";
import userFilter from "../slices/filterSlices/userFilter";
import statusFilter from "../slices/filterSlices/statusFilter";
import companyFilter from "../slices/filterSlices/companyFilter";
import summaryFilter from "../slices/filterSlices/summaryFilter";
import serialNumber from "../slices/filterSlices/serialNumberFilter";
import partySlice from "../slices/partySlice";
import paymentSplitting from "../slices/filterSlices/paymentSplitting/paymentSplitting"
import barcode from "../slices/barcodeSlice";
import commonVoucherSlice from "../slices/voucherSlices/commonVoucherSlice";
import commonAccountingVoucherSlice from "../slices/voucherSlices/commonAccountingVoucherSlice";

export const store = configureStore({
  reducer: {
    tallyData: tallyDataReducer,
    setSelectedOrganization: setSelectedOrganizationReducer,
    secSelectedOrganization: secSelectedOrgReducer,
    settlementData: settlementDataReducer,
    prSettlementData: prSettlementDataReducer,
    adminData: adminDataReducer,
    // invoice: invoice,
    // invoiceSecondary: invoiceSecondary,
    // sales: sales,
    // salesSecondary: salesSecondary,
    // purchase: purchase,
    stockTransferSecondary: stockTransferSecondary,
    receipt: receipt,
    payment: payment,
    // creditNote: creditNote,
    // debitNote: debitNote,
    date: date,
    voucherType: voucherType,
    partyFilter: partyFilter,
    userFilter: userFilter,
    statusFilter: statusFilter,
    partySlice,
    paymentSplitting,
    barcode,
    companyFilter,
    summaryFilter,
    serialNumber,
    commonVoucherSlice,
    commonAccountingVoucherSlice
  },
});
