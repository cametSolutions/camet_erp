import { Route, Routes } from "react-router-dom"
// import Register from '../pages/primaryUsers/Register'
// import Login from '../pages/primaryUsers/Login'
// import Home from '../pages/primaryUsers/Home'
// import OrganizationList from '../components/homePage/OrganisationList'
// import AdminLogin from '../pages/admin/AdminLogin'
// import AdminHome from '../pages/admin/AdminHome'
// import SecLogin from '../pages/secUsers/SecLogin'
import SaleSummaryTable from "../pages/secUsers/Reports/salesSummary/saleSummaryTable"
import SecHome from "../pages/secUsers/SecHome"
import Outstanding from "../pages/secUsers/Outstanding"
import OutstandingDetails from "../pages/secUsers/OutstandingDetails"
import PrOutstandingDetails from "../pages/primaryUsers/PrOutstandingDetails "
import PaymentSec from "../pages/secUsers/Payment"
import PaymentPri from "../pages/primaryUsers/Payment"
import ProtectedSecRoute from "./ProtectedSecRoute"
import Transaction from "../pages/secUsers/Transaction"
import PriTransaction from "../pages/primaryUsers/Transaction"
import AddOrganisation from "../pages/primaryUsers/AddOrganisation"
import OrganizationList from "../../src/pages/primaryUsers/OrganisationList"
import AddSecUsers from "../pages/primaryUsers/AddSecUsers"
import SecUsersList from "../pages/primaryUsers/SecUsersList"
import ProtectedPriRoute from "./ProtectedPriRoute"
// import ProtectedAdmin from './ProtectedAdmin'
import BankList from "../pages/primaryUsers/BankList"
// import ForgotPasswordPrimary from '../pages/primaryUsers/ForgotPasswordPrimary'
// import Otp from '../pages/primaryUsers/Otp'
// import ResetPassword from '../pages/primaryUsers/ResetPassword'
// import ForgotPasswordSec from '../pages/secUsers/ForgotPasswordSec'
// import OtpSec from '../pages/secUsers/OtpSec'
// import ResetPasswordSec from '../pages/secUsers/ResetPasswordSec'
import ReceiptDetails from "../pages/primaryUsers/ReceiptDetails"
// import SecReceptionDetails from '../pages/secUsers/ReceiptDetails'
import Dashboard from "../pages/primaryUsers/Dashboard"
import EditOrg from "../pages/primaryUsers/EditOrg"
import DashboardSec from "../pages/secUsers/Dashboard"
import AddParty from "../pages/primaryUsers/AddParty"
import Hsn from "../pages/primaryUsers/Hsn"
import AddProduct from "../pages/primaryUsers/AddProduct"
import ProductList from "../pages/primaryUsers/ProductList"
import EditProduct from "../pages/primaryUsers/EditProduct"
import PartyList from "../pages/primaryUsers/PartyList"
import EditParty from "../pages/primaryUsers/EditParty"

import Demo from "../pages/secUsers/Demo"
import RetailersList from "../pages/primaryUsers/RetailersList"
import HsnList from "../pages/primaryUsers/HsnList"
import EditHsn from "../pages/primaryUsers/EditHsn"
import InvoiceSecondary from "../pages/secUsers/InvoiceSecondary"
import SearchPartySecondary from "../pages/secUsers/SearchPartySecondary"
import PartyListSecondary from "../pages/secUsers/PartyListSecondary"
import AddPartySecondary from "../pages/secUsers/AddPartySecondary"
import ProductListSecondary from "../pages/secUsers/ProductListSecondary"
import AddItemSecondary from "../pages/secUsers/AddItemSecondary"
import EditItemSecondary from "../pages/secUsers/EditItemSecondary"
import EditPartySecondary from "../pages/secUsers/EditPartySecondary"
import AddProductSecondary from "../pages/secUsers/AddProductSecondary"
import EditProductSecondary from "../pages/secUsers/EditProductSecondary"
import AddBank from "../pages/primaryUsers/AddBank"
// import EditBank from '../pages/primaryUsers/EditBank'
import EditSecUsers from "../pages/primaryUsers/EditSecUsers"
import InvoiceDetails from "../pages/primaryUsers/InvoiceDetails"
import ShareInvoice from "../pages/primaryUsers/ShareInvoice"
import InvoiceDetailsSecondary from "../pages/secUsers/InvoiceDetailsSecondary"
import EditInvoiceSecondary from "../pages/secUsers/EditInvoiceSecondary"
import ShareInvoiceSecondary from "../pages/secUsers/ShareInvoiceSecondary"
import AdditionalCharges from "../pages/primaryUsers/AdditionalCharges"
import AddChargesList from "../pages/primaryUsers/AddChargesList"
import EditAdditionalCharges from "../pages/primaryUsers/EditAdditionalCharges"

import OrderConfigurations from "../pages/primaryUsers/OrderConfigurations"
import AddChargesListSecondary from "../pages/secUsers/AddChargesListSecondary"
import AdditionalChargesSecondary from "../pages/secUsers/AdditionalChargesSecondary"
import EditAdditionalChargesSecondary from "../pages/secUsers/EditAdditionalChargesSecondary"
import OrderConfigurationsSecondary from "../pages/secUsers/OrderConfigurationsSecondary"

