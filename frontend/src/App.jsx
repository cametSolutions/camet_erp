import "./App.css";
import "./index.css";
import Routers from "./routes/Routers";
import Layout from "./layout/Layout";
import Notfound from "./pages/errorPages/Notfound";
import Register from "./pages/primaryUsers/Register";
import ForgotPasswordPrimary from "./pages/primaryUsers/ForgotPasswordPrimary";
import Otp from "./pages/primaryUsers/Otp";
import ResetPassword from "./pages/primaryUsers/ResetPassword";
import { Route, Routes, useLocation } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";
import ForgotPasswordSec from "./pages/secUsers/ForgotPasswordSec";
import OtpSec from "./pages/secUsers/OtpSec";
import ResetPasswordSec from "./pages/secUsers/ResetPasswordSec";
import ServerError from "./pages/errorPages/ServerError";
import ErrorPage from "./pages/errorPages/Notfound";
import LoginSecondary from "./pages/secUsers/LoginSecondary";
import LoginPrimary from "./pages/primaryUsers/LoginPrimary";
import AdminRoutes from "./routes/AdminRoutes"; // ✅ create this

export default function App() {
  const location = useLocation();

  // Check if current path includes "admin"
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <>
      <Routes>
        {/* Common routes without layout */}
        <Route path="/" element={<LoginSecondary />} />
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
        <Route path="/sUsers/login" element={<LoginSecondary />} />
        <Route path="/sUsers/forgotPassword" element={<ForgotPasswordSec />} />
        <Route path="/sUsers/otp" element={<OtpSec />} />
        <Route path="/sUsers/resetPassword" element={<ResetPasswordSec />} />
        <Route path="/errorPage" element={<ErrorPage />} />
        <Route path="/serverError" element={<ServerError />} />

        {/* Conditionally render route sets */}
        <Route
          path="*"
          element={
            isAdminPath ? (
              <Layout>
                <AdminRoutes />
              </Layout> // ✅ Admin routes with layout
            ) : (
              <Layout>
                <Routers />
              </Layout>
            )
          }
        />
      </Routes>
    </>
  );
}
