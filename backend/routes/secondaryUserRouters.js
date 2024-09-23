import express from 'express'
const router = express.Router();
import {login,getSecUserData,fetchOutstandingTotal,
    fetchOutstandingDetails,confirmCollection,logout,
    cancelTransaction,fetchBanks,sendOtp,
    submitOtp,resetPassword,getTransactionDetails,PartyList,addParty,getProducts,
    createInvoice,invoiceList,getSinglePartyDetails,editParty,
    deleteParty,getSingleOrganization,fetchHsn,
    addDataToOrg,editDataInOrg,deleteDataInOrg,
    productDetails,deleteProduct,saveOrderNumber,
    getInvoiceDetails,editInvoice,fetchFilters,deleteAdditionalCharge,
    addAditionalCharge,EditAditionalCharge,addconfigurations,
    getSalesDetails,saveSalesNumber,fetchAdditionalDetails,
    fetchConfigurationNumber,findSecondaryUserGodowns,findPrimaryUserGodownsSelf,
    godownwiseProducts,godownwiseProductsSelf,
    findGodownsNames,getPurchaseDetails,getAllSubDetails,
    fetchGodowns,createStockTransfer,editStockTransfer,cancelSalesOrder,
    cancelStockTransfer} from "../controllers/secondaryUserController.js"
 
import { createPurchase,editPurchase,cancelPurchase } from '../controllers/purchaseController.js';
import { createCreditNote,cancelCreditNote ,editCreditNote} from '../controllers/creditNoteController.js';
import {createSale,editSale,cancelSale,} from '../controllers/saleController.js';

    import { getStockTransferDetails,addProduct ,editProduct,getCreditNoteDetails,transactions,fetchAdditionalCharges, getDebitNoteDetails} from '../controllers/commonController.js';
import { authSecondary } from '../middlewares/authSecUsers.js';
import { secondaryIsBlocked } from '../middlewares/isBlocked.js';
import { companyAuthentication } from '../middlewares/authCompany.js';
import { cancelDebitNote, createDebitNote, editDebitNote } from '../controllers/debitNoteController.js';


router.post('/login',login)
router.post('/sendOtp',sendOtp)
router.post('/submitOtp',submitOtp)
router.post('/resetPassword',resetPassword)

