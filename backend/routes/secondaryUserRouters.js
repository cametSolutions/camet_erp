import express from 'express'
const router = express.Router();
import {login,getSecUserData,fetchOutstandingTotal,
    fetchOutstandingDetails,confirmCollection,logout,
    transactions,cancelTransaction,fetchBanks,sendOtp,submitOtp,resetPassword,getTransactionDetails} from "../controllers/secondaryUserController.js"
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



export default router