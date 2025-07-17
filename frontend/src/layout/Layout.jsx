/* eslint-disable react/prop-types */
// src/components/Layout.js
import { Outlet } from "react-router-dom";
import Sidebar from "../components/homePage/Sidebar";
import SidebarSec from "../components/secUsers/SidebarSec";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
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
      return <SidebarSec showBar={showSidebar} handleToggleSidebar={handleToggleSidebar} />;
    } else if (location.pathname.includes("/admin/")) {
      console.log("Rendering Admin Sidebar");
      
      return (
        <AdminSidebar
          showBar={showSidebar}
          handleToggleSidebar={handleToggleSidebar}
        />
      );
    }
    return null;
  };

  const renderHeader = () => {
    if (location.pathname.includes("/admin/")) {
      return <AdminHeader title="Admin Dashboard" />;
    }
    return null;
  };

  return (
    <SidebarContext.Provider value={{ showSidebar, handleToggleSidebar }}>
      <div className="flex h-screen w-screen overflow-hidden"> 
        {renderSidebar()}
        <div className="flex-1 flex flex-col min-w-0">
          {renderHeader()}
          <main className="flex-1 overflow-y-auto overflow-x-auto">
            {children}
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Layout;