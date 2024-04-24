import axios from 'axios';
import { FaWindows } from 'react-icons/fa';

const api = axios.create({
  baseURL: 'http://localhost:7000',
  // baseURL:"https://www.erp.camet.in/"
});

api.interceptors.response.use(
  function (response) {
    console.log(response)
    return response;
  },
  function (error) {
    console.log(error)
    if (error.response.config.url === '/api/sUsers/getSecUserData' || error.response.data.is_blocked ) {
        showAlert("Your Account is Blocked", '/sUsers/login', 'sUserData');
    }
    else if(error.response.config.url === '/api/pUsers/getPrimaryUserData' || error.response.data.is_blocked) {
        showAlert("Your Account is Blocked", '/pUsers/login', 'pUserData');
    }else if(error.response.status == 404){
      window.location.href("error")
    }
    else if(error.response.status == 500){
      window.location.href("error")
    }
    
    return Promise.reject(error);
  }
);

const showAlert = (message, redirectUrl, removeItem) => {
  const alertDiv = document.createElement('div');
  alertDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    background-color: #f44336; /* Red color */
    color: white;
    border-radius: 5px;
    box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.5);
    z-index: 9999;
    max-width: 80%; /* Set maximum width */
    width: 300px; /* Set default width */
  `;

  const messageDiv = document.createElement('div');
  messageDiv.innerText = message;
  alertDiv.appendChild(messageDiv);

  const okButton = document.createElement('button');
  okButton.innerText = "OK";
  okButton.style.cssText = `
    margin-top: 10px;
    padding: 5px 10px;
    background-color: #4CAF50; /* Green color for button */
    border: none;
    color: white;
    border-radius: 3px;
    cursor: pointer;
  `;
  okButton.onclick = () => {
    window.location.href = redirectUrl;
    localStorage.removeItem(removeItem);
    document.body.removeChild(alertDiv);
  };
  alertDiv.appendChild(okButton);

  document.body.appendChild(alertDiv);
};

export default api;
