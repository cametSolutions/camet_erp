
import {Route,Routes} from 'react-router-dom'
import Register from '../pages/primaryUsers/Register'
import Login from '../pages/primaryUsers/Login'
// import Home from '../pages/primaryUsers/Home'
// import OrganizationList from '../components/homePage/OrganisationList'
import AdminLogin from '../pages/admin/AdminLogin'
import AdminHome from '../pages/admin/AdminHome'
import SecLogin from '../pages/secUsers/SecLogin'
import SecHome from '../pages/secUsers/SecHome'
import Outstanding from '../pages/secUsers/Outstanding'
import OutstandingDetails from '../pages/secUsers/OutstandingDetails'
import PrOutstandingDetails from '../pages/primaryUsers/PrOutstandingDetails ' 
import PaymentSec from '../pages/secUsers/Payment'
import PaymentPri from '../pages/primaryUsers/Payment'
import ProtectedSecRoute from './ProtectedSecRoute'
import Transaction from '../pages/secUsers/Transaction'
import PriTransaction from '../pages/primaryUsers/Transaction'
import AddOrganisation from '../pages/primaryUsers/AddOrganisation'
import OrganizationList from '../../src/pages/primaryUsers/OrganisationList'
import AddSecUsers from '../pages/primaryUsers/AddSecUsers'
import SecUsersList from '../pages/primaryUsers/SecUsersList'
import ProtectedPriRoute from './ProtectedPriRoute'
import ProtectedAdmin from './ProtectedAdmin'
import BankList from '../pages/primaryUsers/BankList'
import ForgotPasswordPrimary from '../pages/primaryUsers/ForgotPasswordPrimary'
import Otp from '../pages/primaryUsers/Otp'
import ResetPassword from '../pages/primaryUsers/ResetPassword'
import ForgotPasswordSec from '../pages/secUsers/ForgotPasswordSec'
import OtpSec from '../pages/secUsers/OtpSec'
import ResetPasswordSec from '../pages/secUsers/ResetPasswordSec'
import ReceiptDetails from '../pages/primaryUsers/ReceiptDetails'
import SecReceptionDetails from '../pages/secUsers/ReceiptDetails'
import Dashboard from '../pages/primaryUsers/Dashboard'
import EditOrg from '../pages/primaryUsers/EditOrg'
import DashboardSec from '../pages/secUsers/Dashboard'
import AddParty from '../pages/primaryUsers/AddParty'
import Hsn from '../pages/primaryUsers/Hsn'
import AddProduct from '../pages/primaryUsers/AddProduct'
import ProductList from '../pages/primaryUsers/ProductList'
import EditProduct from '../pages/primaryUsers/EditProduct'
import PartyList from '../pages/primaryUsers/PartyList'
import EditParty from '../pages/primaryUsers/EditParty'


import Demo from '../pages/primaryUsers/Demo'
import RetailersList from '../pages/primaryUsers/RetailersList'
import HsnList from '../pages/primaryUsers/HsnList'
import EditHsn from '../pages/primaryUsers/EditHsn'
import InvoiceSecondary from '../pages/secUsers/InvoiceSecondary'
import SearchPartySecondary from '../pages/secUsers/SearchPartySecondary'
import PartyListSecondary from '../pages/secUsers/PartyListSecondary'
import AddPartySecondary from '../pages/secUsers/AddPartySecondary'
import ProductListSecondary from '../pages/secUsers/ProductListSecondary'
import AddItemSecondary from '../pages/secUsers/AddItemSecondary'
import EditItemSecondary from '../pages/secUsers/EditItemSecondary'
import EditPartySecondary from '../pages/secUsers/EditPartySecondary'
import AddProductSecondary from '../pages/secUsers/AddProductSecondary'
import EditProductSecondary from '../pages/secUsers/EditProductSecondary'
import AddBank from '../pages/primaryUsers/AddBank'
import EditBank from '../pages/primaryUsers/EditBank'
import EditSecUsers from '../pages/primaryUsers/EditSecUsers'
import InvoiceDetails from '../pages/primaryUsers/InvoiceDetails'
import ShareInvoice from '../pages/primaryUsers/ShareInvoice'
import InvoiceDetailsSecondary from '../pages/secUsers/InvoiceDetailsSecondary'
import EditInvoiceSecondary from '../pages/secUsers/EditInvoiceSecondary'
import ShareInvoiceSecondary from '../pages/secUsers/ShareInvoiceSecondary'
import AdditionalCharges from '../pages/primaryUsers/AdditionalCharges'
import AddChargesList from '../pages/primaryUsers/AddChargesList'
import EditAdditionalCharges from '../pages/primaryUsers/EditAdditionalCharges'

