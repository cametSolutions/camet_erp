import express from 'express'
const router = express.Router();
import {
    login, getSecUserData,
    confirmCollection, logout,
    cancelTransaction, fetchBanks, sendOtp,
    submitOtp, resetPassword, getTransactionDetails, invoiceList
    , getSingleOrganization, fetchHsn,
    addDataToOrg, editDataInOrg, deleteDataInOrg
    , saveOrderNumber
    , fetchFilters
    , addconfigurations
    , saveSalesNumber, fetchAdditionalDetails,
    fetchConfigurationNumber, findSecondaryUserGodowns, findPrimaryUserGodownsSelf,
    godownwiseProducts, godownwiseProductsSelf,
    findGodownsNames, getAllSubDetails,
    fetchGodowns,
    getBankAndCashSources,
    getDashboardSummary,
    getAccountGroups,
    addPartyOpening,
    getPartyOpening,
    editPartyOpening,
    fetchDashboardCounts,

} from "../controllers/secondaryUserController.js"

import { createPurchase, editPurchase, cancelPurchase, getPurchaseDetails } from '../controllers/purchaseController.js';
import { createCreditNote, cancelCreditNote, editCreditNote, getCreditNoteDetails } from '../controllers/creditNoteController.js';
import { createSale, editSale, cancelSale, getSalesDetails, } from '../controllers/saleController.js';
import { cancelDebitNote, createDebitNote, editDebitNote, getDebitNoteDetails } from '../controllers/debitNoteController.js';
import { transactions, addHsn, getSingleHsn, editHsn, deleteHsn, getOpeningBalances, sendPdfViaEmail } from '../controllers/commonController.js';
import { authSecondary } from '../middlewares/authSecUsers.js';
import { secondaryIsBlocked } from '../middlewares/isBlocked.js';
import { companyAuthentication } from '../middlewares/authCompany.js';
import { createReceipt, cancelReceipt, editReceipt, getReceiptDetails } from '../controllers/receiptController.js';
import { createPayment, cancelPayment, editPayment, getPaymentDetails } from '../controllers/paymentController.js';
import { createInvoice, editInvoice, cancelSalesOrder, PartyListWithOrderPending, getInvoiceDetails } from '../controllers/saleOrderController.js';
import { createStockTransfer, editStockTransfer, cancelStockTransfer, getStockTransferDetails } from '../controllers/stockTransferController.js';
import { addBankPaymentDetails } from '../../frontend/slices/payment.js';
import { addEmailConfiguration, getConfiguration, getBarcodeList, addBarcodeData, editBarcodeData, deleteBarcode, getSingleBarcodeData, getPrintingConfiguration, updateConfiguration, getDespatchTitles, updateDespatchTitles, getTermsAndConditions, updateTermsAndConditions, updateBankAccount, updateShipToConfiguration, updateFirstLayerConfiguration, createWarrantyCard, getWarrantyCards, updateWarrantyCard, deleteWarrantyCard, updateCommonToggleConfiguration, uploadLetterHead } from '../controllers/settingsController.js';
import { updateSecondaryUserConfiguration } from '../helpers/saleOrderHelper.js';
import { addAccountGroupIdToOutstanding, addAccountGroupIdToParties, convertPrimaryToSecondary, createAccountGroups, updateDateFieldsByCompany, updateSalesItemUnitFields, updateUnitFields } from '../controllers/testingController.js';
import { authPrimary } from '../middlewares/authPrimaryUsers.js';
import {  addSecondaryConfigurations, addSecUsers, allocateCompany, allocateSubDetails, editSecUSer, fetchConfigurationCurrentNumber, fetchGodownsAndPriceLevels, fetchSecondaryUsers, getSecUserDetails } from '../controllers/primaryUserController.js';

