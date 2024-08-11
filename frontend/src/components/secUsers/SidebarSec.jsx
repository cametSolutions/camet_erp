/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  setSecSelectedOrganization,
  removeSecSelectedOrg,
} from "../../../slices/secSelectedOrgSlice";
import { Link } from "react-router-dom";
import { IoReorderThreeSharp } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { TiUserAdd } from "react-icons/ti";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { RingLoader } from "react-spinners";
import { IoMdSettings } from "react-icons/io";

import { removeAll } from "../../../slices/invoiceSecondary";
import { removeAllSales } from "../../../slices/salesSecondary";
import { removeAll as removeAllStock } from "../../../slices/stockTransferSecondary";

function SidebarSec({ TAB, showBar }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [userData, setUserData] = useState({});
  const [dropdown, setDropdown] = useState(false);
  const [org, setOrg] = useState("");
  const [loader, setLoader] = useState(false);
  const [companies, setCompanies] = useState([]);

  const selectedTab=localStorage.getItem("selectedSecondatSidebarTab")

  const [tab, setTab] = useState(selectedTab);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const prevOrg = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );


  const navItems = [
    {
      to: "/sUsers/dashboard",
      tab: "dash",
      icon: <MdDashboard />,
      label: "Dashboard",
    },
  ];

  if (companies && companies.length > 0 && org.isApproved === true) {
    const additionalTabs = [
      {
        to: "/sUsers/partyList",
        tab: "addParty",
        icon: <TiUserAdd />,
        label: "Customers",
      },
      {
        to: "/sUsers/productList",
        label: "Products",
        icon: <MdOutlineProductionQuantityLimits />,
        tab: "product",
      },
      {
        to: "/sUsers/OrderConfigurations",
        tab: "terms",
        icon: <IoMdSettings />,
        label: "Settings",
      },
    ];

    additionalTabs.map((item) => {
      return navItems.push(item);
    });
  }



  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await api.get("/api/sUsers/getSecUserData", {
          withCredentials: true,
        });
        setUserData(res?.data?.data?.userData);
        setCompanies(res?.data?.data?.userData.organization);

        if (prevOrg == "" || prevOrg == null) {
          setOrg(res.data.data.userData.organization[0]);
          dispatch(
            setSecSelectedOrganization(res.data.data.userData.organization[0])
          );
        } else {
          25;
          setOrg(prevOrg);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getUserData();
  }, []);

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
    localStorage.setItem("selectedPrimarySidebarTab", newTab);
    dispatch(removeAll());
    dispatch(removeAllSales());
    dispatch(removeAllStock());
    // onTabChange(newTab);
  };

  const handleLogout = async () => {
    try {
      const res = await api.post(
        "/api/sUsers/logout",
        {},
        {
          withCredentials: true,
        }
      );
      toast.success(res.data.message);
      localStorage.removeItem("sUserData");
      dispatch(removeSecSelectedOrg());
      navigate("/sUsers/login");
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  };

  const handleDropDownchange = (el) => {

    setDropdown(!dropdown);
    if (window.innerWidth <= 640) {
      setShowSidebar(!showSidebar);
    }
    setLoader(true);
    setTimeout(() => {
      setOrg(el);
      dispatch(setSecSelectedOrganization(el));
      navigate("/sUsers/dashboard");
      setLoader(false);
    }, 1000);
  };

  return (
    <div className="nonPrintable-content">
      {loader && (
        <div className=" absolute top-0 w-screen h-screen z-50  flex justify-center items-center bg-black/[0.5]">
          <RingLoader color="#1c14a0" />
        </div>
      )}

      <aside
        className={` ${
          showSidebar
            ? "z-50 absolute h-[125vh] transform translate-x-0 "
            : "-translate-x-full md:translate-x-0  z-50 absolute md:relative "
        } transition-transform duration-500 ease-in-out flex flex-col w-64 h-screen  px-4 py-8  bg-gray-900 border-r rtl:border-r-0 rtl:border-l dark:bg-gray-900 dark:border-gray-700   
          
        overflow-y-auto`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="w-full relative">
          <div
            onClick={handleSidebarItemClick}
            className="text-white text-3xl absolute right-0 top-[-20px]  md:hidden  "
          >
            <IoReorderThreeSharp />
          </div>
        </div>

        {/* <a href="#" className="mx-auto">
          <img
            className="w-auto h-6 sm:h-7"
            src="https://merakiui.com/images/full-logo.svg"
            alt=""
          />
        </a> */}

        <div className="flex flex-col items-center mt-6 -mx-2">
          <img
            className="object-cover w-24 h-24 mx-2 rounded-full"
            src={
              org?.logo ||
              "https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg"
            }
            alt="avatar"
          />
          <h4 className="mx-2 mt-2 font-medium text-white">{userData.name}</h4>
          <p className="mx-2 mt-1 text-sm font-medium text-white">
            {userData.email}
          </p>

          <button
            onClick={() => {
              setDropdown(!dropdown);
            }}
            id="dropdownDefaultButton"
            data-dropdown-toggle="dropdown"
            className="text-white mt-6 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="button"
          >
            {org?.name || "No company added"}{" "}
            <svg
              class="w-2.5 h-2.5 ms-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>

          {dropdown && (
            <div
              className="relative flex justify-center
              "
            >
              <div
                id="dropdown"
                className="z-10 absolute mt-2   bg-gray-700 divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
              >
                <ul
                  class="py-2 text-sm text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  {userData &&
                    userData?.organization?.map((el, index) => (
                      <li key={index}>
                        <a
                          // onClick={()=>{setDropdown(!dropdown);setOrg(el)}}
                          onClick={() => handleDropDownchange(el)}
                          href="#"
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          {el.name}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}

          <div>
            <button onClick={handleLogout} class="Btn">
              <div class="sign">
                <svg viewBox="0 0 512 512">
                  <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                </svg>
              </div>

              <div class="text">Logout</div>
            </button>
          </div>
        </div>

        <div className="">
          <div className="flex flex-col justify-between flex-1 mt-6  ">
          <nav>
              {navItems.map((item, index) => (
                <div key={index}>
                  <Link to={item.to}>
                    <a
                      onClick={() => {
                        // setSelectedTab(item.tab);
                        handleSidebarItemClick(item.tab);
                        if (item.onClick) item.onClick();
                      }}
                      className={`

                        ${
                          tab===item.tab
                            ? "bg-gray-800 text-white"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }
                       
                       text-gray-400 flex items-center px-4 py-2 mt-5 transition-colors duration-300 transform rounded-lg`}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="mx-4 font-medium">{item.label}</span>
                      </div>
                 
                    </a>
                  </Link>
                
                </div>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default SidebarSec;