import OrderConfigurations from '../pages/primaryUsers/OrderConfigurations'
import AddChargesListSecondary from '../pages/secUsers/AddChargesListSecondary'
import AdditionalChargesSecondary from '../pages/secUsers/AdditionalChargesSecondary'
import EditAdditionalChargesSecondary from '../pages/secUsers/EditAdditionalChargesSecondary'
import OrderConfigurationsSecondary from '../pages/secUsers/OrderConfigurationsSecondary'

// inventory 
import InventoryPrimaryUser from '../pages/primaryUsers/InventoryPrimaryUser'
import InventorySecondaryUser from '../pages/secUsers/InventorySecondaryUser'
import SelectDefaultModal from '../../constants/components/SelectDefaultModal'
import SalesDetails from '../pages/primaryUsers/SalesDetails'
import ShareSales from '../pages/primaryUsers/ShareSales'
import SalesSecondary from '../pages/secUsers/SalesSecondary'
import SearchPartySalesSecondary from '../pages/secUsers/SearchPartySalesSecondary'
import AddItemSalesSecondary from '../pages/secUsers/AddItemSalesSecondary'
import SalesDetailsSecondary from '../pages/secUsers/SalesDetailsSecondary'
import EditItemSalesSecondary from '../pages/secUsers/EditItemSalesSecondary'
import ShareSalesSecondary from '../pages/secUsers/ShareSalesSecondary'
import ConfigureSecondaryUser from '../pages/primaryUsers/ConfigureSecondaryUser'

