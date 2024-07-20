import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { store } from "../app/store.js";
import { Provider } from "react-redux";



ReactDOM.createRoot(document.getElementById("root")).render(

    <BrowserRouter>
      <ToastContainer
        theme="dark"
        position="top-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover={true}
      />
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>

);
