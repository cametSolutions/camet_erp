
import {Route,Routes} from 'react-router-dom'
import SecHome from '../pages/secUsers/SecHome'
import Outstanding from '../pages/voucherReports/outstanding/Outstanding'
import OutstandingDetails from '../pages/voucherReports/outstanding/OutstandingDetails'
import PaymentSec from '../pages/secUsers/Payment'
import ProtectedSecRoute from './ProtectedSecRoute'
import Transaction from '../pages/voucherReports/DayBook/Transaction'
import EditOrg from '../pages/masters/organization/EditOrg'
import DashboardSec from '../pages/secUsers/dashboard/Dashboard'
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
import AddChargesListSecondary from '../pages/secUsers/settilngs/serviceLedger/AddChargesListSecondary'
import AdditionalChargesSecondary from '../pages/secUsers/settilngs/serviceLedger/AdditionalChargesSecondary'
import OrderConfigurationsSecondary from '../pages/secUsers/OrderConfigurationsSecondary'
// inventory 
// import SalesSecondary from '../pages/secUsers/SalesSecondary'
import SearchParty from '../pages/secUsers/SearchParty'
// Error Page
import ErrorPage from '../pages/errorPages/Notfound'
import Notfound from '../pages/errorPages/Notfound'
import ServerError from '../pages/errorPages/ServerError'
// import EditSale from '../pages/secUsers/EditSale'


