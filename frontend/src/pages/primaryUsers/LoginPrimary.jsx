/* eslint-disable react/no-unknown-property */
import { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/common/Forms/LoginForm.jsx";
function LoginPrimary() {
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("pUserData"));
    if (userData) {
      navigate("/pUsers/dashboard");
    }
  }, []);

  return <LoginForm user="primary" />;
}

export default LoginPrimary;
