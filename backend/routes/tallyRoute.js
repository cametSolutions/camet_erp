import express from "express";
import { saveDataFromTally,giveTransaction,addBankData ,
    saveProductsFromTally,savePartyFromTally,
    saveAdditionalChargesFromTally,giveInvoice} from "../controllers/tallyController.js";

const router =express.Router();

router.post('/master/os',saveDataFromTally)
router.post('/master/bank',addBankData)
router.post('/master/item',saveProductsFromTally)
router.post('/master/party',savePartyFromTally)
router.post('/master/addCharges',saveAdditionalChargesFromTally)

//get
router.get('/getTransactions/:cmp_id/:SNo',giveTransaction)
router.get('/getSalesOrder/:cmp_id/:SNo',giveInvoice)


export default router