import { getSummary } from "../controllers/summaryController.js"
import { getSummaryReport } from "../controllers/summaryController.js";
import { fetchOutstandingDetails, fetchOutstandingTotal, getOutstandingSummary } from '../controllers/outStandingController.js';
import { addProduct, deleteProduct, productDetails, editProduct, getProducts, addProductSubDetails, getProductSubDetails, deleteProductSubDetails, editProductSubDetails, getAllProductsForExcel} from '../controllers/productController.js';
import { getstockDetails } from '../controllers/stockController.js';
import { addOrganizations, editOrg, getOrganizations } from '../controllers/organizationController.js';
import { addParty, addSubGroup, deleteParty, deleteSubGroup, editParty, editSubGroup, getSinglePartyDetails, getSubGroup, PartyList } from '../controllers/partyController.js';
import { addBankEntry, addCash, editBankEntry, editCash, findSourceBalance, findSourceDetails, findSourceTransactions, getBankEntryDetails, getCashDetails } from '../controllers/bankAndCashController.js';
import { addAditionalCharge, deleteAdditionalCharge, EditAditionalCharge, fetchAdditionalCharges, fetchSingleAdditionalCharge } from '../controllers/additionalChargeContoller.js';
import { createVoucherSeries, getSeriesByVoucher, deleteVoucherSeriesById, editVoucherSeriesById, makeTheSeriesAsCurrentlySelected } from '../controllers/voucherSeriesController.js';

//hotel controller
import {saveAdditionalPax , getAdditionalPax ,updateAdditionalPax , deleteAdditionalPax,saveVisitOfPurpose,getVisitOfPurpose,
    updateVisitOfPurpose,deleteVisitOfPurpose,saveIdProof,getIdProof,updateIdProof , deleteIdProof, saveFoodPlan , getFoodPlan
    ,updateFoodPlan,deleteFoodPlan,addRoom,getRooms,editRoom ,deleteRoom,getAllRooms,roomBooking} from '../controllers/hotelController.js'
 import {addItem,getItems} from '../controllers/restaurantController.js'
router.post('/login',login)
router.post('/sendOtp',sendOtp)
router.post('/submitOtp',submitOtp)
router.post('/resetPassword',resetPassword)

