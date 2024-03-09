
import {Route,Routes} from 'react-router-dom'
import Register from '../pages/primaryUsers/Register'
import Login from '../pages/primaryUsers/Login'
import Home from '../pages/primaryUsers/Home'
// import OrganizationList from '../components/homePage/OrganisationList'
import AdminLogin from '../pages/admin/AdminLogin'
import AdminHome from '../pages/admin/AdminHome'
import SecLogin from '../pages/secUsers/SecLogin'
import SecHome from '../pages/secUsers/SecHome'
import Outstanding from '../pages/secUsers/Outstanding'
import PrimaryOutstanding from '../pages/primaryUsers/Outstanding'
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
import Invoice from '../pages/primaryUsers/Invoice'
import SearchParty from '../pages/primaryUsers/SearchParty'
import AddItem from '../pages/primaryUsers/AddItem'
import EditItem from '../pages/primaryUsers/EditItem'
import Demo from '../pages/primaryUsers/Demo'



const Routers = () => {
  return (
    <Routes>
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
        <Route path='/pUsers/payment' element={<ProtectedPriRoute><PaymentPri/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/outstanding' element={<ProtectedPriRoute>< PrimaryOutstanding/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/outstandingDetails/:party_id/:cmp_id/:total' element={<ProtectedPriRoute>< PrOutstandingDetails/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/transaction' element={<ProtectedPriRoute><PriTransaction /></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/receiptDetails/:id' element={<ProtectedPriRoute><ReceiptDetails/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/bankLIst' element={<ProtectedPriRoute><BankList/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/dashboard' element={<ProtectedPriRoute><Dashboard/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/addParty' element={<ProtectedPriRoute><AddParty/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/hsn' element={<ProtectedPriRoute><Hsn/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/addProduct' element={<ProtectedPriRoute><AddProduct/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/productList' element={<ProtectedPriRoute><ProductList/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/editProduct/:id' element={<ProtectedPriRoute><EditProduct/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/partyList' element={<ProtectedPriRoute><PartyList/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/editParty/:id' element={<ProtectedPriRoute><EditParty/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/invoice' element={<ProtectedPriRoute><Invoice/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/searchParty' element={<ProtectedPriRoute><SearchParty/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/searchParty' element={<ProtectedPriRoute><SearchParty/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/addItem' element={<ProtectedPriRoute><AddItem/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/editItem/:id' element={<ProtectedPriRoute><EditItem/></ProtectedPriRoute>}></Route>
        <Route path='/pUsers/demo' element={<ProtectedPriRoute><Demo/></ProtectedPriRoute>}></Route>


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

    </Routes>
  )
}

export default Routers