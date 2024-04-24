import express from 'express'
const router = express.Router();
import {login,getSecUserData,fetchOutstandingTotal,
    fetchOutstandingDetails,confirmCollection,logout,
    transactions,cancelTransaction,fetchBanks,sendOtp,
    submitOtp,resetPassword,getTransactionDetails,PartyList,addParty,getProducts,
    createInvoice,invoiceList,getSinglePartyDetails,editParty,
    deleteParty,getSingleOrganization,fetchHsn,
    addDataToOrg,editDataInOrg,deleteDataInOrg,addProduct,
    productDetails,editProduct,deleteProduct,saveOrderNumber,
    getInvoiceDetails,editInvoice,fetchFilters,deleteAdditionalCharge,
    addAditionalCharge,EditAditionalCharge,addconfigurations,createSale,
    getSalesDetails,saveSalesNumber,fetchAdditionalDetails,
    fetchConfigurationNumber,findSecondaryUserGodowns,findPrimaryUserGodownsSelf,
    godownwiseProducts,godownwiseProductsSelf} from "../controllers/secondaryUserController.js"
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
router.get('/transactions/:cmp_id',authSecondary,secondaryIsBlocked,transactions)
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
router.delete('/deleteProduct/:id',authSecondary,secondaryIsBlocked,deleteProduct)
router.post('/saveOrderNumber/:cmp_id',authSecondary,secondaryIsBlocked,saveOrderNumber)
router.get('/getInvoiceDetails/:id',authSecondary,secondaryIsBlocked,getInvoiceDetails)
router.post('/editInvoice/:id',authSecondary,secondaryIsBlocked,editInvoice)
router.get('/fetchFilters/:cmp_id',authSecondary,secondaryIsBlocked,fetchFilters)
router.post('/addAditionalCharge/:cmp_id',authSecondary,secondaryIsBlocked,addAditionalCharge)

router.delete('/deleteAdditionalCharge/:id/:cmp_id',authSecondary,secondaryIsBlocked,deleteAdditionalCharge)
router.post('/EditAditionalCharge/:cmp_id/:id',authSecondary,secondaryIsBlocked,EditAditionalCharge)
router.post('/addconfigurations/:cmp_id',authSecondary,secondaryIsBlocked,addconfigurations)
router.post('/createSale',authSecondary,secondaryIsBlocked,createSale)
router.get('/getSalesDetails/:id',authSecondary,secondaryIsBlocked,getSalesDetails)
router.post('/saveSalesNumber/:cmp_id',authSecondary,secondaryIsBlocked,saveSalesNumber)
router.get('/fetchAdditionalDetails/:cmp_id',authSecondary,secondaryIsBlocked,fetchAdditionalDetails)
router.get('/fetchConfigurationNumber/:cmp_id/:title',authSecondary,secondaryIsBlocked,fetchConfigurationNumber)
router.get("/getGodowns/:cmp_id",authSecondary,secondaryIsBlocked,findSecondaryUserGodowns)
router.get("/getGodownsSelf/:cmp_id",authSecondary,secondaryIsBlocked,findPrimaryUserGodownsSelf)
router.get("/godownProductFilter/:cmp_id/:godown_id",authSecondary,secondaryIsBlocked,godownwiseProducts)
router.get("/godownProductFilterSelf/:cmp_id/:godown_name",authSecondary,secondaryIsBlocked,godownwiseProductsSelf)
router.get("/additionalcharges/:cmp_id/:id",authSecondary,secondaryIsBlocked,)






















export default router