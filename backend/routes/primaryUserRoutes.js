import express from 'express';
const router = express.Router();
import { authPrimary } from '../middlewares/authPrimaryUsers.js';
import { registerPrimaryUser,login,addOrganizations,
  primaryUserLogout ,getPrimaryUserData,getOrganizations,
  addSecUsers,fetchSecondaryUsers,
  fetchOutstandingTotal,fetchOutstandingDetails,confirmCollection,
  cancelTransaction,fetchBanks,bankList,
  sendOtp,submitOtp,resetPassword,getTransactionDetails,getSingleOrganization,
  editOrg,addParty,addHsn,addDataToOrg,editDataInOrg,deleteDataInOrg,
  fetchHsn,getProducts,deleteProduct,productDetails
  ,PartyList,deleteParty,getSinglePartyDetails,editParty,
  fetchFilters,createInvoice,addBulkProducts,invoiceList,deleteHsn,
  getSingleHsn,editHsn,addBank,getBankDetails,editBank,getSecUserDetails,
  editSecUSer,saveOrderNumber,getInvoiceDetails,editInvoice,addAditionalCharge,
  deleteAdditionalCharge,EditAditionalCharge,addconfigurations,
  createSale,saveSalesNumber,getSalesDetails,fetchGodownsAndPriceLevels,fetchAdditionalDetails,
  addSecondaryConfigurations,findPrimaryUserGodowns,findPrimaryUserGodownsSelf,
  godownwiseProducts,godownwiseProductsSelf,getPurchaseDetails,addProductSubDetails,
  getProductSubDetails,deleteProductSubDetails,editProductSubDetails,getAllSubDetails,fetchConfigurationCurrentNumber} from '../controllers/primaryUserController.js';


  import { cancelPurchase } from '../controllers/purchaseController.js';

import {addProduct,editProduct,getCreditNoteDetails,transactions,fetchAdditionalCharges, getDebitNoteDetails,
  getReceiptDetails,getPaymentDetails} from "../controllers/commonController.js";
import { singleUpload } from '../multer/multer.js';
import { primaryIsBlocked } from '../middlewares/isBlocked.js';
import { companyAuthentication } from '../middlewares/authCompany.js';
import { getStockTransferDetails } from '../controllers/commonController.js';

