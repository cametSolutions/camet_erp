/* eslint-disable react/prop-types */
// src/components/Layout.js
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/homePage/Sidebar";
import SidebarSec from "../components/secUsers/SidebarSec";

const Layout = ({ children }) => {
  const location = useLocation();
  console.log(location);

  const renderSidebar = () => {
    if (location.pathname.includes("/pUsers/")) {
      return <Sidebar />;
    } else if (location.pathname.includes("/sUsers/")) {
      return <SidebarSec />;
    }
    return null; // or a default sidebar if needed
  };
  return (
    <div className="flex h-screen">
      {renderSidebar()}
      <main className="flex-1 h-screen overflow-y-scroll">
        {children}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
