import express from 'express'
const router = express.Router();
import {login,getSecUserData,fetchOutstandingTotal,
    fetchOutstandingDetails,confirmCollection,logout,
    transactions,cancelTransaction,fetchBanks,sendOtp,
    submitOtp,resetPassword,getTransactionDetails,PartyList,addParty,getProducts,
    createInvoice,invoiceList,getSinglePartyDetails,editParty,
    deleteParty,getSingleOrganization,fetchHsn,
    addDataToOrg,editDataInOrg,deleteDataInOrg,addProduct,productDetails,editProduct} from "../controllers/secondaryUserController.js"
import { authSecondary } from '../middlewares/authSecUsers.js';
import { secondaryIsBlocked } from '../middlewares/isBlocked.js';


router.post('/login',login)
router.post('/sendOtp',sendOtp)
router.post('/submitOtp',submitOtp)
router.post('/resetPassword',resetPassword)

router.post('/logout',authSecondary,secondaryIsBlocked,logout)
router.get('/getSecUserData',authSecondary,secondaryIsBlocked,getSecUserData)
router.get('/fetchOutstandingTotal/:cmp_id',authSecondary,secondaryIsBlocked,fetchOutstandingTotal)
router.get('/fetchOutstandingDetails/:party_id/:cmp_id',authSecondary,secondaryIsBlocked,fetchOutstandingDetails)
router.post('/confirmCollection',authSecondary,secondaryIsBlocked,confirmCollection)
router.get('/transactions',authSecondary,secondaryIsBlocked,transactions)
router.get('/getTransactionDetails/:id',authSecondary,secondaryIsBlocked,getTransactionDetails)
router.post('/cancelTransaction/:id',authSecondary,secondaryIsBlocked,cancelTransaction)
router.get('/fetchBanks/:cmp_id',authSecondary,secondaryIsBlocked,fetchBanks)
router.get('/PartyList/:cmp_id',authSecondary,secondaryIsBlocked,PartyList)
router.post('/addParty',authSecondary,secondaryIsBlocked,addParty)
router.get('/getProducts/:cmp_id',authSecondary,secondaryIsBlocked,getProducts)
router.post('/createInvoice',authSecondary,secondaryIsBlocked,createInvoice)
router.get('/invoiceList/:cmp_id',authSecondary,secondaryIsBlocked,invoiceList)
router.get('/getSinglePartyDetails/:id',authSecondary,secondaryIsBlocked,getSinglePartyDetails)
router.post('/editParty/:id',authSecondary,secondaryIsBlocked,editParty)
router.delete('/deleteParty/:id',authSecondary,secondaryIsBlocked,deleteParty)
router.get('/getSingleOrganization/:id', authSecondary,secondaryIsBlocked,getSingleOrganization);
router.get('/fetchHsn/:cmp_id',fetchHsn)
router.post('/addDataToOrg/:cmp_id',authSecondary,secondaryIsBlocked,addDataToOrg)
router.post('/editDataInOrg/:cmp_id',authSecondary,secondaryIsBlocked,editDataInOrg)
router.post('/deleteDataInOrg/:cmp_id',authSecondary,secondaryIsBlocked,deleteDataInOrg)
router.post('/addProduct',authSecondary,secondaryIsBlocked,addProduct)
router.get('/productDetails/:id',authSecondary,secondaryIsBlocked,productDetails)
router.post('/editProduct/:id',authSecondary,secondaryIsBlocked,editProduct)













export default router