// inventory
import InventoryPrimaryUser from "../pages/primaryUsers/InventoryPrimaryUser"
import InventorySecondaryUser from "../pages/secUsers/InventorySecondaryUser"
// import SelectDefaultModal from '../../constants/components/SelectDefaultModal'
import SalesDetails from "../pages/primaryUsers/SalesDetails"
import ShareSales from "../pages/primaryUsers/ShareSales"
import SalesSecondary from "../pages/secUsers/SalesSecondary"
import SearchPartySalesSecondary from "../pages/secUsers/SearchPartySalesSecondary"
import AddItemSalesSecondary from "../pages/secUsers/AddItemSalesSecondary"
import SalesDetailsSecondary from "../pages/secUsers/SalesDetailsSecondary"
import EditItemSalesSecondary from "../pages/secUsers/EditItemSalesSecondary"
import ShareSalesSecondary from "../pages/secUsers/ShareSalesSecondary"
import ConfigureSecondaryUser from "../pages/primaryUsers/ConfigureSecondaryUser"

// Error Page
import ErrorPage from "../pages/errorPages/Notfound"
import Notfound from "../pages/errorPages/Notfound"
import ServerError from "../pages/errorPages/ServerError"
import ThreeInchSales from "../pages/primaryUsers/ThreeInchSales"
import ThreeInchSalesSec from "../pages/secUsers/ThreeInchSalesSec"
import Contacts from "../pages/secUsers/Contacts"
import Purchase from "../pages/secUsers/Purchase"
import SearchPartyPurchase from "../pages/secUsers/SearchPartyPurchase"
import AddItemPurchase from "../pages/secUsers/AddItemPurchase"
import EditItemPurchase from "../pages/secUsers/EditItemPurchase"
import PurchaseDetailsSecondary from "../pages/secUsers/PurchaseDetailsSecondary"
import SharePurchaseSecondary from "../pages/secUsers/SharePurchaseSecondary"
import PurchaseDetailsPrimary from "../pages/primaryUsers/PurchaseDetailsPrimary"
import SharePurchasePrimary from "../pages/primaryUsers/SharePurchasePrimary"
import EditSale from "../pages/secUsers/EditSale"
import ThreeInchInvoiceSec from "../pages/secUsers/ThreeInchInvoiceSec"
import ThreeInchInvoice from "../pages/primaryUsers/ThreeInchInvoice"
import BillToSales from "../pages/secUsers/BillToSales"
import BillToSalesOrder from "../pages/secUsers/BillToSalesOrder"
import AddBrand from "../pages/primaryUsers/AddBrand"
import AddCategory from "../pages/primaryUsers/AddCategory"
import AddSubCategory from "../pages/primaryUsers/AddSubCategory"
import AddGodown from "../pages/primaryUsers/AddGodown"
import AddPriceLevel from "../pages/primaryUsers/AddPriceLevel"
import VanSaleSecondary from "../pages/secUsers/VanSaleSecondary"
import AddItemVanSaleSecondary from "../pages/secUsers/AddItemVanSaleSecondary"
import VanSaleDetailsSecondary from "../pages/secUsers/VanSaleDetailsSecondary "
import ShareVanSaleSecondary from "../pages/secUsers/ShareVanSaleSecondary"
import ThreeInchVanSaleSec from "../pages/secUsers/ThreeInchVanSaleSec"
import VanSaleDetails from "../pages/primaryUsers/VanSaleDetails "
import ShareVanSale from "../pages/primaryUsers/ShareVanSale"
import ThreeInchVanSale from "../pages/primaryUsers/ThreeInchVanSale "
import EditVanSale from "../pages/secUsers/EditVanSale"
import StockTransferSecondary from "../pages/secUsers/StockTransferSecondary"
import SearchGodown from "../pages/secUsers/SearchGodown"
import AddItemStockTransferSec from "../pages/secUsers/AddItemStockTransferSec"
import StockTransferDetailsSecondary from "../pages/secUsers/StockTransferDetailsSecondary"
import EditStockTransferSecondary from "../pages/secUsers/EditStockTransferSecondary"
import StockTransferDetailsPrimary from "../pages/primaryUsers/StockTransferDetailsPrimary"
import BillToPurchase from "../pages/secUsers/BillToPurchase"
import EditItemStockTransfer from "../pages/secUsers/EditItemStockTransfer"
import AddbatchInPurchase from "../pages/secUsers/AddbatchInPurchase"
import ReceiptPrintOut from "../pages/secUsers/ReceiptPrintOut"
import ReceiptPrintOutPrimary from "../pages/primaryUsers/ReceiptPrintOut"
import EditPurchase from "../pages/secUsers/EditPurchase"
import SelectVouchers from "../pages/secUsers/SelectVouchers"
import Receipt from "../pages/secUsers/Receipt"
import SearchPartyReciept from "../pages/secUsers/SearchPartyReciept"
import OutstandingListOfReceipt from "../pages/secUsers/OutstandingListOfReceipt"
import PurchasePayment from "../pages/secUsers/PurchasePayment"
import SearchPartyPayment from "../pages/secUsers/SearchPartyPayment"
import CreditNote from "../pages/secUsers/CreditNote"
import SearchPartyCreditNote from "../pages/secUsers/SearchPartyCreditNote"
import BillToCreditNote from "../pages/secUsers/BillToCreditNote"
import AddItemCreditNote from "../pages/secUsers/AddItemCreditNote"
import EditItemCreditNote from "../pages/secUsers/EditItemCreditNote"
import CreditNoteDetailsSecondary from "../pages/secUsers/CreditNoteDetailsSecondary"
import EditCreditNote from "../pages/secUsers/EditCreditNote"
import ShareCreditNoteSecondary from "../pages/secUsers/ShareCreditNoteSecondary"
import CreditNoteDetailsPrimary from "../pages/primaryUsers/CreditNoteDetailsPrimary"
import ShareCreditNotePrimary from "../pages/primaryUsers/ShareCreditNotePrimary"
import DebitNote from "../pages/secUsers/DebitNote"
import SearchPartyDebitNote from "../pages/secUsers/SearchPartyDebitNote"
import BillToDebitNote from "../pages/secUsers/BillToDebitNote"
import AddItemDebitNote from "../pages/secUsers/AddItemDebitNote"
import EditItemDebitNote from "../pages/secUsers/EditItemDebitNote"
import DebitNoteDetailsSecondary from "../pages/secUsers/DebitNoteDetailsSecondary"
import EditDebitNote from "../pages/secUsers/EditDebitNote"
import ShareDebitNoteSecondary from "../pages/secUsers/ShareDebitNoteSecondary"
import DebitNoteDetailsPrimary from "../pages/primaryUsers/DebitNoteDetailsPrimary"
import ShareDebitNotePrimary from "../pages/primaryUsers/ShareDebitNotePrimary"
import OutstandingListOfPayment from "../pages/secUsers/OutstandingListOfPayment"
import ReceiptDetailsOfSale from "../pages/secUsers/ReceiptDetails"
import PaymtentDetails from "../pages/secUsers/PaymtentDetails"
import PaymentPrintOut from "../pages/secUsers/PaymentPrintOut"
import PaymtentDetailsPrimary from "../pages/primaryUsers/PaymtentDetailsPrimary"
import ReceiptDetailsPrimary from "../pages/primaryUsers/ReceiptDetailsPrimary"
import EditReceipt from "../pages/secUsers/EditReceipt"
import OutstandingListOfReceiptForEdit from "../pages/secUsers/OutstandingListOfReceiptForEdit"
import EditPayment from "../pages/secUsers/EditPayment"
import OutstandingListOfPaymentForEdit from "../pages/secUsers/OutstandingListOfPaymentForEdit"
import Reports from "../pages/secUsers/Reports"
import PartyStatement from "../pages/secUsers/Reports/PartyStatement/PartyStatement"
import DateRange from "../components/Filters/DateRange"
import VouchersList from "../components/common/Reports/VouchersList"
import SalesSummary from "../pages/secUsers/Reports/salesSummary/SalesSummary"
import PartyFilterList from "../components/Filters/party/PartyFilterList"
import StatusFilterList from "../components/Filters/status/StatusFilterList"
import OrderSummary from "../pages/secUsers/Reports/orderSummary/OrderSummary"
import PaymentSplitting from "../components/secUsers/main/paymentSplitting/PaymentSplitting"
import BalancePage from "../pages/secUsers/Reports/CashOrBank/BalancePage"
import BalanceDetails from "../pages/secUsers/Reports/CashOrBank/BalanceDetails"
import SourceList from "../pages/secUsers/SourceList"
import SourceTransactions from "../pages/secUsers/Reports/CashOrBank/SourceTransactions"
import AddCash from "../pages/primaryUsers/AddCash"
import SettingsList from "../pages/secUsers/settilngs/SettingsList"
import StockItem from "../pages/secUsers/settilngs/stockItem/StockItem"
import PartySettings from "../pages/secUsers/settilngs/PartySettings"
import DateEntrySettings from "../pages/secUsers/settilngs/DateEntrySettings"
import OutstandingSettings from "../pages/secUsers/settilngs/OutstandingSettings"
import StockItemSettings from "../pages/secUsers/settilngs/stockItem/stockItemSettings/StockItemSettings"
import VoucherSettings from "../pages/secUsers/settilngs/dataEntry/VoucherSettings"
import OrderSettings from "../pages/secUsers/settilngs/dataEntry/OrderSettings"
import InvoiceSettings from "../pages/secUsers/settilngs/dataEntry/InvoiceSettings"
import EmailSettings from "../pages/secUsers/settilngs/dataEntry/voucherSettings/EmailSettings"
import BarcodeList from "../pages/secUsers/settilngs/stockItem/stockItemSettings/barcode/BarcodeList"
import BarcodeCreationDetails from "../pages/secUsers/settilngs/stockItem/stockItemSettings/barcode/BarcodeCreationDetails"
import BarcodePrintOn from "../pages/secUsers/settilngs/stockItem/stockItemSettings/barcode/BarcodePrintOn"
import BarcodePrintOff from "../pages/secUsers/settilngs/stockItem/stockItemSettings/barcode/BarcodePrintOff"
import BarcodeFormat from "../pages/secUsers/settilngs/stockItem/stockItemSettings/barcode/BarcodeFormat"
import PrintConfiguration from "../pages/secUsers/settilngs/PrintConfiguration/PrintConfiguration"
import SaleOrderPrintConfiguration from "../pages/secUsers/settilngs/PrintConfiguration/SaleOrderPrintConfiguration"
import SalePrintConfiguration from "../pages/secUsers/settilngs/PrintConfiguration/SalePrintConfiguration"
import DespatchTitleSettings from "../pages/secUsers/settilngs/dataEntry/invoiceAndOrderCommon/DespatchTitleSettings"
import TermsAndConditionSettings from "../pages/secUsers/settilngs/dataEntry/invoiceAndOrderCommon/TermsAndConditionSettings"
import BarcodeScan from "../components/secUsers/barcodeScanning/BarcodeScan"
import PendingOrders from "../pages/secUsers/orderPendings/PendingOrders"

