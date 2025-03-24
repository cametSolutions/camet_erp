import express from "express";
import { saveDataFromTally,giveTransaction,addBankData ,
    saveProductsFromTally,savePartyFromTally,addCashData,
    saveAdditionalChargesFromTally,giveInvoice,giveSales,giveVanSales,getStockTransfers,giveReceipts,givePayments,
    updateStock,
    updatePriceLevels,
    givePurchase,
    addAccountGroups,
    addSubGroups,
    addSubDetails} from "../controllers/tallyController.js";

const router =express.Router();

router.post('/master/os',saveDataFromTally)
router.post('/master/bank',addBankData)
router.post('/master/cash',addCashData)
router.post('/master/item',saveProductsFromTally)
router.post('/master/item/base',saveProductsFromTally)

router.post('/master/party',savePartyFromTally)
router.post('/master/addCharges',saveAdditionalChargesFromTally)
router.post('/master/addAccountGroups',addAccountGroups)
router.post('/master/addSubGroups',addSubGroups)
/// sub details of product
router.post('/master/addGodowns',addSubDetails)
router.post('/master/addPriceLevels',addSubDetails)
router.post('/master/addBrands',addSubDetails)
router.post('/master/addCategory',addSubDetails)
router.post('/master/addSubCategory',addSubDetails)
router.post('/master/item/updateStock',updateStock)
router.post('/master/item/updatePriceLevels',updatePriceLevels)

//get
router.get('/getTransactions/:cmp_id/:SNo',giveTransaction)
router.get('/getSalesOrders/:cmp_id/:SNo',giveInvoice)
router.get('/getSales/:cmp_id/:SNo',giveSales)
router.get('/getVanSales/:cmp_id/:SNo',giveVanSales)
router.get('/getStockTransfers/:cmp_id/:SNo',getStockTransfers)
router.get('/getReceipts/:cmp_id/:SNo',giveReceipts)
router.get('/getPayments/:cmp_id/:SNo',givePayments)
router.get('/getPurchase/:cmp_id/:SNo',givePurchase)


export default router