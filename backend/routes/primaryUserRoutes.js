import express from 'express';
const router = express.Router();
import { authPrimary } from '../middlewares/authPrimaryUsers.js';
import { registerPrimaryUser,login,addOrganizations,
  primaryUserLogout ,getPrimaryUserData,getOrganizations,
  addSecUsers,fetchSecondaryUsers,
  fetchOutstandingTotal,fetchOutstandingDetails,confirmCollection,
  transactions,cancelTransaction,fetchBanks,bankList,
  sendOtp,submitOtp,resetPassword,getTransactionDetails,getSingleOrganization,
  editOrg,addParty,addHsn,addDataToOrg,editDataInOrg,deleteDataInOrg,
  fetchHsn,addProduct,getProducts,deleteProduct,productDetails,
  editProduct,PartyList,deleteParty,getSinglePartyDetails,editParty,
  fetchFilters,createInvoice,addBulkProducts,invoiceList,deleteHsn,
  getSingleHsn,editHsn,addBank,getBankDetails,editBank,getSecUserDetails,
  editSecUSer,saveOrderNumber,getInvoiceDetails,editInvoice,addAditionalCharge,
  deleteAdditionalCharge,EditAditionalCharge,addconfigurations,createSale,saveSalesNumber,getSalesDetails} from '../controllers/primaryUserController.js';
import { singleUpload } from '../multer/multer.js';
import { primaryIsBlocked } from '../middlewares/isBlocked.js';

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
router.get('/fetchOutstandingTotal', authPrimary,primaryIsBlocked,fetchOutstandingTotal);
router.get('/fetchOutstandingDetails/:id/:cmp_id', authPrimary,primaryIsBlocked,fetchOutstandingDetails);
router.get('/fetchOutstandingDetails/:id', authPrimary,primaryIsBlocked,fetchOutstandingDetails);
router.post('/confirmCollection',authPrimary,primaryIsBlocked,confirmCollection)
router.get('/transactions/:cmp_id',authPrimary,primaryIsBlocked,transactions)
router.post('/cancelTransaction/:id',authPrimary,primaryIsBlocked,cancelTransaction)
router.get('/fetchBanks/:cmp_id',authPrimary,primaryIsBlocked,fetchBanks)
router.get('/bankList/:cmp_id',authPrimary,primaryIsBlocked,bankList)
router.get('/getTransactionDetails/:id',authPrimary,primaryIsBlocked,getTransactionDetails)
router.get('/getInvoiceDetails/:id',authPrimary,primaryIsBlocked,getInvoiceDetails)
router.post('/addParty',authPrimary,primaryIsBlocked,addParty)
router.post('/addHsn',authPrimary,primaryIsBlocked,addHsn)
router.post('/addDataToOrg/:cmp_id',authPrimary,primaryIsBlocked,addDataToOrg)
router.post('/editDataInOrg/:cmp_id',authPrimary,primaryIsBlocked,editDataInOrg)
router.post('/deleteDataInOrg/:cmp_id',authPrimary,primaryIsBlocked,deleteDataInOrg)
router.get('/fetchHsn/:cmp_id',authPrimary,primaryIsBlocked,fetchHsn)
router.get('/fetchFilters/:cmp_id',authPrimary,primaryIsBlocked,fetchFilters)
router.post('/addProduct',authPrimary,primaryIsBlocked,addProduct)
router.get('/getProducts/:cmp_id',authPrimary,primaryIsBlocked,getProducts)
router.delete('/deleteProduct/:id',authPrimary,primaryIsBlocked,deleteProduct)
router.get('/productDetails/:id',authPrimary,primaryIsBlocked,productDetails)
router.post('/editProduct/:id',authPrimary,primaryIsBlocked,editProduct)
router.get('/PartyList/:cmp_id',authPrimary,primaryIsBlocked,PartyList)
router.delete('/deleteParty/:id',authPrimary,primaryIsBlocked,deleteParty)
router.get('/getSinglePartyDetails/:id',authPrimary,primaryIsBlocked,getSinglePartyDetails)
router.post('/editParty/:id',authPrimary,primaryIsBlocked,editParty)
router.post('/editParty/:id',authPrimary,primaryIsBlocked,editParty)
router.post('/createInvoice',authPrimary,primaryIsBlocked,createInvoice)
router.post('/addBulkProducts',addBulkProducts)
router.get('/invoiceList/:cmp_id',authPrimary,primaryIsBlocked,invoiceList)
router.delete('/deleteHsn/:id',authPrimary,primaryIsBlocked,deleteHsn)
router.get('/getSingleHsn/:hsnId',authPrimary,primaryIsBlocked,getSingleHsn)
router.post('/editHsn/:hsnId',authPrimary,primaryIsBlocked,editHsn)
router.post('/addBank',authPrimary,primaryIsBlocked,addBank)
router.get('/getBankDetails/:id',authPrimary,primaryIsBlocked,getBankDetails)
router.post('/editBank/:id',authPrimary,primaryIsBlocked,editBank)
router.get('/getSecUserDetails/:id',authPrimary,primaryIsBlocked,getSecUserDetails)
router.post('/editSecUSer/:id',authPrimary,primaryIsBlocked,editSecUSer)
router.post('/saveOrderNumber/:cmp_id',authPrimary,primaryIsBlocked,saveOrderNumber)
router.get('/getInvoiceDetails/:id',authPrimary,primaryIsBlocked,getInvoiceDetails)
router.post('/editInvoice/:id',authPrimary,primaryIsBlocked,editInvoice)
router.post('/addAditionalCharge/:cmp_id',authPrimary,primaryIsBlocked,addAditionalCharge)
router.delete('/deleteAdditionalCharge/:id/:cmp_id',authPrimary,primaryIsBlocked,deleteAdditionalCharge)
router.post('/EditAditionalCharge/:cmp_id/:id',authPrimary,primaryIsBlocked,EditAditionalCharge)
router.post('/addconfigurations/:cmp_id',authPrimary,primaryIsBlocked,addconfigurations)
router.post('/createSale',authPrimary,primaryIsBlocked,createSale)
router.post('/saveSalesNumber/:cmp_id',authPrimary,primaryIsBlocked,saveSalesNumber)
router.get('/getSalesDetails/:id',authPrimary,primaryIsBlocked,getSalesDetails)









router.post('/sendOtp',sendOtp)
router.post('/submitOtp',submitOtp)
router.post('/resetPassword',resetPassword)




export default router;
