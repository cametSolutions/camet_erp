
import {Route,Routes} from 'react-router-dom'
import SecHome from '../pages/secUsers/SecHome'
import Outstanding from '../pages/secUsers/Outstanding'
import OutstandingDetails from '../pages/secUsers/OutstandingDetails'
import PaymentSec from '../pages/secUsers/Payment'
import ProtectedSecRoute from './ProtectedSecRoute'
import Transaction from '../pages/secUsers/Transaction'
import EditOrg from '../pages/masters/organization/EditOrg'
import DashboardSec from '../pages/secUsers/Dashboard'
import Hsn from '../pages/masters/hsn/Hsn'
import Demo from '../pages/secUsers/Demo'
import RetailersList from '../pages/masters/secondaryUsers/RetailersList'
import HsnList from '../pages/masters/hsn/HsnList'
import EditHsn from '../pages/masters/hsn/EditHsn'
import PartyListSecondary from '../pages/masters/party/PartyListSecondary'
import AddPartySecondary from '../pages/masters/party/AddPartySecondary'
import ProductListSecondary from '../pages/masters/product/ProductListSecondary'
// import AddItemSecondary from '../pages/secUsers/AddItemSecondary'
// import EditItemSecondary from '../pages/secUsers/EditItemSecondary'
import EditPartySecondary from '../pages/masters/party/EditPartySecondary'
import AddProductSecondary from '../pages/masters/product/AddProductSecondary'
import EditProductSecondary from '../pages/masters/product/EditProductSecondary'
import EditSecUsers from '../pages/masters/secondaryUsers/EditSecUsers'
import ShareInvoiceSecondary from '../pages/secUsers/ShareInvoiceSecondary'
import AddChargesListSecondary from '../pages/secUsers/settilngs/serviceLedger/AddChargesListSecondary'
import AdditionalChargesSecondary from '../pages/secUsers/settilngs/serviceLedger/AdditionalChargesSecondary'
import OrderConfigurationsSecondary from '../pages/secUsers/OrderConfigurationsSecondary'
// inventory 
import InventorySecondaryUser from '../pages/secUsers/InventorySecondaryUser'
// import SalesSecondary from '../pages/secUsers/SalesSecondary'
import SearchParty from '../pages/secUsers/SearchParty'
import EditItemSalesSecondary from '../pages/secUsers/EditItemSalesSecondary'
import ShareSalesSecondary from '../pages/secUsers/ShareSalesSecondary'
import ConfigureSecondaryUser from '../pages/masters/secondaryUsers/ConfigureSecondaryUser'
// Error Page
import ErrorPage from '../pages/errorPages/Notfound'
import Notfound from '../pages/errorPages/Notfound'
import ServerError from '../pages/errorPages/ServerError'
import ThreeInchSalesSec from '../pages/secUsers/ThreeInchSalesSec'
import AddItemPurchase from '../pages/secUsers/AddItemPurchase'
import EditItemPurchase from '../pages/secUsers/EditItemPurchase'
import SharePurchaseSecondary from '../pages/secUsers/SharePurchaseSecondary'
import EditSale from '../pages/secUsers/EditSale'
import ThreeInchInvoiceSec from '../pages/secUsers/ThreeInchInvoiceSec'
import BillToSales from '../pages/secUsers/BillToSales'
import BillToSalesOrder from '../pages/secUsers/BillToSalesOrder'
import AddBrand from '../pages/masters/product/productSubDetails/AddBrand'
import AddCategory from '../pages/masters/product/productSubDetails/AddCategory'
import AddSubCategory from '../pages/masters/product/productSubDetails/AddSubCategory'
import AddGodown from '../pages/masters/product/productSubDetails/AddGodown'
import AddPriceLevel from '../pages/masters/product/productSubDetails/AddPriceLevel'
import ShareVanSaleSecondary from '../pages/secUsers/ShareVanSaleSecondary'
import ThreeInchVanSaleSec from '../pages/secUsers/ThreeInchVanSaleSec'
import EditVanSale from '../pages/secUsers/EditVanSale'
import StockTransferSecondary from '../pages/secUsers/StockTransferSecondary'
import SearchGodown from '../pages/secUsers/SearchGodown'
import AddItemStockTransferSec from '../pages/secUsers/AddItemStockTransferSec'
import StockTransferDetailsSecondary from '../pages/secUsers/StockTransferDetailsSecondary'
import EditStockTransferSecondary from '../pages/secUsers/EditStockTransferSecondary'
// import StockTransferDetailsPrimary from '../pages/primaryUsers/StockTransferDetailsPrimary'
import BillToPurchase from '../pages/secUsers/BillToPurchase'
import EditItemStockTransfer from '../pages/secUsers/EditItemStockTransfer'
import AddbatchInPurchase from '../pages/secUsers/AddbatchInPurchase'
import ReceiptPrintOut from '../pages/secUsers/ReceiptPrintOut'
import SelectVouchers from '../pages/secUsers/SelectVouchers'
import Receipt from '../pages/secUsers/Receipt'
import OutstandingListOfReceipt from '../pages/secUsers/OutstandingListOfReceipt'
import PurchasePayment from '../pages/secUsers/PurchasePayment'
import BillToCreditNote from '../pages/secUsers/BillToCreditNote'
// import AddItemCreditNote from '../pages/secUsers/AddItemCreditNote'
// import EditItemCreditNote from '../pages/secUsers/EditItemCreditNote'
import ShareCreditNoteSecondary from '../pages/secUsers/ShareCreditNoteSecondary'
import BillToDebitNote from '../pages/secUsers/BillToDebitNote'
// import AddItemDebitNote from '../pages/secUsers/AddItemDebitNote'
// import EditItemDebitNote from '../pages/secUsers/EditItemDebitNote'
import ShareDebitNoteSecondary from '../pages/secUsers/ShareDebitNoteSecondary'
import OutstandingListOfPayment from '../pages/secUsers/OutstandingListOfPayment'
import ReceiptDetailsOfSale from '../pages/secUsers/ReceiptDetails'
import PaymtentDetails from '../pages/secUsers/PaymtentDetails'
import PaymentPrintOut from '../pages/secUsers/PaymentPrintOut'
import EditReceipt from '../pages/secUsers/EditReceipt'
import OutstandingListOfReceiptForEdit from '../pages/secUsers/OutstandingListOfReceiptForEdit'
import EditPayment from '../pages/secUsers/EditPayment'
import OutstandingListOfPaymentForEdit from '../pages/secUsers/OutstandingListOfPaymentForEdit'
import Reports from '../pages/secUsers/Reports'
import PartyStatement from '../pages/secUsers/Reports/PartyStatement/PartyStatement'
import DateRange from '../components/Filters/DateRange'
import VouchersList from '../components/common/Reports/VouchersList'
import SalesSummary from '../pages/secUsers/Reports/salesSummary/SalesSummary'
import PartyFilterList from '../components/Filters/party/PartyFilterList'
import StatusFilterList from '../components/Filters/status/StatusFilterList'
import OrderSummary from '../pages/secUsers/Reports/orderSummary/OrderSummary'
import PaymentSplitting from '../components/secUsers/main/paymentSplitting/PaymentSplitting'
import BalancePage from '../pages/masters/cashOrBank/BalancePage'
import BalanceDetails from '../pages/masters/cashOrBank/BalanceDetails'
import SourceList from '../pages/secUsers/SourceList'
import SourceTransactions from '../pages/masters/cashOrBank/SourceTransactions'
import AddCash from '../pages/masters/cashOrBank/AddCash'
import SettingsList from '../pages/secUsers/settilngs/SettingsList'
import StockItem from '../pages/secUsers/settilngs/stockItem/StockItem'
import PartySettings from '../pages/secUsers/settilngs/PartySettings'
import DateEntrySettings from '../pages/secUsers/settilngs/DateEntrySettings'
import OutstandingSettings from '../pages/secUsers/settilngs/OutstandingSettings'
import StockItemSettings from '../pages/secUsers/settilngs/stockItem/stockItemSettings/StockItemSettings'
import VoucherSettings from '../pages/secUsers/settilngs/dataEntry/VoucherSettings'
import OrderSettings from '../pages/secUsers/settilngs/dataEntry/OrderSettings'
import InvoiceSettings from '../pages/secUsers/settilngs/dataEntry/InvoiceSettings'
import EmailSettings from '../pages/secUsers/settilngs/dataEntry/voucherSettings/EmailSettings'
import BarcodeList from '../pages/secUsers/settilngs/stockItem/stockItemSettings/barcode/BarcodeList'
import BarcodeCreationDetails from '../pages/secUsers/settilngs/stockItem/stockItemSettings/barcode/BarcodeCreationDetails'
import BarcodePrintOn from '../pages/secUsers/settilngs/stockItem/stockItemSettings/barcode/BarcodePrintOn'
import BarcodePrintOff from '../pages/secUsers/settilngs/stockItem/stockItemSettings/barcode/BarcodePrintOff'
import BarcodeFormat from '../pages/secUsers/settilngs/stockItem/stockItemSettings/barcode/BarcodeFormat'
import PrintConfiguration from '../pages/secUsers/settilngs/PrintConfiguration/PrintConfiguration'
import SaleOrderPrintConfiguration from '../pages/secUsers/settilngs/PrintConfiguration/SaleOrderPrintConfiguration'
import SalePrintConfiguration from '../pages/secUsers/settilngs/PrintConfiguration/SalePrintConfiguration'
import DespatchTitleSettings from '../pages/secUsers/settilngs/dataEntry/invoiceAndOrderCommon/DespatchTitleSettings'
import TermsAndConditionSettings from '../pages/secUsers/settilngs/dataEntry/invoiceAndOrderCommon/TermsAndConditionSettings'
import BarcodeScan from '../components/secUsers/barcodeScanning/BarcodeScan'
import PendingOrders from '../pages/secUsers/orderPendings/PendingOrders'
import SalesSummaryTable from '../pages/secUsers/Reports/salesSummary/SalesSummaryTable'
import OutstandingSummary from '../pages/secUsers/OutstandingSummary'
import AddSubGroup from '../pages/secUsers/settilngs/partySettings/AddSubGroup'
import AddOpening from '@/pages/secUsers/openings/PartyOpening/AddOpening'
import SalesSummaryTransactions from '@/pages/secUsers/Reports/salesSummary/SalesSummaryTransactions'
import VoucherAddCount from '@/pages/voucher/voucherCreation/VoucherAddCount'
import AddOrganisation from '../pages/masters/organization/AddOrganisation'
import OrganizationList from '../pages/masters/organization/OrganisationList'
import AddSecUsers from '../pages/masters/secondaryUsers/AddSecUsers'
import BankingManagement from '@/pages/masters/cashOrBank/BankingManagement'
import VoucherInitalPage from '@/pages/voucher/voucherCreation/voucherInitialPage'
import VoucherInitialPage from '@/pages/voucher/voucherCreation/voucherInitialPage'
import VoucherDetails from '@/pages/voucher/voucherDetails/VoucherDetails'
import VoucherInitialPageEdit from '@/pages/voucher/voucherCreation/voucherInitialPageEdit'
import AccVoucherInitialPage from '@/pages/accountingVoucher/voucherCreation/AccVoucherInitialPage'
import BillToVoucher from '@/pages/voucher/voucherCreation/BillToVoucher'

