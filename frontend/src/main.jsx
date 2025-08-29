import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
// import { ToastContainer } from "sonner";
// import "sonner/dist/ReactToastify.css";
import { store } from "../app/store.js";
import { Provider } from "react-redux";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import GlobalErrorBoundary from "./components/errorBoundaries/GlobalErrorBoundary.jsx";

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    {/* <ToastContainer
      theme="dark"
      position="top-right"
      autoClose={3000}
      closeOnClick
      pauseOnHover={true}
    /> */}
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GlobalErrorBoundary>
          <App />
        </GlobalErrorBoundary>

        {/* this is from sonner */}
        <Toaster 
        theme="dark" 
        visibleToasts={1} 
        offset={16} 
        position="top-right"
        swipeDirections={["left", "right"]}
        closeButton={true}
         />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  </BrowserRouter>
);