router.post('/logout', authSecondary, secondaryIsBlocked, logout)
router.get('/getSecUserData', authSecondary, secondaryIsBlocked, getSecUserData)
router.get('/fetchOutstandingTotal/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, fetchOutstandingTotal)
router.get('/fetchOutstandingDetails/:party_id/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, fetchOutstandingDetails)
router.post('/confirmCollection', authSecondary, secondaryIsBlocked, confirmCollection)
router.get('/transactions/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, transactions)
router.get('/getTransactionDetails/:id', authSecondary, secondaryIsBlocked, getTransactionDetails)
router.post('/cancelTransaction/:id', authSecondary, secondaryIsBlocked, cancelTransaction)
router.get('/fetchBanks/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, fetchBanks)
router.get('/PartyList/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, PartyList)
router.post('/addParty', authSecondary, secondaryIsBlocked, addParty)
router.get('/getProducts/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, getProducts)
router.get('/getAllProductsForExcel/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, getAllProductsForExcel)
router.get('/stockregisterSummary/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,getstockDetails)
router.post('/createSaleOrder', authSecondary, secondaryIsBlocked, createInvoice)
router.get('/invoiceList/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, invoiceList)
router.get('/getSinglePartyDetails/:id', authSecondary, secondaryIsBlocked, getSinglePartyDetails)
router.post('/editParty/:id', authSecondary, secondaryIsBlocked, editParty)
router.delete('/deleteParty/:id', authSecondary, secondaryIsBlocked, deleteParty)
router.get('/getSingleOrganization/:id', authSecondary, secondaryIsBlocked, getSingleOrganization);
router.get('/fetchHsn/:cmp_id', companyAuthentication, fetchHsn)
router.post('/addDataToOrg/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, addDataToOrg)
router.post('/editDataInOrg/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, editDataInOrg)
router.post('/deleteDataInOrg/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, deleteDataInOrg)
router.post('/addProduct', authSecondary, secondaryIsBlocked, addProduct)
router.get('/productDetails/:id', authSecondary, secondaryIsBlocked, productDetails)
router.post('/editProduct/:id', authSecondary, secondaryIsBlocked, editProduct)
router.delete('/deleteProduct/:id', authSecondary, secondaryIsBlocked, deleteProduct)
router.post('/saveOrderNumber/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, saveOrderNumber)
router.get('/getSaleOrderDetails/:id', authSecondary, secondaryIsBlocked, getInvoiceDetails)
router.post('/editSaleOrder/:id', authSecondary, secondaryIsBlocked, editInvoice)
router.get('/fetchFilters/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, fetchFilters)
router.post('/addAditionalCharge/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, addAditionalCharge)

router.delete('/deleteAdditionalCharge/:id/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, deleteAdditionalCharge)
router.put('/EditAditionalCharge/:id/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, EditAditionalCharge)
router.post('/addconfigurations/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, addconfigurations)
router.post('/createSales', authSecondary, secondaryIsBlocked, createSale)
router.post('/createVanSale', authSecondary, secondaryIsBlocked, createSale)
router.get('/getSalesDetails/:id', authSecondary, secondaryIsBlocked, getSalesDetails)
router.post('/saveSalesNumber/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, saveSalesNumber)
router.get('/fetchAdditionalDetails/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, fetchAdditionalDetails)
router.get('/fetchConfigurationNumber/:cmp_id/:title', authSecondary, secondaryIsBlocked, companyAuthentication, fetchConfigurationNumber)
router.get("/getGodowns/:cmp_id", authSecondary, secondaryIsBlocked, companyAuthentication, findSecondaryUserGodowns)
router.get("/getGodownsSelf/:cmp_id", authSecondary, secondaryIsBlocked, companyAuthentication, findPrimaryUserGodownsSelf)
router.get("/godownProductFilter/:cmp_id/:godown_id", authSecondary, companyAuthentication, secondaryIsBlocked, godownwiseProducts)
router.get("/godownProductFilterSelf/:cmp_id/:godown_name", authSecondary, secondaryIsBlocked, companyAuthentication, godownwiseProductsSelf)
router.get("/additionalcharges/:cmp_id", authSecondary, secondaryIsBlocked, companyAuthentication, fetchAdditionalCharges)
router.get("/fetchSingleAdditionalCharge/:id/:cmp_id", authSecondary, secondaryIsBlocked, companyAuthentication, fetchSingleAdditionalCharge)
router.get("/godownsName/:cmp_id", authSecondary, secondaryIsBlocked, companyAuthentication, findGodownsNames)
router.get('/getPurchaseDetails/:id', authSecondary, secondaryIsBlocked, getPurchaseDetails)
router.post('/editsales/:id', authSecondary, secondaryIsBlocked, editSale)
router.post('/editvanSale/:id', authSecondary, secondaryIsBlocked, editSale)
router.get("/getAllSubDetails/:orgId", authSecondary, secondaryIsBlocked, getAllSubDetails)
router.get("/fetchGodowns/:cmp_id", authSecondary, secondaryIsBlocked, fetchGodowns)
router.post("/createStockTransfer", authSecondary, secondaryIsBlocked, createStockTransfer)
router.get("/getStockTransferDetails/:id", authSecondary, secondaryIsBlocked, getStockTransferDetails)
router.post("/editStockTransfer/:id", authSecondary, secondaryIsBlocked, editStockTransfer)
router.put("/cancelSalesOrder/:id", authSecondary, secondaryIsBlocked, cancelSalesOrder)
router.put("/cancelSales/:id", authSecondary, secondaryIsBlocked, cancelSale)
router.put("/cancelstockTransfer/:id", authSecondary, secondaryIsBlocked, cancelStockTransfer)


///purchase routes
router.post('/createPurchase', authSecondary, secondaryIsBlocked, createPurchase)
router.post('/editPurchase/:id', authSecondary, secondaryIsBlocked, editPurchase)
router.put("/cancelpurchase/:id", authSecondary, secondaryIsBlocked, cancelPurchase)
///credit not routes
router.post('/createCreditNote', authSecondary, secondaryIsBlocked, createCreditNote)
router.get('/getCreditNoteDetails/:id', authSecondary, secondaryIsBlocked, getCreditNoteDetails)
router.put('/cancelCreditNote/:id', authSecondary, secondaryIsBlocked, cancelCreditNote)
router.post('/editCreditNote/:id', authSecondary, secondaryIsBlocked, editCreditNote)
///debit not routes
router.post('/createDebitNote', authSecondary, secondaryIsBlocked, createDebitNote)
router.get('/getDebitNoteDetails/:id', authSecondary, secondaryIsBlocked, getDebitNoteDetails)
router.put('/cancelDebitNote/:id', authSecondary, secondaryIsBlocked, cancelDebitNote)
router.post('/editDebitNote/:id', authSecondary, secondaryIsBlocked, editDebitNote)
///receipt routes
router.post('/createReceipt', authSecondary, secondaryIsBlocked, createReceipt)
router.get('/getReceiptDetails/:id', authSecondary, secondaryIsBlocked, getReceiptDetails)
router.put('/cancelReceipt/:receiptId', authSecondary, secondaryIsBlocked, cancelReceipt)
router.put('/editReceipt/:receiptId', authSecondary, secondaryIsBlocked, editReceipt)

///payment routes
router.post('/createPayment', authSecondary, secondaryIsBlocked, createPayment)
router.get('/getPaymentDetails/:id', authSecondary, secondaryIsBlocked, getPaymentDetails)
router.put('/cancelPayment/:paymentId', authSecondary, secondaryIsBlocked, cancelPayment)
router.put('/editPayment/:paymentId', authSecondary, secondaryIsBlocked, editPayment)



/// sub details (brand, category, subcategory, godown, pricelevel)
router.post("/addProductSubDetails/:orgId", authSecondary, secondaryIsBlocked, addProductSubDetails)
router.get("/getProductSubDetails/:orgId", authSecondary, secondaryIsBlocked, getProductSubDetails)
router.delete("/deleteProductSubDetails/:orgId/:id", authSecondary, secondaryIsBlocked, deleteProductSubDetails)
router.put("/editProductSubDetails/:orgId/:id", authSecondary, secondaryIsBlocked, editProductSubDetails)

///hsn routes
router.post('/addHsn', authSecondary, secondaryIsBlocked, addHsn)
router.get('/getSingleHsn/:hsnId', authSecondary, secondaryIsBlocked, getSingleHsn)
router.post('/editHsn/:hsnId', authSecondary, secondaryIsBlocked, editHsn)
router.delete('/deleteHsn/:id', authSecondary, secondaryIsBlocked, deleteHsn)


// reports
router.get('/getOpeningBalances/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, getOpeningBalances)
router.get('/findSourceBalance/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, findSourceBalance)
router.get('/findSourceDetails/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, findSourceDetails)
router.get('/findSourceTransactions/:cmp_id/:id', authSecondary, secondaryIsBlocked, companyAuthentication, findSourceTransactions)
router.post('/addBank/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, addBankEntry)
router.post('/addBankOD/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, addBankEntry)
router.put('/editBank/:cmp_id/:bank_id', authSecondary, secondaryIsBlocked, companyAuthentication, editBankEntry)
router.put('/editBankOD/:cmp_id/:bank_id', authSecondary, secondaryIsBlocked, companyAuthentication, editBankEntry)
router.get('/getBankDetails/:cmp_id/:bank_id', authSecondary, secondaryIsBlocked, companyAuthentication, getBankEntryDetails)
router.get('/getBankODDetails/:cmp_id/:bank_id', authSecondary, secondaryIsBlocked, companyAuthentication, getBankEntryDetails)
router.post('/addCash/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, addCash)
router.get('/getCashDetails/:cmp_id/:cash_id', authSecondary, secondaryIsBlocked, companyAuthentication, getCashDetails)
router.put('/editCash/:cmp_id/:cash_id', authSecondary, secondaryIsBlocked, companyAuthentication, editCash)

///payment splitting
router.get('/getBankAndCashSources/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, getBankAndCashSources)

/// settings
//email configuration
router.post('/addEmailConfiguration/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, addEmailConfiguration)
router.get('/getConfiguration/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, getConfiguration)
//// send pdf via mail
router.post('/sendPdfViaMail/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, sendPdfViaEmail)

/// barcode routes
router.get('/getBarcodeList/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, getBarcodeList)
router.post('/addBarcodeData/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, addBarcodeData)
router.put('/editBarcodeData/:id/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, editBarcodeData)
router.delete('/deleteBarcode/:id/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, deleteBarcode)
router.delete('/getSingleBarcodeData/:id/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, getSingleBarcodeData)

///// printing configuration 
router.get('/getPrintingConfiguration/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, getPrintingConfiguration)
router.put('/updateConfiguration/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, updateConfiguration)
router.put('/uploadLetterHead/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, uploadLetterHead)

//// despatch details title configuration
router.get('/getDespatchTitles/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, getDespatchTitles)
router.put('/updateDespatchTitles/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, updateDespatchTitles)


/// terms and conditions configurations
router.get('/getTermsAndConditions/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, getTermsAndConditions)
router.put('/updateTermsAndConditions/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, updateTermsAndConditions)

/// update bank account
router.put('/updateBankAccount/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, updateBankAccount)


//// update common toggle configuration
router.put('/updateCommonToggleConfiguration/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,updateCommonToggleConfiguration)
/// ship to settings
router.put('/updateShipToConfiguration/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, updateShipToConfiguration)

/// Update a field in the first layer of a company's configuration
router.put('/updateFirstLayerConfiguration/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, updateFirstLayerConfiguration)




/// order pending
router.get('/PartyListWithOrderPending/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, PartyListWithOrderPending)


//// company creation
router.post('/addOrganizations', authPrimary, secondaryIsBlocked, addOrganizations);
router.get('/getOrganizations', authPrimary, secondaryIsBlocked, getOrganizations);
router.post('/editOrg/:id', authPrimary, secondaryIsBlocked, editOrg);


////// sales summary
router.get("/salesSummary/:cmp_id", authSecondary, secondaryIsBlocked, companyAuthentication, getSummary)
router.get("/summaryReport/:cmp_id",authSecondary, secondaryIsBlocked, companyAuthentication,getSummaryReport)

//// managing secondary users
router.get('/fetchSecondaryUsers', authPrimary,secondaryIsBlocked,fetchSecondaryUsers);
router.post('/addSecUsers', authPrimary,secondaryIsBlocked,addSecUsers);
router.get('/getSecUserDetails/:id', authPrimary,secondaryIsBlocked,getSecUserDetails)
router.put('/editSecUSer/:id', authPrimary,secondaryIsBlocked,editSecUSer)
router.get("/fetchConfigurationCurrentNumber/:orgId/:_id",authPrimary,secondaryIsBlocked,fetchConfigurationCurrentNumber)
router.get('/fetchGodownsAndPriceLevels/:cmp_id',authPrimary,secondaryIsBlocked,companyAuthentication,fetchGodownsAndPriceLevels)
router.post('/addSecondaryConfigurations/:cmp_id/:userId',authPrimary,secondaryIsBlocked,companyAuthentication,addSecondaryConfigurations)
router.put('/allocateCompany/:cmp_id',authPrimary,secondaryIsBlocked,companyAuthentication,allocateCompany)
router.put('/allocateSubDetails/:cmp_id',authPrimary,secondaryIsBlocked,companyAuthentication,allocateSubDetails)

//// outstanding routes
router.get('/getOutstandingSummary/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, getOutstandingSummary)


/// dashboard summary
router.get('/getDashboardSummary/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, getDashboardSummary)
router.get('/fetchDashboardCounts/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, fetchDashboardCounts)
/// get account groups
router.get('/getAccountGroups/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, getAccountGroups)
/// sub groups
router.post('/addSubGroup/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, addSubGroup)
router.get('/getSubGroup/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, getSubGroup)
router.delete('/deleteSubGroup/:subGroupId/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, deleteSubGroup)
router.patch('/editSubGroup/:subGroupId/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, editSubGroup)

//// add party opening
router.post('/addPartyOpening/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, addPartyOpening)
router.put('/editPartyOpening/:cmp_id/:partyId', authSecondary, secondaryIsBlocked, companyAuthentication, editPartyOpening)
router.get('/getPartyOpening/:cmp_id/:partyId', authSecondary, secondaryIsBlocked, companyAuthentication, getPartyOpening)


/// voucher series rotes
router.get('/getSeriesByVoucher/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, getSeriesByVoucher)
router.post('/createVoucherSeries/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, createVoucherSeries)
router.delete('/deleteVoucherSeriesById/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, deleteVoucherSeriesById)
router.put('/editVoucherSeriesById/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, editVoucherSeriesById)
router.put('/makeTheSeriesAsCurrentlySelected/:cmp_id', authSecondary, secondaryIsBlocked, companyAuthentication, makeTheSeriesAsCurrentlySelected)


///// warranty a cards
router.post('/createWarrantyCard/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,createWarrantyCard)
router.get('/getWarrantyCards/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,getWarrantyCards)
router.put('/updateWarrantyCard/:id/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,updateWarrantyCard)
router.delete('/deleteWarrantyCard/:id/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,deleteWarrantyCard)


//// testing routes

router.put('/updateDateFieldsByCompany/:cmp_id', updateDateFieldsByCompany)
router.put('/updateUnitFields/:cmp_id', updateUnitFields)
router.put('/updateSalesItemUnitFields/:cmp_id', updateSalesItemUnitFields)
router.post('/convertPrimaryToSecondary', convertPrimaryToSecondary)
router.post('/createAccountGroups', createAccountGroups)
router.post('/addAccountGroupIdToParties', addAccountGroupIdToParties)
router.post('/addAccountGroupIdToOutstanding', addAccountGroupIdToOutstanding)

//// Hostel routes
router.post('/saveAdditionalPax/:cmp_id',authSecondary,saveAdditionalPax)
router.get('/getAdditionalPax/:cmp_id',authSecondary,getAdditionalPax)
router.put('/updateAdditionalPax/:cmp_id',authSecondary,updateAdditionalPax)
router.delete('/deleteAdditionalPax/:cmp_id/:id',authSecondary,deleteAdditionalPax)
router.post('/saveVisitOfPurpose/:cmp_id',authSecondary,saveVisitOfPurpose)
router.get('/getVisitOfPurpose/:cmp_id',authSecondary,getVisitOfPurpose)
router.put('/updateVisitOfPurpose/:cmp_id',authSecondary,updateVisitOfPurpose)
router.delete('/deleteVisitOfPurpose/:cmp_id/:id',authSecondary,deleteVisitOfPurpose)
router.post('/saveIdProof/:cmp_id',authSecondary,saveIdProof)
router.get('/getIdProof/:cmp_id',authSecondary,getIdProof)
router.put('/updateIdProof/:cmp_id',authSecondary,updateIdProof)
router.delete('/deleteIDProof/:cmp_id/:id',authSecondary,deleteIdProof)
router.post('/saveFoodPlan/:cmp_id',authSecondary,saveFoodPlan)
router.get('/getFoodPlan/:cmp_id',authSecondary,getFoodPlan)
router.put('/updateFoodPlan/:cmp_id',authSecondary,updateFoodPlan)
router.delete('/deleteFoodPlan/:cmp_id/:id',authSecondary,deleteFoodPlan)
router.post("/addRoom/:cmp_id",authSecondary,addRoom)
router.get("/getRooms/:cmp_id",authSecondary,getRooms)
router.post("/editRoom/:cmp_id/:id",authSecondary,editRoom)
router.delete('/deleteRoom/:id',authSecondary,secondaryIsBlocked,deleteRoom)
router.get('/getAllRooms/:cmp_id',authSecondary,secondaryIsBlocked,getAllRooms)
router.post('/roomBooking/:cmp_id',authSecondary,secondaryIsBlocked,roomBooking)
router.post('/addItem/:cmp_id', authSecondary,addItem)
router.get('/getItems/:cmp_id', authSecondary,getItems)


export default router