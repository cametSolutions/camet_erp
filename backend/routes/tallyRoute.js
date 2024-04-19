import express from "express";
import { saveDataFromTally,giveTransaction,addBankData ,saveProductsFromTally,savePartyFromTally} from "../controllers/tallyController.js";

const router =express.Router();

router.post('/master/os',saveDataFromTally)
router.post('/master/bank',addBankData)
router.post('/master/item',saveProductsFromTally)
router.post('/master/party',savePartyFromTally)
router.get('/getTransactions/:cmp_id/:SNo',giveTransaction)


export default router