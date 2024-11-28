/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect, useCallback } from "react";
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
import { RingLoader } from "react-spinners";
import { IoMdSettings } from "react-icons/io";
import { IoIosArrowDown, IoIosArrowUp, IoIosPricetags } from "react-icons/io";
import { RiBox3Fill } from "react-icons/ri";
import { TbBrandAppgallery, TbCategory2 } from "react-icons/tb";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { HiBuildingStorefront, HiDocumentText } from "react-icons/hi2";
import { MdOutlineInventory } from "react-icons/md";

import { removeAll } from "../../../slices/invoiceSecondary";
import { removeAllSales } from "../../../slices/salesSecondary";
import { removeAll as removeAllStock } from "../../../slices/stockTransferSecondary";
import { removeAll as removeAllPurchase } from "../../../slices/purchase";
import { removeAll as removeAllCredit } from "../../../slices/creditNote";
import CametHead from "../sidebar/CametHead";
import ProfileSection from "../sidebar/ProfileSection";

function SidebarSec({ TAB, showBar }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [userData, setUserData] = useState({});
  const [dropdown, setDropdown] = useState(false);
  const [org, setOrg] = useState("");
  const [loader, setLoader] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    inventory: false,
  });

  const selectedTab = localStorage.getItem("selectedSecondatSidebarTab");
  const [selectedSubTab, setSelectedSubTab] = useState(
    localStorage.getItem("selectedSubTab") || ""
  );

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
        to: "/sUsers/hsnList",
        tab: "hsn",
        icon: <HiDocumentText />,
        label: "Tax classification",
      },
    ];

    // if (org.type === "self") {
    //   additionalTabs.push({
    //     to: "/sUsers/hsnList",
    //     tab: "hsn",
    //     icon: <HiDocumentText />,
    //     label: "Tax classification",
    //   });
    // }

    // Show "Inventory" only if org.type is "self"
    if (org.type === "self") {
      additionalTabs.push({
        to: "#",
        icon: <MdOutlineInventory />,
        label: "Inventory",
        onClick: () => toggleSection("inventory"),
        subItems: [
          {
            to: "/sUsers/productList",
            label: "Products",
            icon: <RiBox3Fill />,
            tab: "product",
          },
          {
            to: "/sUsers/brand",
            label: "Brand",
            icon: <TbBrandAppgallery />,
            tab: "brand",
          },
          {
            to: "/sUsers/category",
            label: "Category",
            icon: <BiSolidCategoryAlt />,
            tab: "category",
          },
          {
            to: "/sUsers/subcategory",
            label: "Sub Category",
            icon: <TbCategory2 />,
            tab: "subcategory",
          },
          {
            to: "/sUsers/godown",
            label: "Godown",
            icon: <HiBuildingStorefront />,
            tab: "godown",
          },
          {
            to: "/sUsers/pricelevel",
            label: "Price Level",
            icon: <IoIosPricetags />,
            tab: "pricelevel",
          },
        ],
      });
    } else {
      additionalTabs.push({
        to: "/sUsers/productList",
        label: "Products",
        icon: <RiBox3Fill />,
        tab: "product",
      });
    }
    additionalTabs.push({
      to: "/sUsers/OrderConfigurations",
      tab: "terms",
      icon: <IoMdSettings />,
      label: "Settings",
    });

    additionalTabs.forEach((item) => {
      navItems.push(item);
    });
  }

  const getUserData = useCallback(async () => {
    try {
      const res = await api.get("/api/sUsers/getSecUserData", {
        withCredentials: true,
      });
      setUserData(res?.data?.data?.userData);
      setCompanies(res?.data?.data?.userData.organization);

      if (!prevOrg) {
        setOrg(res.data.data.userData.organization[0]);
        dispatch(
          setSecSelectedOrganization(res.data.data.userData.organization[0])
        );
      } else {
        setOrg(prevOrg);
      }
    } catch (error) {
      console.log(error);
    }
  }, [prevOrg, dispatch]);

  useEffect(() => {
    if (!userData || !userData.name) {
      getUserData();
    }
  }, [getUserData, userData]);

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

  const toggleSection = (section) => {
    setExpandedSections((prevSections) => ({
      ...prevSections,
      [section]: !prevSections[section],
    }));
  };

  const handleSidebarItemClick = (newTab) => {
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }

    setTab(newTab);
    localStorage.setItem("selectedSecondatSidebarTab", newTab);
    dispatch(removeAll());
    dispatch(removeAllSales());
    dispatch(removeAllStock());
    dispatch(removeAllPurchase());
    dispatch(removeAllCredit());

    localStorage.removeItem("SecondaryTransactionEndDate");
    localStorage.removeItem("SecondaryTransactionStartDate");
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
        <div className="absolute top-0 w-screen h-screen z-50 flex justify-center items-center bg-[#0C1E36]">
          <RingLoader color="#1c14a0" />
        </div>
      )}
      <div
        className={`${
          showSidebar
            ? "z-50 absolute h-[125vh] transform translate-x-0"
            : "-translate-x-full md:translate-x-0 z-50 absolute md:relative"
        }   transition-transform  duration-500 ease-in-out flex flex-col w-64 h-screen p-1   bg-gray-900   overflow-y-auto `}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* company head */}
        <CametHead handleSidebarItemClick={handleSidebarItemClick} />

        {/* user profile section */}

        <ProfileSection
          org={org}
          userData={userData}
          dropdown={dropdown}
          setDropdown={setDropdown}
          handleDropDownchange={handleDropDownchange}
          handleLogout={handleLogout}
        />

     

        <hr className=" border border-gray-800 mt-1 " />

        <div className="flex flex-col justify-between flex-1 mt-3 px-5">
          <nav>
            {navItems.map((item, index) => (
              <div key={index}>
                <Link to={item.to}>
                  <span
                    onClick={() => {
                      handleSidebarItemClick(item.tab);
                      if (item.onClick) item.onClick();
                    }}
                    className={`
                        ${
                          tab === item.tab
                            ? "bg-gray-800 text-white"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }
                        flex items-center px-4 py-2 mt-5 transition-colors duration-300 transform rounded-md`}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="mx-4 font-medium">{item.label}</span>
                    </div>
                    {item.subItems && (
                      <div className="flex items-center justify-between w-full cursor-pointer ml-6">
                        {expandedSections.inventory ? (
                          <IoIosArrowUp />
                        ) : (
                          <IoIosArrowDown />
                        )}
                      </div>
                    )}
                  </span>
                </Link>
                {item.subItems && expandedSections.inventory && (
                  <ul className="mt-2 space-y-2">
                    {item.subItems.map((subItem, subIndex) => (
                      <li
                        key={subIndex}
                        className={`${
                          selectedSubTab === subItem.tab
                            ? "text-white"
                            : "text-gray-400"
                        } hover:text-white ml-4 rounded-md mt-5 px-4 py-2 flex items-center gap-4 text-sm font-medium`}
                      >
                        <Link
                          className="flex items-center gap-3 mb-3"
                          to={subItem.to}
                          onClick={() => {
                            handleSidebarItemClick(subItem.tab);
                            setTab(item.tab);
                            setSelectedSubTab(subItem.tab);
                          }}
                        >
                          {subItem.icon}
                          <span>{subItem.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default SidebarSec;
