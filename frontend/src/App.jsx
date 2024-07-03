import "./App.css";
import "./index.css";
import Routers from "./routes/Routers";
import Layout from "./layout/Layout";
import Notfound from "./pages/errorPages/Notfound";
import Login from "./pages/primaryUsers/Login";
import Register from "./pages/primaryUsers/Register";
import ForgotPasswordPrimary from "./pages/primaryUsers/ForgotPasswordPrimary";
import Otp from "./pages/primaryUsers/Otp";
import ResetPassword from "./pages/primaryUsers/ResetPassword";
import { Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/notFound" element={<Notfound />}></Route>
        <Route path="/" element={<Login />}></Route>
        <Route path="/pUsers/register" element={<Register />}></Route>
        <Route path="/pUsers/login" element={<Login></Login>}></Route>
        <Route
          path="/pUsers/forgotPassword"
          element={<ForgotPasswordPrimary />}
        ></Route>
        <Route path="/pUsers/otp" element={<Otp />}></Route>
        <Route path="/pUsers/resetPassword" element={<ResetPassword />}></Route>
      </Routes>
      <Layout>
        <Routers />
      </Layout>
    </>
  );
}
