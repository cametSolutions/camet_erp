/* eslint-disable react/prop-types */
// src/components/Layout.js
import { Outlet } from "react-router-dom";
import Sidebar from "../components/homePage/Sidebar";
import SidebarSec from "../components/secUsers/SidebarSec";
import AdminSidebar from "../components/admin/AdminSidebar";
import { createContext, useState, useContext } from "react";

const SidebarContext = createContext();

export const useSidebar = () => {
  return useContext(SidebarContext);
};

const Layout = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };

  const renderSidebar = () => {
    if (location.pathname.includes("/pUsers/")) {
      return (
        <Sidebar
          showBar={showSidebar}
          handleToggleSidebar={handleToggleSidebar}
        />
      );
    } else if (location.pathname.includes("/sUsers/")) {
      return <SidebarSec   showBar={showSidebar}
      handleToggleSidebar={handleToggleSidebar} />;
    } else if (location.pathname.includes("/admin/")) {
      return (
        <AdminSidebar
          showBar={showSidebar}
          handleToggleSidebar={handleToggleSidebar}
        />
      );
    }
    return null;
  };
  return (
    <SidebarContext.Provider value={{ showSidebar, handleToggleSidebar }}>
      <div
        //  style={{
        //   scrollbarWidth: "thin",
        //   scrollbarColor: "transparent transparent",
        // }}
       className="flex h-screen">
        {renderSidebar()}
        <main
       
         className="flex-1 h-screen overflow-y-scroll">
          {children}
          <Outlet />
        </main>
      </div>
    </SidebarContext.Provider>
  );
};

export default Layout;