const Routers = () => {
  return (
    <Routes>
      <Route path="*" element={<Notfound />}></Route>

      <Route
        path="/pUsers/addOrganization"
        element={
          <ProtectedPriRoute>
            <AddOrganisation />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/editOrg/:id"
        element={
          <ProtectedPriRoute>
            <EditOrg />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/organizationList"
        element={
          <ProtectedPriRoute>
            <OrganizationList />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/addSecUsers"
        element={
          <ProtectedPriRoute>
            <AddSecUsers />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/secUsersList"
        element={
          <ProtectedPriRoute>
            <SecUsersList />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/retailers"
        element={
          <ProtectedPriRoute>
            <RetailersList />
          </ProtectedPriRoute>
        }
      ></Route>

      <Route
        path="/pUsers/payment"
        element={
          <ProtectedPriRoute>
            <PaymentPri />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/outstandingDetails/:party_id/:cmp_id/:total"
        element={
          <ProtectedPriRoute>
            <PrOutstandingDetails />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/transaction"
        element={
          <ProtectedPriRoute>
            <PriTransaction />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/receiptDetails/:id"
        element={
          <ProtectedPriRoute>
            <ReceiptDetails />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/bankLIst"
        element={
          <ProtectedPriRoute>
            <BankList />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/addBank"
        element={
          <ProtectedPriRoute>
            <AddBank />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/dashboard"
        element={
          <ProtectedPriRoute>
            <Dashboard />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/addParty"
        element={
          <ProtectedPriRoute>
            <AddParty />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/hsn"
        element={
          <ProtectedPriRoute>
            <Hsn />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/addProduct"
        element={
          <ProtectedPriRoute>
            <AddProduct />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/productList"
        element={
          <ProtectedPriRoute>
            <ProductList />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/editProduct/:id"
        element={
          <ProtectedPriRoute>
            <EditProduct />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/partyList"
        element={
          <ProtectedPriRoute>
            <PartyList />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/editParty/:id"
        element={
          <ProtectedPriRoute>
            <EditParty />
          </ProtectedPriRoute>
        }
      ></Route>

      <Route
        path="/pUsers/demo"
        element={
          <ProtectedPriRoute>
            <Demo />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/hsnList"
        element={
          <ProtectedPriRoute>
            <HsnList />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/editHsn/:id"
        element={
          <ProtectedPriRoute>
            <EditHsn />
          </ProtectedPriRoute>
        }
      ></Route>
      {/* <Route path='/pUsers/editBank/:id' element={<ProtectedPriRoute><EditBank/></ProtectedPriRoute>}></Route>s */}
      <Route
        path="/pUsers/editUser/:id"
        element={
          <ProtectedPriRoute>
            <EditSecUsers />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/InvoiceDetails/:id"
        element={
          <ProtectedPriRoute>
            <InvoiceDetails />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/shareInvoice/:id"
        element={
          <ProtectedPriRoute>
            <ShareInvoice />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/additionalCharges"
        element={
          <ProtectedPriRoute>
            <AdditionalCharges />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/additionalChargesList"
        element={
          <ProtectedPriRoute>
            <AddChargesList />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/editAdditionalCharge/:id"
        element={
          <ProtectedPriRoute>
            <EditAdditionalCharges />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/OrderConfigurations"
        element={
          <ProtectedPriRoute>
            <OrderConfigurations />
          </ProtectedPriRoute>
        }
      ></Route>

      {/* <Route path='/pUsers/modal' element={<ProtectedPriRoute><SelectDefaultModal/></ProtectedPriRoute>}></Route> */}
      <Route
        path="/pUsers/salesDetails/:id"
        element={
          <ProtectedPriRoute>
            <SalesDetails />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/vanSaleDetails/:id"
        element={
          <ProtectedPriRoute>
            <VanSaleDetails />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/shareSalesThreeInch/:id"
        element={
          <ProtectedPriRoute>
            <ThreeInchSales />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/shareVanSaleThreeInch/:id"
        element={
          <ProtectedPriRoute>
            <ThreeInchVanSale />
          </ProtectedPriRoute>
        }
      ></Route>

      <Route
        path="/pUsers/shareSales/:id"
        element={
          <ProtectedPriRoute>
            <ShareSales />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/shareVanSale/:id"
        element={
          <ProtectedPriRoute>
            <ShareVanSale />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/configureSecondaryUser/:id/:userId/:cmp_name"
        element={
          <ProtectedPriRoute>
            <ConfigureSecondaryUser />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/Inventory"
        element={
          <ProtectedPriRoute>
            <InventoryPrimaryUser />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/purchaseDetails/:id"
        element={
          <ProtectedPriRoute>
            <PurchaseDetailsPrimary />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/sharePurchase/:id"
        element={
          <ProtectedPriRoute>
            <SharePurchasePrimary />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/shareInvoiceThreeInch/:id"
        element={
          <ProtectedPriRoute>
            <ThreeInchInvoice />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/brand"
        element={
          <ProtectedPriRoute>
            <AddBrand />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/category"
        element={
          <ProtectedPriRoute>
            <AddCategory />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/subcategory"
        element={
          <ProtectedPriRoute>
            <AddSubCategory />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/godown"
        element={
          <ProtectedPriRoute>
            <AddGodown />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/pricelevel"
        element={
          <ProtectedPriRoute>
            <AddPriceLevel />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/stockTransferDetails/:id"
        element={
          <ProtectedPriRoute>
            <StockTransferDetailsPrimary />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/ReceiptPrint"
        element={
          <ProtectedPriRoute>
            <ReceiptPrintOutPrimary />
          </ProtectedPriRoute>
        }
      ></Route>

      {/* creditNote */}
      <Route
        path="/pUsers/creditDetails/:id"
        element={
          <ProtectedPriRoute>
            <CreditNoteDetailsPrimary />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/shareCreditNote/:id"
        element={
          <ProtectedPriRoute>
            <ShareCreditNotePrimary />
          </ProtectedPriRoute>
        }
      ></Route>
      {/* debitNote */}
      <Route
        path="/pUsers/debitDetails/:id"
        element={
          <ProtectedPriRoute>
            <DebitNoteDetailsPrimary />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/shareDebitNote/:id"
        element={
          <ProtectedPriRoute>
            <ShareDebitNotePrimary />
          </ProtectedPriRoute>
        }
      ></Route>
      {/* payment */}
      <Route
        path="/pUsers/payment/details/:id"
        element={
          <ProtectedPriRoute>
            <PaymtentDetailsPrimary />
          </ProtectedPriRoute>
        }
      ></Route>
      <Route
        path="/pUsers/paymentPrintOut"
        element={
          <ProtectedPriRoute>
            <PaymentPrintOut />
          </ProtectedPriRoute>
        }
      ></Route>
      {/* receipt */}
      <Route
        path="/pUsers/receipt/details/:id"
        element={
          <ProtectedSecRoute>
            <ReceiptDetailsPrimary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/pUsers/receiptPrintOut"
        element={
          <ProtectedSecRoute>
            <ReceiptPrintOut />
          </ProtectedSecRoute>
        }
      ></Route>

      <Route
        path="/sUsers/home"
        element={
          <ProtectedSecRoute>
            <SecHome />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/outstanding"
        element={
          <ProtectedSecRoute>
            <Outstanding />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/outstandingDetails/:party_id/:cmp_id/:total"
        element={
          <ProtectedSecRoute>
            <OutstandingDetails />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/payment"
        element={
          <ProtectedSecRoute>
            <PaymentSec />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/transaction"
        element={
          <ProtectedSecRoute>
            <Transaction />
          </ProtectedSecRoute>
        }
      ></Route>
      {/* <Route path='/sUsers/receiptDetails/:id' element={<ProtectedSecRoute><SecReceptionDetails/></ProtectedSecRoute>}></Route> */}
      <Route
        path="/sUsers/dashboard"
        element={
          <ProtectedSecRoute>
            <DashboardSec />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/invoice"
        element={
          <ProtectedSecRoute>
            <InvoiceSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/searchParty"
        element={
          <ProtectedSecRoute>
            <SearchPartySecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/partyList"
        element={
          <ProtectedSecRoute>
            <PartyListSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/addParty"
        element={
          <ProtectedSecRoute>
            <AddPartySecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/productList"
        element={
          <ProtectedSecRoute>
            <ProductListSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/addItem"
        element={
          <ProtectedSecRoute>
            <AddItemSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editItem/:id"
        element={
          <ProtectedSecRoute>
            <EditItemSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editParty/:id"
        element={
          <ProtectedSecRoute>
            <EditPartySecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/addProduct"
        element={
          <ProtectedSecRoute>
            <AddProductSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editProduct/:id"
        element={
          <ProtectedSecRoute>
            <EditProductSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/InvoiceDetails/:id"
        element={
          <ProtectedSecRoute>
            <InvoiceDetailsSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editInvoice/:id"
        element={
          <ProtectedSecRoute>
            <EditInvoiceSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/shareInvoice/:id"
        element={
          <ProtectedSecRoute>
            <ShareInvoiceSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/shareInvoiceThreeInch/:id"
        element={
          <ProtectedSecRoute>
            <ThreeInchInvoiceSec />
          </ProtectedSecRoute>
        }
      ></Route>

      <Route
        path="/sUsers/additionalChargesList"
        element={
          <ProtectedSecRoute>
            <AddChargesListSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/additionalCharges"
        element={
          <ProtectedSecRoute>
            <AdditionalChargesSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editAdditionalCharge/:id"
        element={
          <ProtectedSecRoute>
            <EditAdditionalChargesSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/OrderConfigurations"
        element={
          <ProtectedSecRoute>
            <OrderConfigurationsSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/Inventory"
        element={
          <ProtectedSecRoute>
            <InventorySecondaryUser />
          </ProtectedSecRoute>
        }
      ></Route>

      <Route
        path="/sUsers/sales"
        element={
          <ProtectedSecRoute>
            <SalesSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/summaryReport"
        element={
          <ProtectedSecRoute>
            <SaleSummaryTable />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/searchPartySales"
        element={
          <ProtectedSecRoute>
            <SearchPartySalesSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/addItemSales"
        element={
          <ProtectedSecRoute>
            <AddItemSalesSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editItemSales/:id/:godownName/:index"
        element={
          <ProtectedSecRoute>
            <EditItemSalesSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/salesDetails/:id"
        element={
          <ProtectedSecRoute>
            <SalesDetailsSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/vanSaleDetails/:id"
        element={
          <ProtectedSecRoute>
            <VanSaleDetailsSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/shareSales/:id"
        element={
          <ProtectedSecRoute>
            <ShareSalesSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/shareVanSale/:id"
        element={
          <ProtectedSecRoute>
            <ShareVanSaleSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/shareSalesThreeInch/:id"
        element={
          <ProtectedSecRoute>
            <ThreeInchSalesSec />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/shareVanSaleThreeInch/:id"
        element={
          <ProtectedSecRoute>
            <ThreeInchVanSaleSec />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/contacts"
        element={
          <ProtectedSecRoute>
            <Contacts />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/sales/paymentSplitting"
        element={
          <ProtectedSecRoute>
            <PaymentSplitting />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editSale/:id/paymentSplitting"
        element={
          <ProtectedSecRoute>
            <PaymentSplitting />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* purchase */}
      <Route
        path="/sUsers/purchase"
        element={
          <ProtectedSecRoute>
            <Purchase />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/searchPartyPurchase"
        element={
          <ProtectedSecRoute>
            <SearchPartyPurchase />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/addItemPurchase"
        element={
          <ProtectedSecRoute>
            <AddItemPurchase />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/billToPurchase/:id"
        element={
          <ProtectedSecRoute>
            <BillToPurchase />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editItemPurchase/:id/:godownName/:index"
        element={
          <ProtectedSecRoute>
            <EditItemPurchase />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/purchaseDetails/:id"
        element={
          <ProtectedSecRoute>
            <PurchaseDetailsSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/sharePurchase/:id"
        element={
          <ProtectedSecRoute>
            <SharePurchaseSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/addBatchPurchase/:id"
        element={
          <ProtectedSecRoute>
            <AddbatchInPurchase />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editPurchase/:id"
        element={
          <ProtectedSecRoute>
            <EditPurchase />
          </ProtectedSecRoute>
        }
      ></Route>

      <Route
        path="/sUsers/editSale/:id"
        element={
          <ProtectedSecRoute>
            <EditSale />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editVanSale/:id"
        element={
          <ProtectedSecRoute>
            <EditVanSale />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/billToSales/:id"
        element={
          <ProtectedSecRoute>
            <BillToSales />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/billToSalesOrder/:id"
        element={
          <ProtectedSecRoute>
            <BillToSalesOrder />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/vanSale"
        element={
          <ProtectedSecRoute>
            <VanSaleSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/addItemVanSale"
        element={
          <ProtectedSecRoute>
            <AddItemVanSaleSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/stockTransfer"
        element={
          <ProtectedSecRoute>
            <StockTransferSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/searchGodown"
        element={
          <ProtectedSecRoute>
            <SearchGodown />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/addItemStockTransfer"
        element={
          <ProtectedSecRoute>
            <AddItemStockTransferSec />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/StockTransferDetails/:id"
        element={
          <ProtectedSecRoute>
            <StockTransferDetailsSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editItemstockTransfer/:id/:godownName/:index"
        element={
          <ProtectedSecRoute>
            <EditItemStockTransfer />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editStockTransfer/:id"
        element={
          <ProtectedSecRoute>
            <EditStockTransferSecondary />
          </ProtectedSecRoute>
        }
      ></Route>

      <Route
        path="/sUsers/selectVouchers"
        element={
          <ProtectedSecRoute>
            <SelectVouchers />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* receipt */}
      <Route
        path="/sUsers/receipt"
        element={
          <ProtectedSecRoute>
            <Receipt />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/searchPartyReceipt"
        element={
          <ProtectedSecRoute>
            <SearchPartyReciept />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/receipt/addAmount/:party_id"
        element={
          <ProtectedSecRoute>
            <OutstandingListOfReceipt />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/receipt/sourceList/:source"
        element={
          <ProtectedSecRoute>
            <SourceList />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/receipt/details/:id"
        element={
          <ProtectedSecRoute>
            <ReceiptDetailsOfSale />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/receiptPrintOut"
        element={
          <ProtectedSecRoute>
            <ReceiptPrintOut />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editReceipt/:id"
        element={
          <ProtectedSecRoute>
            <EditReceipt />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/receipt/edit/addAmount/:party_id"
        element={
          <ProtectedSecRoute>
            <OutstandingListOfReceiptForEdit />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* payment */}
      <Route
        path="/sUsers/paymentPurchase"
        element={
          <ProtectedSecRoute>
            <PurchasePayment />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/searchPartyPurchasePayment"
        element={
          <ProtectedSecRoute>
            <SearchPartyPayment />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/purchase/addAmount/:party_id"
        element={
          <ProtectedSecRoute>
            <OutstandingListOfPayment />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/payment/sourceList/:source"
        element={
          <ProtectedSecRoute>
            <SourceList />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/payment/details/:id"
        element={
          <ProtectedSecRoute>
            <PaymtentDetails />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/paymentPrintOut"
        element={
          <ProtectedSecRoute>
            <PaymentPrintOut />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editPayment/:id"
        element={
          <ProtectedSecRoute>
            <EditPayment />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/payment/edit/addAmount/:party_id"
        element={
          <ProtectedSecRoute>
            <OutstandingListOfPaymentForEdit />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* bank payment */}
      {/* creditNote */}
      <Route
        path="/sUsers/creditNote"
        element={
          <ProtectedSecRoute>
            <CreditNote />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/searchPartyCreditNote"
        element={
          <ProtectedSecRoute>
            <SearchPartyCreditNote />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/billToCreditNote/:id"
        element={
          <ProtectedSecRoute>
            <BillToCreditNote />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/addItemCreditNote"
        element={
          <ProtectedSecRoute>
            <AddItemCreditNote />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editItemCreditNote/:id/:godownName/:index"
        element={
          <ProtectedSecRoute>
            <EditItemCreditNote />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/creditDetails/:id"
        element={
          <ProtectedSecRoute>
            <CreditNoteDetailsSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editCreditNote/:id"
        element={
          <ProtectedSecRoute>
            <EditCreditNote />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/shareCreditNote/:id"
        element={
          <ProtectedSecRoute>
            <ShareCreditNoteSecondary />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* debitNote */}
      <Route
        path="/sUsers/debitNote"
        element={
          <ProtectedSecRoute>
            <DebitNote />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/searchPartyDebitNote"
        element={
          <ProtectedSecRoute>
            <SearchPartyDebitNote />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/billToDebitNote/:id"
        element={
          <ProtectedSecRoute>
            <BillToDebitNote />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/addItemDebitNote"
        element={
          <ProtectedSecRoute>
            <AddItemDebitNote />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editItemDebitNote/:id/:godownName/:index"
        element={
          <ProtectedSecRoute>
            <EditItemDebitNote />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/debitDetails/:id"
        element={
          <ProtectedSecRoute>
            <DebitNoteDetailsSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editDebitNote/:id"
        element={
          <ProtectedSecRoute>
            <EditDebitNote />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/shareDebitNote/:id"
        element={
          <ProtectedSecRoute>
            <ShareDebitNoteSecondary />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* inventory secondary */}
      {/* we are using the same page of primary to avoid page repetition */}
      <Route
        path="/sUsers/brand"
        element={
          <ProtectedSecRoute>
            <AddBrand />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/category"
        element={
          <ProtectedSecRoute>
            <AddCategory />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/subcategory"
        element={
          <ProtectedSecRoute>
            <AddSubCategory />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/godown"
        element={
          <ProtectedSecRoute>
            <AddGodown />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/pricelevel"
        element={
          <ProtectedSecRoute>
            <AddPriceLevel />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* hsn */}
      {/* we are using the same page of primary to avoid page repetition */}
      <Route
        path="/sUsers/hsnList"
        element={
          <ProtectedSecRoute>
            <HsnList />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/hsn"
        element={
          <ProtectedSecRoute>
            <Hsn />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editHsn/:id"
        element={
          <ProtectedSecRoute>
            <EditHsn />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* report */}
      <Route
        path="/sUsers/reports"
        element={
          <ProtectedSecRoute>
            <Reports />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* party statement  */}

      {/* we are using the same page of party list of sales to avoid page repetition */}
      <Route
        path="/sUsers/partyStatement/partyList"
        element={
          <ProtectedSecRoute>
            <SearchPartySalesSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/partyStatement"
        element={
          <ProtectedSecRoute>
            <PartyStatement />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* sales summary */}
      <Route
        path="/sUsers/salesSummary"
        element={
          <ProtectedSecRoute>
            <SalesSummary />
          </ProtectedSecRoute>
        }
      ></Route>
      {/* order summary */}
      <Route
        path="/sUsers/orderSummary"
        element={
          <ProtectedSecRoute>
            <OrderSummary />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* cash or bank */}
      <Route
        path="/sUsers/balancePage"
        element={
          <ProtectedSecRoute>
            <BalancePage />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/balanceDetails/:accGroup"
        element={
          <ProtectedSecRoute>
            <BalanceDetails />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/sourceTransactions/:id/:accGroup"
        element={
          <ProtectedSecRoute>
            <SourceTransactions />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/addBank"
        element={
          <ProtectedSecRoute>
            <AddBank />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editBank/:id"
        element={
          <ProtectedSecRoute>
            <AddBank />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/addCash"
        element={
          <ProtectedSecRoute>
            <AddCash />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/editCash/:id"
        element={
          <ProtectedSecRoute>
            <AddCash />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* filters */}
      <Route
        path="/sUsers/dateRange"
        element={
          <ProtectedSecRoute>
            <DateRange />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/vouchersLIst"
        element={
          <ProtectedSecRoute>
            <VouchersList />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/partyFilterList"
        element={
          <ProtectedSecRoute>
            <PartyFilterList />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/statusFilterList"
        element={
          <ProtectedSecRoute>
            <StatusFilterList />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* barcode scanning */}
      <Route
        path="/sUsers/sales/scanProduct"
        element={
          <ProtectedSecRoute>
            <BarcodeScan />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* settings */}
      <Route
        path="/sUsers/settings"
        element={
          <ProtectedSecRoute>
            <SettingsList />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/StockItem"
        element={
          <ProtectedSecRoute>
            <StockItem />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/partySettings"
        element={
          <ProtectedSecRoute>
            <PartySettings />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/dataEntrySettings"
        element={
          <ProtectedSecRoute>
            <DateEntrySettings />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/OutstandingSettings"
        element={
          <ProtectedSecRoute>
            <OutstandingSettings />
          </ProtectedSecRoute>
        }
      ></Route>
      {/* stock item settings */}
      <Route
        path="/sUsers/StockItemSettings"
        element={
          <ProtectedSecRoute>
            <StockItemSettings />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/barcodeList"
        element={
          <ProtectedSecRoute>
            <BarcodeList />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/barcodeCreationDetails"
        element={
          <ProtectedSecRoute>
            <BarcodeCreationDetails />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/barcodePrintOn"
        element={
          <ProtectedSecRoute>
            <BarcodePrintOn />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/barcodePrintOff"
        element={
          <ProtectedSecRoute>
            <BarcodePrintOff />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/barcodeFormat"
        element={
          <ProtectedSecRoute>
            <BarcodeFormat />
          </ProtectedSecRoute>
        }
      ></Route>
      {/* date entry settings */}
      <Route
        path="/sUsers/VoucherSettings"
        element={
          <ProtectedSecRoute>
            <VoucherSettings />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/OrderSettings"
        element={
          <ProtectedSecRoute>
            <OrderSettings />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/InvoiceSettings"
        element={
          <ProtectedSecRoute>
            <InvoiceSettings />
          </ProtectedSecRoute>
        }
      ></Route>
      {/* voucher settings */}
      <Route
        path="/sUsers/emailSettings"
        element={
          <ProtectedSecRoute>
            <EmailSettings />
          </ProtectedSecRoute>
        }
      ></Route>
      {/* despatch title */}
      <Route
        path="/sUsers/order/customDespatchTitle"
        element={
          <ProtectedSecRoute>
            <DespatchTitleSettings />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/invoice/customDespatchTitle"
        element={
          <ProtectedSecRoute>
            <DespatchTitleSettings />
          </ProtectedSecRoute>
        }
      ></Route>
      {/* terms and conditions */}
      <Route
        path="/sUsers/order/termsAndConditions"
        element={
          <ProtectedSecRoute>
            <TermsAndConditionSettings />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/invoice/termsAndConditions"
        element={
          <ProtectedSecRoute>
            <TermsAndConditionSettings />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* printConfiguration */}
      <Route
        path="/sUsers/printConfiguration"
        element={
          <ProtectedSecRoute>
            <PrintConfiguration />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/saleOrderPrintConfiguration"
        element={
          <ProtectedSecRoute>
            <SaleOrderPrintConfiguration />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/salePrintConfiguration"
        element={
          <ProtectedSecRoute>
            <SalePrintConfiguration />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* order pending */}
      <Route
        path="/sUsers/orderPending/partyList"
        element={
          <ProtectedSecRoute>
            <SearchPartySalesSecondary />
          </ProtectedSecRoute>
        }
      ></Route>
      <Route
        path="/sUsers/pendingOrders/:partyId"
        element={
          <ProtectedSecRoute>
            <PendingOrders />
          </ProtectedSecRoute>
        }
      ></Route>

      {/* errorPage */}
      <Route path="/errorPage" element={<ErrorPage />} />
      <Route path="/serverError" element={<ServerError />} />
    </Routes>
  )
}

export default Routers