// Error Page
import ErrorPage from '../pages/errorPages/Notfound'
import Notfound from '../pages/errorPages/Notfound'
import ServerError from '../pages/errorPages/ServerError'
import ThreeInchSales from '../pages/primaryUsers/ThreeInchSales'
import ThreeInchSalesSec from '../pages/secUsers/ThreeInchSalesSec'
import Contacts from '../pages/secUsers/Contacts'
import Purchase from '../pages/secUsers/Purchase'
import SearchPartyPurchase from '../pages/secUsers/SearchPartyPurchase'
import AddItemPurchase from '../pages/secUsers/AddItemPurchase'
import EditItemPurchase from '../pages/secUsers/EditItemPurchase'
import PurchaseDetailsSecondary from '../pages/secUsers/PurchaseDetailsSecondary'
import SharePurchaseSecondary from '../pages/secUsers/SharePurchaseSecondary'
import ThreeInchPurchaseSec from '../pages/secUsers/ThreeInchPurchaseSec'
import PurchaseDetailsPrimary from '../pages/primaryUsers/PurchaseDetailsPrimary'
import SharePurchasePrimary from '../pages/primaryUsers/SharePurchasePrimary'
import ThreeInchPurchasePrimary from '../pages/primaryUsers/ThreeInchPurchasePrimary'
import EditSale from '../pages/secUsers/EditSale'
import TheeInchInvoiceSec from '../pages/secUsers/TheeInchInvoiceSec'
const Routers = () => {
  return (
    <Routes>
      <Route path='*' element={<Notfound/>}></Route>
      <Route path='/notFound' element={<Notfound/>}></Route>
        <Route path='/' element={<Login/>}></Route>
        <Route path='/pUsers/register' element={<Register/>}></Route>
        <Route path='/pUsers/login' element={<Login></Login>}></Route>
        <Route path='/pUsers/forgotPassword' element={<ForgotPasswordPrimary/>}></Route>
        <Route path='/pUsers/otp' element={<Otp/>}></Route>
        <Route path='/pUsers/resetPassword' element={<ResetPassword/>}></Route>
        {/* <Route path='/pUsers/home' element={<Home></Home>}></Route> */}
        <Route path='/pUsers/addOrganization' element={<ProtectedPriRoute><AddOrganisation/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/editOrg/:id' element={<ProtectedPriRoute><EditOrg/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/organizationList' element={<ProtectedPriRoute><OrganizationList/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/addSecUsers' element={<ProtectedPriRoute><AddSecUsers/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/secUsersList' element={<ProtectedPriRoute><SecUsersList/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/retailers' element={<ProtectedPriRoute><RetailersList/></ProtectedPriRoute>}></Route>

        <Route path='/pUsers/payment' element={<ProtectedPriRoute><PaymentPri/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/outstandingDetails/:party_id/:cmp_id/:total' element={<ProtectedPriRoute>< PrOutstandingDetails/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/transaction' element={<ProtectedPriRoute><PriTransaction /></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/receiptDetails/:id' element={<ProtectedPriRoute><ReceiptDetails/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/bankLIst' element={<ProtectedPriRoute><BankList/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/addBank' element={<ProtectedPriRoute><AddBank/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/dashboard' element={<ProtectedPriRoute><Dashboard/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/addParty' element={<ProtectedPriRoute><AddParty/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/hsn' element={<ProtectedPriRoute><Hsn/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/addProduct' element={<ProtectedPriRoute><AddProduct/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/productList' element={<ProtectedPriRoute><ProductList/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/editProduct/:id' element={<ProtectedPriRoute><EditProduct/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/partyList' element={<ProtectedPriRoute><PartyList/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/editParty/:id' element={<ProtectedPriRoute><EditParty/></ProtectedPriRoute>}></Route>

     
        <Route path='/pUsers/demo' element={<ProtectedPriRoute><Demo/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/hsnList' element={<ProtectedPriRoute><HsnList/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/editHsn/:id' element={<ProtectedPriRoute><EditHsn/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/editBank/:id' element={<ProtectedPriRoute><EditBank/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/editUser/:id' element={<ProtectedPriRoute><EditSecUsers/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/InvoiceDetails/:id' element={<ProtectedPriRoute><InvoiceDetails/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/shareInvoice/:id' element={<ProtectedPriRoute><ShareInvoice/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/additionalCharges' element={<ProtectedPriRoute><AdditionalCharges/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/additionalChargesList' element={<ProtectedPriRoute><AddChargesList/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/editAdditionalCharge/:id' element={<ProtectedPriRoute><EditAdditionalCharges/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/OrderConfigurations' element={<ProtectedPriRoute><OrderConfigurations/></ProtectedPriRoute>}></Route>

        <Route path='/pUsers/modal' element={<ProtectedPriRoute><SelectDefaultModal/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/salesDetails/:id' element={<ProtectedPriRoute><SalesDetails/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/shareSalesThreeInch/:id' element={<ProtectedPriRoute><ThreeInchSales/></ProtectedPriRoute>}></Route>

        <Route path='/pUsers/shareSales/:id' element={<ProtectedPriRoute><ShareSales/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/configureSecondaryUser/:id/:userId/:cmp_name' element={<ProtectedPriRoute><ConfigureSecondaryUser/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/Inventory' element={<ProtectedPriRoute><InventoryPrimaryUser/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/purchaseDetails/:id' element={<ProtectedPriRoute><PurchaseDetailsPrimary/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/sharePurchase/:id' element={<ProtectedPriRoute><SharePurchasePrimary/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/sharePurchaseThreeInch/:id' element={<ProtectedPriRoute><ThreeInchPurchasePrimary/></ProtectedPriRoute>}></Route>


        {/* admin */}
        <Route path='/admin/login' element={<AdminLogin/>}></Route>
        <Route path='/admin/home' element={<ProtectedAdmin><AdminHome/></ProtectedAdmin>}></Route>

        {/* sec users */}
        <Route path='/sUsers/login' element={<SecLogin/>}></Route>
        <Route path='/sUsers/forgotPassword' element={<ForgotPasswordSec/>}></Route>
        <Route path='/sUsers/otp' element={<OtpSec/>}></Route>
        <Route path='/sUsers/resetPassword' element={<ResetPasswordSec/>}></Route>




        <Route path='/sUsers/home' element={<ProtectedSecRoute><SecHome/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/outstanding' element={<ProtectedSecRoute><Outstanding/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/outstandingDetails/:party_id/:cmp_id/:total' element={<ProtectedSecRoute><OutstandingDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/payment' element={<ProtectedSecRoute><PaymentSec/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/transaction' element={<ProtectedSecRoute><Transaction /></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/receiptDetails/:id' element={<ProtectedSecRoute><SecReceptionDetails/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/dashboard' element={<ProtectedSecRoute><DashboardSec/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/invoice' element={<ProtectedSecRoute><InvoiceSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/searchParty' element={<ProtectedSecRoute><SearchPartySecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/partyList' element={<ProtectedSecRoute><PartyListSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/addParty' element={<ProtectedSecRoute><AddPartySecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/productList' element={<ProtectedSecRoute><ProductListSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/addItem' element={<ProtectedSecRoute><AddItemSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editItem/:id' element={<ProtectedSecRoute><EditItemSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editParty/:id' element={<ProtectedSecRoute><EditPartySecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/addProduct' element={<ProtectedSecRoute><AddProductSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editProduct/:id' element={<ProtectedSecRoute><EditProductSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/InvoiceDetails/:id' element={<ProtectedSecRoute><InvoiceDetailsSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editInvoice/:id' element={<ProtectedSecRoute><EditInvoiceSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/shareInvoice/:id' element={<ProtectedSecRoute><ShareInvoiceSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/shareInvoiceThreeInch/:id' element={<ProtectedSecRoute><TheeInchInvoiceSec/></ProtectedSecRoute>}></Route> 

        <Route path='/sUsers/additionalChargesList' element={<ProtectedSecRoute><AddChargesListSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/additionalCharges' element={<ProtectedSecRoute><AdditionalChargesSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editAdditionalCharge/:id' element={<ProtectedSecRoute><EditAdditionalChargesSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/OrderConfigurations' element={<ProtectedSecRoute><OrderConfigurationsSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/Inventory' element={<ProtectedSecRoute><InventorySecondaryUser/></ProtectedSecRoute>}></Route>

        <Route path='/sUsers/sales' element={<ProtectedSecRoute><SalesSecondary/></ProtectedSecRoute>}></Route>
         <Route path='/sUsers/searchPartySales' element={<ProtectedSecRoute><SearchPartySalesSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/addItemSales' element={<ProtectedSecRoute><AddItemSalesSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editItemSales/:id/:godownName/:index' element={<ProtectedSecRoute><EditItemSalesSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/salesDetails/:id' element={<ProtectedSecRoute><SalesDetailsSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/shareSales/:id' element={<ProtectedSecRoute><ShareSalesSecondary/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/shareSalesThreeInch/:id' element={<ProtectedSecRoute><ThreeInchSalesSec/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/contacts' element={<ProtectedSecRoute><Contacts/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/purchase' element={<ProtectedSecRoute><Purchase/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/searchPartyPurchase' element={<ProtectedSecRoute><SearchPartyPurchase/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/addItemPurchase' element={<ProtectedSecRoute><AddItemPurchase/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/editItemPurchase/:id' element={<ProtectedSecRoute><EditItemPurchase/></ProtectedSecRoute>}></Route> 
        <Route path='/sUsers/purchaseDetails/:id' element={<ProtectedSecRoute><PurchaseDetailsSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/sharePurchase/:id' element={<ProtectedSecRoute><SharePurchaseSecondary/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/sharePurchaseThreeInch/:id' element={<ProtectedSecRoute><ThreeInchPurchaseSec/></ProtectedSecRoute>}></Route>
        <Route path='/sUsers/editSale/:id' element={<ProtectedSecRoute><EditSale/></ProtectedSecRoute>}></Route>


        {/* errorPage */}
        <Route path='/errorPage' element={<ErrorPage />} />
        <Route path='/serverError' element={<ServerError />} />

    
    </Routes>
  )
}

export default Routers