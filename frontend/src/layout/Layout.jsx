/* eslint-disable react/prop-types */
// src/components/Layout.js
import { Outlet } from "react-router-dom";
import Sidebar from "../components/homePage/Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-scroll">
      { children }
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

