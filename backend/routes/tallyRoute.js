import express from "express";
import { saveDataFromTally,giveTransaction,addBankData } from "../controllers/tallyController.js";

const router =express.Router();

router.post('/master/os',saveDataFromTally)
router.post('/master/bank',addBankData)
router.get('/getTransactions/:cmp_id/:SNo',giveTransaction)


export default router