const Routers = () => {
  return (
    <Routes>
      <Route path='*' element={<Notfound/>}></Route>
        <Route path='/sUsers/home' element={<ProtectedSecRoute><SecHome/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/outstandingDetails/:party_id' element={<ProtectedSecRoute><OutstandingDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/payment' element={<ProtectedSecRoute><PaymentSec/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/transaction' element={<ProtectedSecRoute><Transaction /></ProtectedSecRoute>}></Route>
        {/* <Route path='/sUsers/receiptDetails/:id' element={<ProtectedSecRoute><SecReceptionDetails/></ProtectedSecRoute>}></Route> */}
        <Route path='/sUsers/dashboard' element={<ProtectedSecRoute><DashboardSec/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/invoice' element={<ProtectedSecRoute><VoucherInitalPage/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/searchParty' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/partyList' element={<ProtectedSecRoute><PartyListSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/addParty' element={<ProtectedSecRoute><AddPartySecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/productList' element={<ProtectedSecRoute><ProductListSecondary/></ProtectedSecRoute>}></Route>

        <Route path='/sUsers/editParty/:id' element={<ProtectedSecRoute><EditPartySecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/addProduct' element={<ProtectedSecRoute><AddProductSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editProduct/:id' element={<ProtectedSecRoute><EditProductSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/saleOrderDetails/:id' element={<ProtectedSecRoute><VoucherDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editSaleOrder/:id' element={<ProtectedSecRoute><VoucherInitialPageEdit/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/shareInvoice/:id' element={<ProtectedSecRoute><ShareInvoiceSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/shareInvoiceThreeInch/:id' element={<ProtectedSecRoute><ThreeInchInvoiceSec/></ProtectedSecRoute>}></Route> 

        <Route path='/sUsers/additionalChargesList' element={<ProtectedSecRoute><AddChargesListSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/additionalCharges' element={<ProtectedSecRoute><AdditionalChargesSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editAdditionalCharge/:id' element={<ProtectedSecRoute><AdditionalChargesSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/OrderConfigurations' element={<ProtectedSecRoute><OrderConfigurationsSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/Inventory' element={<ProtectedSecRoute><InventorySecondaryUser/></ProtectedSecRoute>}></Route>

        <Route path='/sUsers/sales' element={<ProtectedSecRoute><VoucherInitialPage/></ProtectedSecRoute>}></Route>
         <Route path='/sUsers/searchPartySales' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/addItemSales' element={<ProtectedSecRoute><VoucherAddCount/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editItemSales/:id/:index' element={<ProtectedSecRoute><EditItemSalesSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/salesDetails/:id' element={<ProtectedSecRoute><VoucherDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/vanSaleDetails/:id' element={<ProtectedSecRoute><VoucherDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/shareSales/:id' element={<ProtectedSecRoute><ShareSalesSecondary/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/shareVanSale/:id' element={<ProtectedSecRoute><ShareVanSaleSecondary/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/shareSalesThreeInch/:id' element={<ProtectedSecRoute><ThreeInchSalesSec/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/shareVanSaleThreeInch/:id' element={<ProtectedSecRoute><ThreeInchVanSaleSec/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/sales/paymentSplitting' element={<ProtectedSecRoute><PaymentSplitting/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/editSale/:id/paymentSplitting' element={<ProtectedSecRoute><PaymentSplitting/></ProtectedSecRoute>}></Route> 
       
       
       {/* purchase */}
        <Route path='/sUsers/purchase' element={<ProtectedSecRoute><VoucherInitialPage/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/searchPartyPurchase' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/addItemPurchase' element={<ProtectedSecRoute><AddItemPurchase/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/billToPurchase/:id' element={<ProtectedSecRoute><BillToVoucher/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editItemPurchase/:id/:godownName/:index' element={<ProtectedSecRoute><EditItemPurchase/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/purchaseDetails/:id' element={<ProtectedSecRoute><VoucherDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/sharePurchase/:id' element={<ProtectedSecRoute><SharePurchaseSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/addBatchPurchase/:id' element={<ProtectedSecRoute><AddbatchInPurchase/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editPurchase/:id' element={<ProtectedSecRoute><VoucherInitialPageEdit/></ProtectedSecRoute>}></Route>
       
       
       
       
        <Route path='/sUsers/editsales/:id' element={<ProtectedSecRoute><VoucherInitialPageEdit/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editVanSale/:id' element={<ProtectedSecRoute><VoucherInitialPageEdit/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/billToSales/:id' element={<ProtectedSecRoute><BillToVoucher/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/billToSalesOrder/:id' element={<ProtectedSecRoute><BillToVoucher/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/vanSale' element={<ProtectedSecRoute><VoucherInitalPage/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/stockTransfer' element={<ProtectedSecRoute><VoucherInitalPage/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/searchGodown' element={<ProtectedSecRoute><SearchGodown/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/addItemStockTransfer' element={<ProtectedSecRoute><AddItemStockTransferSec/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/StockTransferDetails/:id' element={<ProtectedSecRoute><VoucherDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editItemstockTransfer/:id/:godownName/:index' element={<ProtectedSecRoute><EditItemStockTransfer/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editStockTransfer/:id' element={<ProtectedSecRoute><VoucherInitialPageEdit/></ProtectedSecRoute>}></Route>


        
        <Route path='/sUsers/selectVouchers' element={<ProtectedSecRoute><SelectVouchers/></ProtectedSecRoute>}></Route>


        {/* receipt */}
        <Route path='/sUsers/receipt' element={<ProtectedSecRoute><AccVoucherInitialPage/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/searchPartyReceipt' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/receipt/addAmount/:party_id' element={<ProtectedSecRoute><OutstandingListOfReceipt/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/receipt/sourceList/:source' element={<ProtectedSecRoute><SourceList/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/receipt/details/:id' element={<ProtectedSecRoute><ReceiptDetailsOfSale/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/receiptPrintOut' element={<ProtectedSecRoute><ReceiptPrintOut/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editReceipt/:id' element={<ProtectedSecRoute><EditReceipt/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/receipt/edit/addAmount/:party_id' element={<ProtectedSecRoute><OutstandingListOfReceiptForEdit/></ProtectedSecRoute>}></Route>


        {/* payment */}
        <Route path='/sUsers/paymentPurchase' element={<ProtectedSecRoute><PurchasePayment/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/searchPartyPurchasePayment' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/purchase/addAmount/:party_id' element={<ProtectedSecRoute><OutstandingListOfPayment/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/payment/sourceList/:source' element={<ProtectedSecRoute><SourceList/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/payment/details/:id' element={<ProtectedSecRoute><PaymtentDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/paymentPrintOut' element={<ProtectedSecRoute><PaymentPrintOut/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editPayment/:id' element={<ProtectedSecRoute><EditPayment/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/payment/edit/addAmount/:party_id' element={<ProtectedSecRoute><OutstandingListOfPaymentForEdit/></ProtectedSecRoute>}></Route>

{/* bank payment */}
         {/* creditNote */}
        <Route path='/sUsers/creditNote' element={<ProtectedSecRoute><VoucherInitalPage/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/searchPartyCreditNote' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/billToCreditNote/:id' element={<ProtectedSecRoute><BillToVoucher/></ProtectedSecRoute>}></Route>
 
        <Route path='/sUsers/creditNoteDetails/:id' element={<ProtectedSecRoute><VoucherDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editCreditNote/:id' element={<ProtectedSecRoute><VoucherInitialPageEdit/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/shareCreditNote/:id' element={<ProtectedSecRoute><ShareCreditNoteSecondary/></ProtectedSecRoute>}></Route> 

         {/* debitNote */}
        <Route path='/sUsers/debitNote' element={<ProtectedSecRoute><VoucherInitalPage/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/searchPartyDebitNote' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/billToDebitNote/:id' element={<ProtectedSecRoute><BillToVoucher/></ProtectedSecRoute>}></Route>

        <Route path='/sUsers/debitNoteDetails/:id' element={<ProtectedSecRoute><VoucherDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editDebitNote/:id' element={<ProtectedSecRoute><VoucherInitialPageEdit/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/shareDebitNote/:id' element={<ProtectedSecRoute><ShareDebitNoteSecondary/></ProtectedSecRoute>}></Route> 

        {/* inventory secondary */}
        {/* we are using the same page of primary to avoid page repetition */}
        <Route path='/sUsers/brand' element={<ProtectedSecRoute><AddBrand/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/category' element={<ProtectedSecRoute><AddCategory/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/subcategory' element={<ProtectedSecRoute><AddSubCategory/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/godown' element={<ProtectedSecRoute><AddGodown/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/pricelevel' element={<ProtectedSecRoute><AddPriceLevel/></ProtectedSecRoute>}></Route>


      {/* hsn */}
        {/* we are using the same page of primary to avoid page repetition */}
      <Route path='/sUsers/hsnList' element={<ProtectedSecRoute><HsnList/></ProtectedSecRoute>}></Route>
      <Route path='/sUsers/hsn' element={<ProtectedSecRoute><Hsn/></ProtectedSecRoute>}></Route>
      <Route path='/sUsers/editHsn/:id' element={<ProtectedSecRoute><EditHsn/></ProtectedSecRoute>}></Route>




        {/* report */}
        <Route path='/sUsers/reports' element={<ProtectedSecRoute><Reports/></ProtectedSecRoute>}></Route>

        {/* party statement  */}

        {/* we are using the same page of party list of sales to avoid page repetition */}
        <Route path='/sUsers/partyStatement/partyList' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/partyStatement' element={<ProtectedSecRoute><PartyStatement/></ProtectedSecRoute>}></Route>


        {/* sales summary */}
        <Route path='/sUsers/salesSummary' element={<ProtectedSecRoute><SalesSummary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/salesSummaryDetails' element={<ProtectedSecRoute><SalesSummaryTable/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/salesSummaryTransactions' element={<ProtectedSecRoute><SalesSummaryTransactions/></ProtectedSecRoute>}></Route>
        {/* order summary */}
        <Route path='/sUsers/orderSummary' element={<ProtectedSecRoute><OrderSummary/></ProtectedSecRoute>}></Route>

         {/* cash or bank */}
         <Route path='/sUsers/balancePage' element={<ProtectedSecRoute><BalancePage/></ProtectedSecRoute>}></Route>
         <Route path='/sUsers/balanceDetails/:accGroup' element={<ProtectedSecRoute><BalanceDetails/></ProtectedSecRoute>}></Route>
         <Route path='/sUsers/sourceTransactions/:id/:accGroup' element={<ProtectedSecRoute><SourceTransactions/></ProtectedSecRoute>}></Route>
         <Route path='/sUsers/addBank' element={<ProtectedSecRoute><BankingManagement/></ProtectedSecRoute>}></Route>
         <Route path='/sUsers/addBankOD' element={<ProtectedSecRoute><BankingManagement/></ProtectedSecRoute>}></Route>
         <Route path='/sUsers/editBankOD/:id' element={<ProtectedSecRoute><BankingManagement/></ProtectedSecRoute>}></Route>
         <Route path='/sUsers/editBank/:id' element={<ProtectedSecRoute><BankingManagement/></ProtectedSecRoute>}></Route>
         <Route path='/sUsers/addBankOD' element={<ProtectedSecRoute><BankingManagement/></ProtectedSecRoute>}></Route>

         <Route path='/sUsers/addCash' element={<ProtectedSecRoute><AddCash/></ProtectedSecRoute>}></Route>
         <Route path='/sUsers/editCash/:id' element={<ProtectedSecRoute><AddCash/></ProtectedSecRoute>}></Route>


        {/* filters */}
        <Route path='/sUsers/dateRange' element={<ProtectedSecRoute><DateRange/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/vouchersLIst' element={<ProtectedSecRoute><VouchersList/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/partyFilterList' element={<ProtectedSecRoute><PartyFilterList/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/statusFilterList' element={<ProtectedSecRoute><StatusFilterList/></ProtectedSecRoute>}></Route>



        {/* barcode scanning */}
        <Route path='/sUsers/sales/scanProduct' element={<ProtectedSecRoute><BarcodeScan/></ProtectedSecRoute>}></Route>


        {/* settings */}
        <Route path='/sUsers/settings' element={<ProtectedSecRoute><SettingsList/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/StockItem' element={<ProtectedSecRoute><StockItem/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/partySettings' element={<ProtectedSecRoute><PartySettings/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/dataEntrySettings' element={<ProtectedSecRoute><DateEntrySettings/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/OutstandingSettings' element={<ProtectedSecRoute><OutstandingSettings/></ProtectedSecRoute>}></Route>
        {/* stock item settings */}
        <Route path='/sUsers/StockItemSettings' element={<ProtectedSecRoute><StockItemSettings/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/barcodeList' element={<ProtectedSecRoute><BarcodeList/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/barcodeCreationDetails' element={<ProtectedSecRoute><BarcodeCreationDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/barcodePrintOn' element={<ProtectedSecRoute><BarcodePrintOn/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/barcodePrintOff' element={<ProtectedSecRoute><BarcodePrintOff/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/barcodeFormat' element={<ProtectedSecRoute><BarcodeFormat/></ProtectedSecRoute>}></Route>
        {/* date entry settings */}
        <Route path='/sUsers/VoucherSettings' element={<ProtectedSecRoute><VoucherSettings/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/OrderSettings' element={<ProtectedSecRoute><OrderSettings/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/InvoiceSettings' element={<ProtectedSecRoute><InvoiceSettings/></ProtectedSecRoute>}></Route>
        {/* voucher settings */}
        <Route path='/sUsers/emailSettings' element={<ProtectedSecRoute><EmailSettings/></ProtectedSecRoute>}></Route>
        {/* despatch title */}
        <Route path='/sUsers/order/customDespatchTitle' element={<ProtectedSecRoute><DespatchTitleSettings/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/invoice/customDespatchTitle' element={<ProtectedSecRoute><DespatchTitleSettings/></ProtectedSecRoute>}></Route>
        {/* terms and conditions */}
        <Route path='/sUsers/order/termsAndConditions' element={<ProtectedSecRoute><TermsAndConditionSettings/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/invoice/termsAndConditions' element={<ProtectedSecRoute><TermsAndConditionSettings/></ProtectedSecRoute>}></Route>

        {/* printConfiguration */}
        <Route path='/sUsers/printConfiguration' element={<ProtectedSecRoute><PrintConfiguration/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/saleOrderPrintConfiguration' element={<ProtectedSecRoute><SaleOrderPrintConfiguration/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/salePrintConfiguration' element={<ProtectedSecRoute><SalePrintConfiguration/></ProtectedSecRoute>}></Route>

      {/* order pending */}
      <Route path='/sUsers/orderPending/partyList' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route>
      <Route path='/sUsers/pendingOrders/:partyId' element={<ProtectedSecRoute><PendingOrders/></ProtectedSecRoute>}></Route>



      {/* company secondary user */}
      <Route path='/sUsers/company/list' element={<ProtectedSecRoute><OrganizationList/></ProtectedSecRoute>}></Route>
      <Route path='/sUsers/addOrganization' element={<ProtectedSecRoute><AddOrganisation/></ProtectedSecRoute>}></Route>
      <Route path='/sUsers/editOrg/:id' element={<ProtectedSecRoute><EditOrg/></ProtectedSecRoute>}></Route>


        {/* adding sec users */}
      <Route path='/sUsers/retailers' element={<ProtectedSecRoute><RetailersList/></ProtectedSecRoute>}></Route>
      <Route path='/sUsers/addSecUsers' element={<ProtectedSecRoute><AddSecUsers/></ProtectedSecRoute>}></Route>
      <Route path='/sUsers/editUser/:id' element={<ProtectedSecRoute><EditSecUsers/></ProtectedSecRoute>}></Route>
      <Route path='/sUsers/configureSecondaryUser/:id/:userId/:cmp_name' element={<ProtectedSecRoute><ConfigureSecondaryUser/></ProtectedSecRoute>}></Route>

      {/* outstanding  */}
      <Route path='/sUsers/outstandingSummary' element={<ProtectedSecRoute><OutstandingSummary/></ProtectedSecRoute>}></Route>
      <Route path='/sUsers/outstanding' element={<ProtectedSecRoute><Outstanding/></ProtectedSecRoute>}></Route>

      {/* sub groups */}
      <Route path='/sUsers/addSubGroup' element={<ProtectedSecRoute><AddSubGroup/></ProtectedSecRoute>}></Route>

      {/* party opening */}
      <Route path='/sUsers/addOpening' element={<ProtectedSecRoute><AddOpening/></ProtectedSecRoute>}></Route>



        {/* errorPage */}
        <Route path='/errorPage' element={<ErrorPage />} />
        <Route path='/serverError' element={<ServerError />} />
        <Route path='/sUsers/demo' element={<ProtectedSecRoute><Demo/></ProtectedSecRoute>}></Route>
    </Routes>
  )
}

export default Routers