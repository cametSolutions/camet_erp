/* eslint-disable react/no-unknown-property */
import { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/common/Forms/LoginForm.jsx";
function LoginSecondary() {
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("sUserData"));
    if (userData) {
      navigate("/sUsers/dashboard");
    }
  }, []);

  return <LoginForm user="secondary" />;
}

export default LoginSecondary;
