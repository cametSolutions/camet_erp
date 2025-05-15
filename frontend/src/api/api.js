import axios from "axios";
import Swal from "sweetalert2";

const api = axios.create({
  // baseURL: "http://localhost:7000",
  // baseURL:"https://www.erp.camet.in/"
  // baseURL:"https://www.erptest.camet.in/"
  baseURL:"https://www.app.camet.in/"
});

api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (
      error.response.config.url === "/api/sUsers/getSecUserData" ||
      error.response.data.is_blocked
    ) {
      showSwalAlert(
        "Your Account is Blocked",
        "warning",
        "/sUsers/login",
        "sUserData"
      );
    } else if (
      error.response.config.url === "/api/pUsers/getPrimaryUserData" ||
      error.response.data.is_blocked
    ) {
      showSwalAlert(
        "Your Account is Blocked",
        "warning",
        "/pUsers/login",
        "pUserData"
      );
    } else if (
      error.response.status == 403 &&
      error.response.data.companyRestricted
    ) {
      showSwalAlert2("This company is restricted", "warning");
    }

    return Promise.reject(error);
  }
);

const showSwalAlert = (message, icon, redirectUrl, removeItem) => {
  Swal.fire({
    title: "Alert",
    text: message,
    icon: icon,
    confirmButtonText: "OK",
  }).then((result) => {
    if (result.isConfirmed) {
      if (redirectUrl) {
        window.location.href = redirectUrl;
        localStorage.removeItem(removeItem);
      }
    }
  });
};

const showSwalAlert2 = (message, icon) => {
  Swal.fire({
    title: "Alert",
    text: message,
    icon: icon,
    confirmButtonText: "OK",
  });
};

export default api;
