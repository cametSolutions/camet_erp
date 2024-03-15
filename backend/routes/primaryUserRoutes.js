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
  fetchFilters,createInvoice,addBulkProducts,invoiceList} from '../controllers/primaryUserController.js';
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
router.get('/transactions',authPrimary,primaryIsBlocked,transactions)
router.post('/cancelTransaction/:id',authPrimary,primaryIsBlocked,cancelTransaction)
router.get('/fetchBanks/:cmp_id',authPrimary,primaryIsBlocked,fetchBanks)
router.get('/bankList',authPrimary,primaryIsBlocked,bankList)
router.get('/getTransactionDetails/:id',authPrimary,primaryIsBlocked,getTransactionDetails)
router.post('/addParty',authPrimary,primaryIsBlocked,addParty)
router.post('/addHsn',authPrimary,primaryIsBlocked,addHsn)
router.post('/addDataToOrg/:cmp_id',authPrimary,primaryIsBlocked,addDataToOrg)
router.post('/editDataInOrg/:cmp_id',authPrimary,primaryIsBlocked,editDataInOrg)
router.post('/deleteDataInOrg/:cmp_id',authPrimary,primaryIsBlocked,deleteDataInOrg)
router.get('/fetchHsn/:cmp_id',authPrimary,primaryIsBlocked,fetchHsn)
router.get('/fetchFilters/:cmp_id',authPrimary,primaryIsBlocked,fetchFilters)
router.post('/addProduct',authPrimary,primaryIsBlocked,addProduct)
router.get('/getProducts',authPrimary,primaryIsBlocked,getProducts)
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


router.post('/sendOtp',sendOtp)
router.post('/submitOtp',submitOtp)
router.post('/resetPassword',resetPassword)




export default router;
