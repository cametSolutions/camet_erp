import express from "express";
import { saveDataFromTally,giveTransaction,addBankData ,
    saveProductsFromTally,savePartyFromTally,
    saveAdditionalChargesFromTally,giveInvoice,giveSales,giveVanSales,getStockTransfers,giveReceipts,givePayments} from "../controllers/tallyController.js";

const router =express.Router();

router.post('/master/os',saveDataFromTally)
router.post('/master/bank',addBankData)
router.post('/master/item',saveProductsFromTally)
router.post('/master/party',savePartyFromTally)
router.post('/master/addCharges',saveAdditionalChargesFromTally)

//get
router.get('/getTransactions/:cmp_id/:SNo',giveTransaction)
router.get('/getSalesOrders/:cmp_id/:SNo',giveInvoice)
router.get('/getSales/:cmp_id/:SNo',giveSales)
router.get('/getVanSales/:cmp_id/:SNo',giveVanSales)
router.get('/getStockTransfers/:cmp_id/:SNo',getStockTransfers)
router.get('/getReceipts/:cmp_id/:SNo',giveReceipts)
router.get('/getPayments/:cmp_id/:SNo',givePayments)


export default router