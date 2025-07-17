import { Routes, Route } from "react-router-dom";
import AdminHome from "../pages/admin/AdminHome";
import ProtectedAdmin from "./ProtectedAdmin";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="/admin/home"
        element={
          <ProtectedAdmin>
            <AdminHome />
          </ProtectedAdmin>
        }
      />
      {/* Add more admin-specific routes */}
    </Routes>
  );
}