import AddBrand from '../pages/masters/product/productSubDetails/AddBrand'
import AddCategory from '../pages/masters/product/productSubDetails/AddCategory'
import AddRestuarentCategory from '@/pages/masters/product/productSubDetails/AddRestuarentCategory'
import AddSubCategory from '../pages/masters/product/productSubDetails/AddSubCategory'
import AddGodown from '../pages/masters/product/productSubDetails/AddGodown'
import AddPriceLevel from '../pages/masters/product/productSubDetails/AddPriceLevel'
// import EditVanSale from '../pages/secUsers/EditVanSale'
import SearchGodown from '../pages/secUsers/SearchGodown'
import AddbatchInPurchase from '../pages/secUsers/AddbatchInPurchase'
import ReceiptPrintOut from '../pages/secUsers/ReceiptPrintOut'
import SelectVouchers from '../pages/secUsers/SelectVouchers'
// import Receipt from '../pages/secUsers/Receipt'
// import AddItemCreditNote from '../pages/secUsers/AddItemCreditNote'
// import EditItemCreditNote from '../pages/secUsers/EditItemCreditNote'
// import AddItemDebitNote from '../pages/secUsers/AddItemDebitNote'
// import EditItemDebitNote from '../pages/secUsers/EditItemDebitNote'
import PaymentPrintOut from '../pages/secUsers/PaymentPrintOut'
import OutstandingListOfReceiptForEdit from '../pages/secUsers/OutstandingListOfReceiptForEdit'
import OutstandingListOfPaymentForEdit from '../pages/secUsers/OutstandingListOfPaymentForEdit'
import Reports from '../pages/secUsers/Reports'
import PartyStatement from '../pages/voucherReports/PartyStatement/PartyStatement'
import DateRange from '../components/Filters/DateRange'
import VouchersList from '../components/common/Reports/VouchersList'
import SalesSummary from '../pages/secUsers/Reports/salesSummary/SalesSummary'
import SummaryReport from '@/pages/secUsers/Reports/SummaryReport'
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
import VoucherPdfInitiator from '@/pages/voucher/voucherPdf/VoucherPdfInitiator'
import VoucherPdfInitiatorThreeInch from '@/pages/voucher/voucherPdf/VoucherPdfInitiatorThreeInch'
import OutstandingListOfAccVoucher from '@/pages/accountingVoucher/voucherCreation/OutstandingListOfAccVoucher'
import AccVoucherDetails from '@/pages/accountingVoucher/voucherDetails/AccVoucherDetails'
import AccVoucherInitialPageEdit from '@/pages/accountingVoucher/voucherCreation/AccVoucherInitialPageEdit'
import StockRegister from '@/pages/voucherReports/stockRegister/StockRegister'
import StockRegisterDetails from '@/pages/voucherReports/stockRegister/StockRegisterDetails'
import VoucherSeriesSettings from '@/pages/secUsers/settilngs/dataEntry/voucherSettings/VoucherSeriesSettings'
import VoucherSeriesForm from '@/pages/secUsers/settilngs/dataEntry/voucherSettings/voucherSeries/VoucherSeriesForm'
import VoucherSeriesList from '@/pages/secUsers/settilngs/dataEntry/voucherSettings/voucherSeries/VoucherSeriesList'
import EditItemVoucher from '@/pages/voucher/voucherCreation/EditItemVoucher'
import WarrantyCard from '@/pages/voucher/voucherPdf/warrantyCard/WarrantyCard'
import HotelDashboard from '@/pages/Hotel/Pages/HotelDashboard'
import AddAdditionalPax from '@/pages/Hotel/Pages/AddAdditionalPax' 
import VisitOfPurpose from '@/pages/Hotel/Pages/VisitOfPurpose'
import IdProof from '@/pages/Hotel/Pages/IdProof'
import FoodPlan from '@/pages/Hotel/Pages/FoodPlan'
import RoomRegistration from '@/pages/Hotel/Pages/RoomRegistration'
import RoomList from '@/pages/Hotel/Pages/RoomList'
import EditRoom from '@/pages/Hotel/Pages/EditRoom'
import WarrantyCardList from '@/pages/secUsers/settilngs/dataEntry/invoiceSettings/WarrantyCard/WarrantyCardList'
import AddWarrantyCard from '@/pages/secUsers/settilngs/dataEntry/invoiceSettings/WarrantyCard/AddWarrantyCard'
import EditWarrantyCard from '@/pages/secUsers/settilngs/dataEntry/invoiceSettings/WarrantyCard/EditWarrantyCard '
import ConfigureRetailer from '@/pages/masters/secondaryUsers/RetailerConfiguration/ConfigureRetailer'
import AllocateCompany from '@/pages/masters/secondaryUsers/RetailerConfiguration/AllocateCompany'
import AllocatePriceLevel from '@/pages/masters/secondaryUsers/RetailerConfiguration/AllocatePriceLevel'
import AllocateGodown from '@/pages/masters/secondaryUsers/RetailerConfiguration/AllocateGodown'
import AllocationSeriesList from '@/pages/masters/secondaryUsers/RetailerConfiguration/AllocationSeriesList'
import AllocateVoucherSeries from '@/pages/masters/secondaryUsers/RetailerConfiguration/AllocateVoucherSeries'
import AllocateSubGroup from '@/pages/masters/secondaryUsers/RetailerConfiguration/AllocateSubGroup'
import RestuarentSettings from '@/pages/secUsers/settilngs/stockItem/stockItemSettings/RestuarentSettings'
import BookingPage from '@/pages/Hotel/Pages/BookingPage'
import CheckInPage from '@/pages/Hotel/Pages/CheckInPage'
import CheckOut from '@/pages/Hotel/Pages/CheckOut' 
import BookingList from '@/pages/Hotel/List/BookingList'
// import CheckInList from '@/pages/Hotel/List/CheckIn'
// import CheckOutList from '@/pages/Hotel/List/CheckOutList'
import RestaurantDashboard from '@/pages/Restuarant/Pages/RestaurantDashboard'
import LetterHeadUploadPage from '@/pages/secUsers/settilngs/PrintConfiguration/LetterHeadUploadPage'
import KotPage from '@/pages/Restuarant/Pages/KotPage'
import AddSubRestuarentCategory from '@/pages/masters/product/productSubDetails/AddsubRestuarentCategory'
// import ItemRegistration from '@/pages/Restuarant/Pages/ItemRegistration'
// import ItemList from '@/pages/Restuarant/Pages/ItemList'
import EditBooking from '@/pages/Hotel/Pages/EditBooking'
import EditChecking from '@/pages/Hotel/Pages/EditChecking'
import EditCheckOut from '@/pages/Hotel/Pages/EditCheckOut'
import ItemList from '@/pages/Restuarant/Pages/ItemList'
import EditItem from '@/pages/Restuarant/Pages/EditItem'
import ItemRegistration from '@/pages/Restuarant/Pages/ItemRegistration'
import TableMaster from '@/pages/Restuarant/Masters/TableMaster'
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
        <Route path='/sUsers/hotelDashBoard' element={<ProtectedSecRoute><HotelDashboard/></ProtectedSecRoute>}></Route>
         <Route path='/sUsers/RestaurantDashboard' element={<ProtectedSecRoute><RestaurantDashboard/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/invoice' element={<ProtectedSecRoute><VoucherInitalPage/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/searchPartysaleOrder' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/partyList' element={<ProtectedSecRoute><PartyListSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/addParty' element={<ProtectedSecRoute><AddPartySecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/productList' element={<ProtectedSecRoute><ProductListSecondary/></ProtectedSecRoute>}></Route>

        <Route path='/sUsers/editParty/:id' element={<ProtectedSecRoute><EditPartySecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/addProduct' element={<ProtectedSecRoute><AddProductSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editProduct/:id' element={<ProtectedSecRoute><EditProductSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/saleOrderDetails/:id' element={<ProtectedSecRoute><VoucherDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editSaleOrder/:id' element={<ProtectedSecRoute><VoucherInitialPageEdit/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/shareSaleOrder/:id' element={<ProtectedSecRoute><VoucherPdfInitiator/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/sharesaleOrderThreeInch/:id' element={<ProtectedSecRoute><VoucherPdfInitiatorThreeInch/></ProtectedSecRoute>}></Route> 

        <Route path='/sUsers/additionalChargesList' element={<ProtectedSecRoute><AddChargesListSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/additionalCharges' element={<ProtectedSecRoute><AdditionalChargesSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editAdditionalCharge/:id' element={<ProtectedSecRoute><AdditionalChargesSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/OrderConfigurations' element={<ProtectedSecRoute><OrderConfigurationsSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/Inventory' element={<ProtectedSecRoute><StockRegister/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/InventoryDetails' element={<ProtectedSecRoute><StockRegisterDetails/></ProtectedSecRoute>}></Route>

        <Route path='/sUsers/sales' element={<ProtectedSecRoute><VoucherInitialPage/></ProtectedSecRoute>}></Route>
         <Route path='/sUsers/searchPartySales' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route>
         <Route path='/sUsers/searchPartyvanSale' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/addItemSales' element={<ProtectedSecRoute><VoucherAddCount/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editItemVoucher/:id/:index' element={<ProtectedSecRoute><EditItemVoucher/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/salesDetails/:id' element={<ProtectedSecRoute><VoucherDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/vanSaleDetails/:id' element={<ProtectedSecRoute><VoucherDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/shareSales/:id' element={<ProtectedSecRoute><VoucherPdfInitiator/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/shareVanSale/:id' element={<ProtectedSecRoute><VoucherPdfInitiator/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/shareSalesThreeInch/:id' element={<ProtectedSecRoute><VoucherPdfInitiatorThreeInch/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/shareVanSaleThreeInch/:id' element={<ProtectedSecRoute><VoucherPdfInitiatorThreeInch/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/shareSalesWarrantyCard/:id' element={<ProtectedSecRoute><WarrantyCard/></ProtectedSecRoute>}></Route> 

        <Route path='/sUsers/sales/paymentSplitting' element={<ProtectedSecRoute><PaymentSplitting/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/editSale/:id/paymentSplitting' element={<ProtectedSecRoute><PaymentSplitting/></ProtectedSecRoute>}></Route> 
       
       
       {/* purchase */}
        <Route path='/sUsers/purchase' element={<ProtectedSecRoute><VoucherInitialPage/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/searchPartyPurchase' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/billToPurchase/:id' element={<ProtectedSecRoute><BillToVoucher/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/purchaseDetails/:id' element={<ProtectedSecRoute><VoucherDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/sharePurchase/:id' element={<ProtectedSecRoute><VoucherPdfInitiator/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/addBatchPurchase/:id' element={<ProtectedSecRoute><AddbatchInPurchase/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editPurchase/:id' element={<ProtectedSecRoute><VoucherInitialPageEdit/></ProtectedSecRoute>}></Route>
       
       
       
       
        <Route path='/sUsers/editsales/:id' element={<ProtectedSecRoute><VoucherInitialPageEdit/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editVanSale/:id' element={<ProtectedSecRoute><VoucherInitialPageEdit/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/billToSales/:id' element={<ProtectedSecRoute><BillToVoucher/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/billToSalesOrder/:id' element={<ProtectedSecRoute><BillToVoucher/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/vanSale' element={<ProtectedSecRoute><VoucherInitalPage/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/stockTransfer' element={<ProtectedSecRoute><VoucherInitalPage/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/searchGodown' element={<ProtectedSecRoute><SearchGodown/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/StockTransferDetails/:id' element={<ProtectedSecRoute><VoucherDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editStockTransfer/:id' element={<ProtectedSecRoute><VoucherInitialPageEdit/></ProtectedSecRoute>}></Route>


        
        <Route path='/sUsers/selectVouchers' element={<ProtectedSecRoute><SelectVouchers/></ProtectedSecRoute>}></Route>


        {/* receipt */}
        <Route path='/sUsers/receipt' element={<ProtectedSecRoute><AccVoucherInitialPage/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/searchPartyReceipt' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/receipt/addAmount/:party_id' element={<ProtectedSecRoute><OutstandingListOfAccVoucher/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/receipt/sourceList/:source' element={<ProtectedSecRoute><SourceList/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/receipt/details/:id' element={<ProtectedSecRoute><AccVoucherDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/receiptPrintOut' element={<ProtectedSecRoute><ReceiptPrintOut/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editReceipt/:id' element={<ProtectedSecRoute><AccVoucherInitialPageEdit/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/receipt/edit/addAmount/:party_id' element={<ProtectedSecRoute><OutstandingListOfReceiptForEdit/></ProtectedSecRoute>}></Route>


        {/* payment */}
        <Route path='/sUsers/paymentPurchase' element={<ProtectedSecRoute><AccVoucherInitialPage/></ProtectedSecRoute>}></Route>
            <Route path='/sUsers/searchPartyPayment' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route>

            <Route path='/sUsers/payment/addAmount/:party_id' element={<ProtectedSecRoute><OutstandingListOfAccVoucher/></ProtectedSecRoute>}></Route>

        <Route path='/sUsers/payment/sourceList/:source' element={<ProtectedSecRoute><SourceList/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/payment/details/:id' element={<ProtectedSecRoute><AccVoucherDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/paymentPrintOut' element={<ProtectedSecRoute><PaymentPrintOut/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editPayment/:id' element={<ProtectedSecRoute><AccVoucherInitialPageEdit/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/payment/edit/addAmount/:party_id' element={<ProtectedSecRoute><OutstandingListOfPaymentForEdit/></ProtectedSecRoute>}></Route>

{/* bank payment */}
         {/* creditNote */}
        <Route path='/sUsers/creditNote' element={<ProtectedSecRoute><VoucherInitalPage/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/searchPartyCreditNote' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/billToCreditNote/:id' element={<ProtectedSecRoute><BillToVoucher/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/creditNoteDetails/:id' element={<ProtectedSecRoute><VoucherDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editCreditNote/:id' element={<ProtectedSecRoute><VoucherInitialPageEdit/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/shareCreditNote/:id' element={<ProtectedSecRoute><VoucherPdfInitiator/></ProtectedSecRoute>}></Route> 

         {/* debitNote */}
        <Route path='/sUsers/debitNote' element={<ProtectedSecRoute><VoucherInitalPage/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/searchPartyDebitNote' element={<ProtectedSecRoute><SearchParty/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/billToDebitNote/:id' element={<ProtectedSecRoute><BillToVoucher/></ProtectedSecRoute>}></Route>

        <Route path='/sUsers/debitNoteDetails/:id' element={<ProtectedSecRoute><VoucherDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editDebitNote/:id' element={<ProtectedSecRoute><VoucherInitialPageEdit/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/shareDebitNote/:id' element={<ProtectedSecRoute><VoucherPdfInitiator/></ProtectedSecRoute>}></Route> 

        {/* inventory secondary */}
        {/* we are using the same page of primary to avoid page repetition */}
        <Route path='/sUsers/brand' element={<ProtectedSecRoute><AddBrand/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/category' element={<ProtectedSecRoute><AddCategory/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/AddRestuarentCategory' element={<ProtectedSecRoute><AddRestuarentCategory/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/subcategory' element={<ProtectedSecRoute><AddSubCategory/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/godown' element={<ProtectedSecRoute><AddGodown/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/pricelevel' element={<ProtectedSecRoute><AddPriceLevel/></ProtectedSecRoute>}></Route>
<Route path='/sUsers/AddSubRestuarentCategory' element={<ProtectedSecRoute><AddSubRestuarentCategory/></ProtectedSecRoute>}></Route>

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
  <Route path='/sUsers/summaryReport' element={<ProtectedSecRoute><SummaryReport/></ProtectedSecRoute>}></Route>
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
        <Route path='/sUsers/restuarentSettings' element={<ProtectedSecRoute><RestuarentSettings/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/StockItemSettings' element={<ProtectedSecRoute><StockItemSettings/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/barcodeList' element={<ProtectedSecRoute><BarcodeList/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/barcodeCreationDetails' element={<ProtectedSecRoute><BarcodeCreationDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/barcodePrintOn' element={<ProtectedSecRoute><BarcodePrintOn/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/barcodePrintOff' element={<ProtectedSecRoute><BarcodePrintOff/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/barcodeFormat' element={<ProtectedSecRoute><BarcodeFormat/></ProtectedSecRoute>}></Route>
        {/* date entry settings */}
        <Route path='/sUsers/VoucherSettings' element={<ProtectedSecRoute><VoucherSettings/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/VoucherSeriesSettings' element={<ProtectedSecRoute>< VoucherSeriesSettings/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/createVoucherSeries' element={<ProtectedSecRoute>< VoucherSeriesForm/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editVoucherSeries' element={<ProtectedSecRoute>< VoucherSeriesForm/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/voucherSeriesList' element={<ProtectedSecRoute><VoucherSeriesList/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/OrderSettings' element={<ProtectedSecRoute><OrderSettings/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/InvoiceSettings' element={<ProtectedSecRoute><InvoiceSettings/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/warrantyCardList' element={<ProtectedSecRoute><WarrantyCardList/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/addWarrantyCard' element={<ProtectedSecRoute><AddWarrantyCard/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editWarrantyCard' element={<ProtectedSecRoute><EditWarrantyCard/></ProtectedSecRoute>}></Route>
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
        <Route path='/sUsers/sale/upLoadLetterHead' element={<ProtectedSecRoute><LetterHeadUploadPage/></ProtectedSecRoute>}></Route>

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
      <Route path='/sUsers/configureUser/:userId' element={<ProtectedSecRoute><ConfigureRetailer/></ProtectedSecRoute>}></Route>
      <Route path='/sUsers/allocateCompany' element={<ProtectedSecRoute><AllocateCompany/></ProtectedSecRoute>}></Route>
      <Route path='/sUsers/allocatePriceLevel' element={<ProtectedSecRoute><AllocatePriceLevel/></ProtectedSecRoute>}></Route>
      <Route path='/sUsers/allocateGodown' element={<ProtectedSecRoute><AllocateGodown/></ProtectedSecRoute>}></Route>
      <Route path='/sUsers/allocateVanSaleGodown' element={<ProtectedSecRoute><AllocateGodown/></ProtectedSecRoute>}></Route>
      <Route path='/sUsers/allocateSeries' element={<ProtectedSecRoute><AllocationSeriesList/></ProtectedSecRoute>}></Route>
      <Route path='/sUsers/allocateSeries/:voucherType' element={<ProtectedSecRoute><AllocateVoucherSeries/></ProtectedSecRoute>}></Route>
      <Route path='/sUsers/allocateSubGroups' element={<ProtectedSecRoute><AllocateSubGroup/></ProtectedSecRoute>}></Route>


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


        {/* Hotel route */}
        <Route path='/sUsers/addAdditionalPax' element={<ProtectedSecRoute> <AddAdditionalPax /></ProtectedSecRoute>} />
        <Route path= '/sUsers/visitOfPurpose' element={<ProtectedSecRoute><VisitOfPurpose /></ProtectedSecRoute>} />
        <Route path= '/sUsers/idProof' element={<ProtectedSecRoute><IdProof /></ProtectedSecRoute>} />
        <Route path= '/sUsers/foodPlan' element={<ProtectedSecRoute><FoodPlan /></ProtectedSecRoute>} />
        <Route path= '/sUsers/roomRegistration' element={<ProtectedSecRoute><RoomRegistration /></ProtectedSecRoute>} />
        <Route path= '/sUsers/roomList' element={<ProtectedSecRoute><RoomList /></ProtectedSecRoute>} />
        <Route path= '/sUsers/editRoom' element={<ProtectedSecRoute><EditRoom /></ProtectedSecRoute>} />
        <Route path= '/sUsers/bookingPage' element={<ProtectedSecRoute><BookingPage /></ProtectedSecRoute>} />
        <Route path= '/sUsers/checkInPage' element={<ProtectedSecRoute><CheckInPage /></ProtectedSecRoute>} />
        <Route path= '/sUsers/checkOutPage' element={<ProtectedSecRoute><CheckOut /></ProtectedSecRoute>} />
        <Route path='/sUsers/BookingList' element={<ProtectedSecRoute><BookingList/></ProtectedSecRoute>}/>
        <Route path='/sUsers/checkInList' element={<ProtectedSecRoute><BookingList/></ProtectedSecRoute>}/>
        <Route path='/sUsers/CheckOutList' element={<ProtectedSecRoute><BookingList/></ProtectedSecRoute>}/>
        <Route path='/sUsers/EditBooking' element={<ProtectedSecRoute><EditBooking /></ProtectedSecRoute>} />
        <Route path='/sUsers/EditChecking' element={<ProtectedSecRoute><EditChecking /></ProtectedSecRoute>} />
        <Route path='/sUsers/EditCheckOut' element={<ProtectedSecRoute><EditCheckOut /></ProtectedSecRoute>} />
        <Route path='/sUsers/itemList'  element={<ProtectedSecRoute><ItemList /></ProtectedSecRoute>} />
        <Route path='/sUsers/KotPage' element={<ProtectedSecRoute><KotPage/></ProtectedSecRoute>}/>
        <Route path='/sUsers/editItem' element={<ProtectedSecRoute><EditItem /></ProtectedSecRoute>} />
<Route path='/sUsers/itemRegistration' element ={<ProtectedSecRoute><ItemRegistration /></ProtectedSecRoute>} />
<Route path='/sUsers/TableMaster' element={<ProtectedSecRoute><TableMaster /></ProtectedSecRoute>} />
    </Routes>
  )
}

export default Routers