import "./App.css";
import "./index.css";
import Routers from "./routes/Routers";
import Layout from "./layout/Layout";
import Notfound from "./pages/errorPages/Notfound";
import Register from "./pages/primaryUsers/Register";
import ForgotPasswordPrimary from "./pages/primaryUsers/ForgotPasswordPrimary";
import Otp from "./pages/primaryUsers/Otp";
import ResetPassword from "./pages/primaryUsers/ResetPassword";
import { Route, Routes } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";
import ProtectedAdmin from "./routes/ProtectedAdmin";
import ForgotPasswordSec from "./pages/secUsers/ForgotPasswordSec";
import AdminHome from "./pages/admin/AdminHome";
import OtpSec from "./pages/secUsers/OtpSec";
import ResetPasswordSec from "./pages/secUsers/ResetPasswordSec";
import ServerError from "./pages/errorPages/ServerError";
import ErrorPage from "./pages/errorPages/Notfound";
import LoginSecondary from "./pages/secUsers/LoginSecondary";
import LoginPrimary from "./pages/primaryUsers/LoginPrimary";

export default function App() {
  return (
    <>
      <Routes>
        {/* Routes without Layout */}
        <Route path="/" element={<LoginPrimary />} />
        <Route path="/notFound" element={<Notfound />} />
        <Route path="/pUsers/register" element={<Register />} />
        <Route path="/pUsers/login" element={<LoginPrimary />} />
        <Route
          path="/pUsers/forgotPassword"
          element={<ForgotPasswordPrimary />}
        />
        <Route path="/pUsers/otp" element={<Otp />} />
        <Route path="/pUsers/resetPassword" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/home"
          element={
            <ProtectedAdmin>
              <AdminHome />
            </ProtectedAdmin>
          }
        />
        {/* sec users */}
        <Route path="/sUsers/login" element={<LoginSecondary />} />
        <Route path="/sUsers/forgotPassword" element={<ForgotPasswordSec />} />
        <Route path="/sUsers/otp" element={<OtpSec />} />
        <Route path="/sUsers/resetPassword" element={<ResetPasswordSec />} />
        <Route path="/errorPage" element={<ErrorPage />} />
        <Route path="/serverError" element={<ServerError />} />

        {/* Routes with Layout */}
        <Route
          path="*"
          element={
            <Layout>
              <Routers />
            </Layout>
          }
        />
      </Routes>
    </>
  );
}
