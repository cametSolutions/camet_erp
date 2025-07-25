/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { FaAngleRight } from "react-icons/fa";
import { IoMdPower } from "react-icons/io";
import CametAdminHead from "../sidebar/CametAdminHead";

function AdminSidebar({ showBar }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [open, setOpen] = useState(false);
  const selectedTab = localStorage.getItem("selectedSecondatSidebarTab");
  const [tab, setTab] = useState(selectedTab);

  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowSidebar(false);
      }
    };

    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [sidebarRef, setShowSidebar]);

  const navItems = [
    {
      to: "/sUsers/dashboard",
      tab: "dash",
      icon: <FaHome />,
      label: "Home",
    },
  ];

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    // Example: Clear localStorage, redirect to login, etc.
    localStorage.removeItem("selectedSecondatSidebarTab");
    // window.location.href = "/login";
  };

  useEffect(() => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  }, [showBar]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  }, []);

  const handleSidebarItemClick = (newTab) => {
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
    setTab(newTab);
  };

  const SidebarCard = ({
    item,
    tab,
    expandedSections,
    handleSidebarItemClick,
  }) => {
    return (
      <>
        <Link to={item.to}>
          <span
            onClick={() => {
              if (item.tab === "logout") {
                handleLogout();
              } else {
                handleSidebarItemClick(item.tab);
              }
            }}
            className={`${
              tab === item.tab
                ? `text-blue-500 ${
                    open ? "border-r-2 border-blue-500 bg-gray-800" : ""
                  }`
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            } flex items-center w-full py-2 mt-3 transition-all duration-300 transform text-[13.5px] h-10 ${
              open && "pl-5"
            }`}
          >
            {open ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center ">
                  <span className="text-lg">{item.icon}</span>
                  <span className=" transition-all mx-4 font-medium origin-left duration-500 ease-in-out">
                    {item.label}
                  </span>
                </div>
                <span className="mx-4 font-medium ">
                  <FaAngleRight />
                </span>
              </div>
            ) : (
              <div className="flex justify-center text-lg">{item.icon}</div>
            )}

            {item.subItems && (
              <div
                className={`flex flex-col ml-6 overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                  expandedSections.inventory ? "max-h-[500px]" : "max-h-0"
                }`}
              >
                {item.subItems.map((subItem, index) => (
                  <div key={index} className="py-1">
                    {subItem.label}
                  </div>
                ))}
              </div>
            )}
          </span>
        </Link>
      </>
    );
  };

  const LogoutButton = () => {
    return (
      <div
        onClick={handleLogout}
        className="flex items-center w-full py-2 mt-3 transition-all duration-300 transform text-[13.5px] h-10 text-red-400 hover:bg-red-900 hover:text-red-300 cursor-pointer"
      >
        {open ? (
          <div className="flex items-center justify-between w-full pl-5">
            <div className="flex items-center">
              <span className="text-lg">
                <IoMdPower />
              </span>
              <span className="transition-all mx-4 font-medium origin-left duration-500 ease-in-out">
                Logout
              </span>
            </div>
            <span className="mx-4 font-medium">
              <FaAngleRight />
            </span>
          </div>
        ) : (
          <div className="flex justify-center w-full text-lg">
            <IoMdPower />
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={sidebarRef} className="nonPrintable-content">
      <div
        className={`${
          showSidebar
            ? "z-50 absolute h-[125vh] transform translate-x-0"
            : "-translate-x-full md:translate-x-0 z-50 absolute md:relative"
        } ${
          open ? "w-64" : "w-[80px]"
        } transition-all duration-700 ease-in-out flex flex-col h-screen p-1 bg-[#222437] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-[#0B1D34] scrollbar-thumb-[#30435e]`}
        style={{
          transitionProperty: "width, transform",
        }}
      >
        {/* company head */}
        <CametAdminHead
          handleSidebarItemClick={handleSidebarItemClick}
          open={open}
          setOpen={setOpen}
          isAdmin={true}
        />

        <div className="flex flex-col flex-1 my-3">
          <div
            className={`${
              !open ? " flex  flex-col items-center mt-1" : "mt-9"
            }`}
          >
            <p className="text-sm text-gray-400 px-4">Menu</p>

            {/* my accounts */}
            <nav>
              {navItems.map((item, index) => (
                <div key={index}>
                  <SidebarCard
                    item={item}
                    tab={tab}
                    handleSidebarItemClick={handleSidebarItemClick}
                  />
                </div>
              ))}
            </nav>
          </div>

          {/* Spacer to push content to bottom */}
          <div className="flex-1"></div>

          {/* Bottom section - always at bottom */}
          <div className="mt-auto">
            <hr className="mb-2 border mx-2 border-gray-700" />

            {/* Logout Button */}
            <LogoutButton />

            {/* Version - always at bottom */}
            <div className="flex flex-col items-center px-4 bg-slate-800 py-1 mt-2">
              <h3 className="text-[10px] text-gray-400 tracking-widest text-center">
                Version 0.0.4
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar;
