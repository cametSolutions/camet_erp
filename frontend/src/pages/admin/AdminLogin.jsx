import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/common/Forms/LoginForm";

function AdminLogin() {
  const navigate = useNavigate();

  const adminData = JSON.parse(localStorage.getItem("adminData"));

  useEffect(() => {
    if (adminData) {
      navigate("/admin/home");
    }
  },[adminData]);

  return <LoginForm user="admin" />;
}

export default AdminLogin;