router.post('/register', registerPrimaryUser);
router.post('/login', login);
router.post('/addOrganizations', authPrimary,primaryIsBlocked,addOrganizations);
router.post('/editOrg/:id', authPrimary,primaryIsBlocked,editOrg);
router.post('/primaryUserLogout', authPrimary,primaryIsBlocked,primaryUserLogout);
router.get('/getPrimaryUserData', authPrimary,primaryIsBlocked,getPrimaryUserData);
router.get('/getOrganizations', authPrimary,primaryIsBlocked,getOrganizations);
router.get('/getSingleOrganization/:id', authPrimary,primaryIsBlocked,getSingleOrganization);
router.post('/addSecUsers', authPrimary,primaryIsBlocked,addSecUsers);
router.get('/fetchSecondaryUsers', authPrimary,primaryIsBlocked,fetchSecondaryUsers);
router.get('/fetchOutstandingTotal/:cmp_id', authPrimary,primaryIsBlocked,companyAuthentication,fetchOutstandingTotal);
router.get('/fetchOutstandingDetails/:id/:cmp_id', authPrimary,primaryIsBlocked,companyAuthentication,fetchOutstandingDetails);
router.get('/fetchOutstandingDetails/:id', authPrimary,primaryIsBlocked,fetchOutstandingDetails);
router.post('/confirmCollection',authPrimary,primaryIsBlocked,confirmCollection)
router.get('/transactions/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,transactions)
router.post('/cancelTransaction/:id',authPrimary,primaryIsBlocked,cancelTransaction)
router.get('/fetchBanks/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,fetchBanks)
router.get('/bankList/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,bankList)
router.get('/getTransactionDetails/:id',authPrimary,primaryIsBlocked,getTransactionDetails)
router.get('/getInvoiceDetails/:id',authPrimary,primaryIsBlocked,getInvoiceDetails)
router.post('/addParty',authPrimary,primaryIsBlocked,addParty)
router.post('/addHsn',authPrimary,primaryIsBlocked,addHsn)
router.post('/addDataToOrg/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,addDataToOrg)
router.post('/editDataInOrg/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,editDataInOrg)
router.post('/deleteDataInOrg/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,deleteDataInOrg)
router.get('/fetchHsn/:cmp_id',authPrimary,primaryIsBlocked,fetchHsn)
router.get('/fetchFilters/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,fetchFilters)
router.post('/addProduct',authPrimary,primaryIsBlocked,addProduct)
router.get('/getProducts/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,getProducts)
router.delete('/deleteProduct/:id',authPrimary,primaryIsBlocked,deleteProduct)
router.get('/productDetails/:id',authPrimary,primaryIsBlocked,productDetails)
router.post('/editProduct/:id',authPrimary,primaryIsBlocked,editProduct)
router.get('/PartyList/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,PartyList)
router.delete('/deleteParty/:id',authPrimary,primaryIsBlocked,deleteParty)
router.get('/getSinglePartyDetails/:id',authPrimary,primaryIsBlocked,getSinglePartyDetails)
router.post('/editParty/:id',authPrimary,primaryIsBlocked,editParty)
router.post('/editParty/:id',authPrimary,primaryIsBlocked,editParty)
router.post('/createInvoice',authPrimary,primaryIsBlocked,createInvoice)
router.post('/addBulkProducts',addBulkProducts)
router.get('/invoiceList/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,invoiceList)
router.delete('/deleteHsn/:id',authPrimary,primaryIsBlocked,deleteHsn)
router.get('/getSingleHsn/:hsnId',authPrimary,primaryIsBlocked,getSingleHsn)
router.post('/editHsn/:hsnId',authPrimary,primaryIsBlocked,editHsn)
router.post('/addBank',authPrimary,primaryIsBlocked,addBank)
router.get('/getBankDetails/:id',authPrimary,primaryIsBlocked,getBankDetails)
router.post('/editBank/:id',authPrimary,primaryIsBlocked,editBank)
router.get('/getSecUserDetails/:id',authPrimary,primaryIsBlocked,getSecUserDetails)
router.post('/editSecUSer/:id',authPrimary,primaryIsBlocked,editSecUSer)
router.post('/saveOrderNumber/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,saveOrderNumber)
router.get('/getInvoiceDetails/:id',authPrimary,primaryIsBlocked,getInvoiceDetails)
router.post('/editInvoice/:id',authPrimary,primaryIsBlocked,editInvoice)
router.post('/addAditionalCharge/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,addAditionalCharge)
router.delete('/deleteAdditionalCharge/:id/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,deleteAdditionalCharge)
router.post('/EditAditionalCharge/:cmp_id/:id',authPrimary,primaryIsBlocked,companyAuthentication,EditAditionalCharge)
router.post('/addconfigurations/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,addconfigurations)
router.post('/createSale',authPrimary,primaryIsBlocked,createSale)
router.post('/saveSalesNumber/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,saveSalesNumber)
router.get('/getSalesDetails/:id',authPrimary,primaryIsBlocked,getSalesDetails)
router.get('/fetchGodownsAndPriceLevels/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,fetchGodownsAndPriceLevels)
router.get('/fetchAdditionalDetails/:cmp_id',authPrimary,primaryIsBlocked,companyAuthentication,fetchAdditionalDetails)
router.post('/addSecondaryConfigurations/:cmp_id/:userId',authPrimary,primaryIsBlocked,companyAuthentication,addSecondaryConfigurations)
router.get("/getGodowns/:cmp_id",authPrimary,primaryIsBlocked,companyAuthentication,findPrimaryUserGodowns)
router.get("/getGodownsSelf/:cmp_id",authPrimary,primaryIsBlocked,companyAuthentication,findPrimaryUserGodownsSelf)
router.get("/godownProductFilter/:cmp_id/:godown_id",authPrimary,primaryIsBlocked,companyAuthentication,godownwiseProducts)
router.get("/godownProductFilterSelf/:cmp_id/:godown_name",authPrimary,primaryIsBlocked,companyAuthentication,godownwiseProductsSelf)
router.get("/additionalcharges/:cmp_id",authPrimary,primaryIsBlocked,companyAuthentication,fetchAdditionalCharges)
router.get("/getPurchaseDetails/:id",authPrimary,primaryIsBlocked,getPurchaseDetails)
router.post("/addProductSubDetails/:orgId",authPrimary,primaryIsBlocked,addProductSubDetails)
router.get("/getProductSubDetails/:orgId",authPrimary,primaryIsBlocked,getProductSubDetails)
router.delete("/deleteProductSubDetails/:orgId/:id",authPrimary,primaryIsBlocked,deleteProductSubDetails)
router.put("/editProductSubDetails/:orgId/:id",authPrimary,primaryIsBlocked,editProductSubDetails)
router.get("/getAllSubDetails/:orgId",authPrimary,primaryIsBlocked,getAllSubDetails)
router.get("/fetchConfigurationCurrentNumber/:orgId/:_id",authPrimary,primaryIsBlocked,fetchConfigurationCurrentNumber)
router.get("/getStockTransferDetails/:id",authPrimary,primaryIsBlocked,getStockTransferDetails)
router.post("/cancelpurchase/:id",authPrimary,primaryIsBlocked,cancelPurchase)


////credit note
router.get('/getCreditNoteDetails/:id',authPrimary,primaryIsBlocked,getCreditNoteDetails)
////debit note
router.get('/getDebitNoteDetails/:id',authPrimary,primaryIsBlocked,getDebitNoteDetails)
////payment
router.get('/getPaymentDetails/:id',authPrimary,primaryIsBlocked,getPaymentDetails)
////receipt
router.get('/getReceiptDetails/:id',authPrimary,primaryIsBlocked,getReceiptDetails)










router.post('/sendOtp',sendOtp)
router.post('/submitOtp',submitOtp)
router.post('/resetPassword',resetPassword)




export default router;