router.post('/logout',authSecondary,secondaryIsBlocked,logout)
router.get('/getSecUserData',authSecondary,secondaryIsBlocked,getSecUserData)
router.get('/fetchOutstandingTotal/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,fetchOutstandingTotal)
router.get('/fetchOutstandingDetails/:party_id/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,fetchOutstandingDetails)
router.post('/confirmCollection',authSecondary,secondaryIsBlocked,confirmCollection)
router.get('/transactions/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,transactions)
router.get('/getTransactionDetails/:id',authSecondary,secondaryIsBlocked,getTransactionDetails)
router.post('/cancelTransaction/:id',authSecondary,secondaryIsBlocked,cancelTransaction)
router.get('/fetchBanks/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,fetchBanks)
router.get('/PartyList/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,PartyList)
router.post('/addParty',authSecondary,secondaryIsBlocked,addParty)
router.get('/getProducts/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,getProducts)
router.post('/createInvoice',authSecondary,secondaryIsBlocked,createInvoice)
router.get('/invoiceList/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,invoiceList)
router.get('/getSinglePartyDetails/:id',authSecondary,secondaryIsBlocked,getSinglePartyDetails)
router.post('/editParty/:id',authSecondary,secondaryIsBlocked,editParty)
router.delete('/deleteParty/:id',authSecondary,secondaryIsBlocked,deleteParty)
router.get('/getSingleOrganization/:id', authSecondary,secondaryIsBlocked,getSingleOrganization);
router.get('/fetchHsn/:cmp_id',companyAuthentication,fetchHsn)
router.post('/addDataToOrg/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,addDataToOrg)
router.post('/editDataInOrg/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,editDataInOrg)
router.post('/deleteDataInOrg/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,deleteDataInOrg)
router.post('/addProduct',authSecondary,secondaryIsBlocked,addProduct)
router.get('/productDetails/:id',authSecondary,secondaryIsBlocked,productDetails)
router.post('/editProduct/:id',authSecondary,secondaryIsBlocked,editProduct)
router.delete('/deleteProduct/:id',authSecondary,secondaryIsBlocked,deleteProduct)
router.post('/saveOrderNumber/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,saveOrderNumber)
router.get('/getInvoiceDetails/:id',authSecondary,secondaryIsBlocked,getInvoiceDetails)
router.post('/editInvoice/:id',authSecondary,secondaryIsBlocked,editInvoice)
router.get('/fetchFilters/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,fetchFilters)
router.post('/addAditionalCharge/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,addAditionalCharge)

router.delete('/deleteAdditionalCharge/:id/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,deleteAdditionalCharge)
router.post('/EditAditionalCharge/:cmp_id/:id',authSecondary,secondaryIsBlocked,companyAuthentication,EditAditionalCharge)
router.post('/addconfigurations/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,addconfigurations)
router.post('/createSale',authSecondary,secondaryIsBlocked,createSale)
router.get('/getSalesDetails/:id',authSecondary,secondaryIsBlocked,getSalesDetails)
router.post('/saveSalesNumber/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,saveSalesNumber)
router.get('/fetchAdditionalDetails/:cmp_id',authSecondary,secondaryIsBlocked,companyAuthentication,fetchAdditionalDetails)
router.get('/fetchConfigurationNumber/:cmp_id/:title',authSecondary,secondaryIsBlocked,companyAuthentication,fetchConfigurationNumber)
router.get("/getGodowns/:cmp_id",authSecondary,secondaryIsBlocked,companyAuthentication,findSecondaryUserGodowns)
router.get("/getGodownsSelf/:cmp_id",authSecondary,secondaryIsBlocked,companyAuthentication,findPrimaryUserGodownsSelf)
router.get("/godownProductFilter/:cmp_id/:godown_id",authSecondary,companyAuthentication,secondaryIsBlocked,godownwiseProducts)
router.get("/godownProductFilterSelf/:cmp_id/:godown_name",authSecondary,secondaryIsBlocked,companyAuthentication,godownwiseProductsSelf)
router.get("/additionalcharges/:cmp_id",authSecondary,secondaryIsBlocked,companyAuthentication,fetchAdditionalCharges)
router.get("/godownsName/:cmp_id",authSecondary,secondaryIsBlocked,companyAuthentication,findGodownsNames)
router.get('/getPurchaseDetails/:id',authSecondary,secondaryIsBlocked,getPurchaseDetails)
router.post('/editSale/:id',authSecondary,secondaryIsBlocked,editSale)
router.get("/getAllSubDetails/:orgId",authSecondary,secondaryIsBlocked,getAllSubDetails)
router.get("/fetchGodowns/:cmp_id",authSecondary,secondaryIsBlocked,fetchGodowns)
router.post("/createStockTransfer",authSecondary,secondaryIsBlocked,createStockTransfer)
router.get("/getStockTransferDetails/:id",authSecondary,secondaryIsBlocked,getStockTransferDetails)
router.post("/editStockTransfer/:id",authSecondary,secondaryIsBlocked,editStockTransfer)
router.post("/cancelSalesOrder/:id",authSecondary,secondaryIsBlocked,cancelSalesOrder)
router.post("/cancelSales/:id",authSecondary,secondaryIsBlocked,cancelSale)
router.post("/cancelstockTransfer/:id",authSecondary,secondaryIsBlocked,cancelStockTransfer)
router.post("/cancelstockTransfer/:id",authSecondary,secondaryIsBlocked,cancelStockTransfer)


///purchase routes
router.post('/createPurchase',authSecondary,secondaryIsBlocked,createPurchase)
router.post('/editPurchase/:id',authSecondary,secondaryIsBlocked,editPurchase)
router.post("/cancelpurchase/:id",authSecondary,secondaryIsBlocked,cancelPurchase)
///credit not routes
router.post('/createCreditNote',authSecondary,secondaryIsBlocked,createCreditNote)
router.get('/getCreditNoteDetails/:id',authSecondary,secondaryIsBlocked,getCreditNoteDetails)
router.post('/cancelCreditNote/:id',authSecondary,secondaryIsBlocked,cancelCreditNote)
router.post('/editCreditNote/:id',authSecondary,secondaryIsBlocked,editCreditNote)
///debit not routes
router.post('/createDebitNote',authSecondary,secondaryIsBlocked,createDebitNote)
router.get('/getDebitNoteDetails/:id',authSecondary,secondaryIsBlocked,getDebitNoteDetails)
router.post('/cancelDebitNote/:id',authSecondary,secondaryIsBlocked,cancelDebitNote)
router.post('/editDebitNote/:id',authSecondary,secondaryIsBlocked,editDebitNote)



export default router