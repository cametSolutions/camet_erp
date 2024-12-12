/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  setSecSelectedOrganization,
  removeSecSelectedOrg,
} from "../../../slices/secSelectedOrgSlice";
import { Link } from "react-router-dom";
import { RingLoader } from "react-spinners";
import { IoMdSettings } from "react-icons/io";
import { IoIosArrowDown, IoIosArrowUp, IoIosPricetags } from "react-icons/io";
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
import { FaHome } from "react-icons/fa";
import { FaAngleRight } from "react-icons/fa";
import { MdOutlineSecurity } from "react-icons/md";
import { LuTimerReset } from "react-icons/lu";
import { SiHelpscout } from "react-icons/si";
import { GrInfo } from "react-icons/gr";
import { IoMdPower } from "react-icons/io";
import Swal from "sweetalert2";
import { RiBox3Fill } from "react-icons/ri";
import { TiUserAdd } from "react-icons/ti";
import { MdHomeRepairService } from "react-icons/md";


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
  const [open, setOpen] = useState(true);

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

  const securityItems = [
    {
      to: "/sUsers/dashboard",
      tab: "passcode",
      icon: <MdOutlineSecurity />,
      label: "Passcode",
    },
    {
      to: "/sUsers/dashboard",
      tab: "resetPassword",
      icon: <LuTimerReset />,
      label: "Reset Password",
    },
  ];
  const supportItems = [
    {
      to: "/sUsers/dashboard",
      tab: "help",
      icon: <SiHelpscout />,
      label: "Help",
    },
    {
      to: "/sUsers/dashboard",
      tab: "About",
      icon: <GrInfo />,
      label: "About",
    },
    {
      to: "#",
      tab: "logout",
      icon: <IoMdPower />,
      label: "Log Out",
    },
  ];

  if (companies && companies.length > 0 && org.isApproved === true) {
    const additionalTabs = [
      // {
      //   to: "/sUsers/partyList",
      //   tab: "addParty",
      //   icon: <TiUserAdd />,
      //   label: "Customers",
      // },
      // {
      //   to: "/sUsers/hsnList",
      //   tab: "hsn",
      //   icon: <HiDocumentText />,
      //   label: "Tax classification",
      // },
      // {
      //   to: "/sUsers/productList",
      //   label: "Products",
      //   icon: <RiBox3Fill/>,
      //   tab: "product",
      // }
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
    // if (org.type === "self") {
    //   additionalTabs.push({
    //     to: "/sUsers/additionalChargesList",
    //     label: "Ledger",
    //     icon: <MdHomeRepairService />,
    //     tab: "ledger",
    //   });
    // }
    //   additionalTabs.push({
    //     to: "#",
    //     icon: <MdOutlineInventory />,
    //     label: "Inventory",
    //     onClick: () => toggleSection("inventory"),
    //     subItems: [
    //       // {
    //       //   to: "/sUsers/productList",
    //       //   label: "Products",
    //       //   icon: <RiBox3Fill />,
    //       //   tab: "product",
    //       // },
    //       {
    //         to: "/sUsers/brand",
    //         label: "Brand",
    //         icon: <TbBrandAppgallery />,
    //         tab: "brand",
    //       },
    //       {
    //         to: "/sUsers/category",
    //         label: "Category",
    //         icon: <BiSolidCategoryAlt />,
    //         tab: "category",
    //       },
    //       {
    //         to: "/sUsers/subcategory",
    //         label: "Sub Category",
    //         icon: <TbCategory2 />,
    //         tab: "subcategory",
    //       },
    //       {
    //         to: "/sUsers/godown",
    //         label: "Godown",
    //         icon: <HiBuildingStorefront />,
    //         tab: "godown",
    //       },
    //       {
    //         to: "/sUsers/pricelevel",
    //         label: "Price Level",
    //         icon: <IoIosPricetags />,
    //         tab: "pricelevel",
    //       },
    //     ],
    //   });
    // }
    // else {
    //   additionalTabs.push({
    //     to: "/sUsers/productList",
    //     label: "Products",
    //     icon: <RiBox3Fill />,
    //     tab: "product",
    //   });
    // }
    additionalTabs.push({
      to: "/sUsers/settings",
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
    Swal.fire({
      title: "Are you sure?",
      text: "You want to logout!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancel",
      confirmButtonText: "Yes, logout!",
    }).then(async (result) => {
      if (result.isConfirmed) {
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
          toast.error(
            error.response?.data?.message || "An error occurred during logout"
          );
        }
      }
    });
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

        {/* {item.subItems && expandedSections.inventory && (
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
        )} */}
      </>
    );
  };

  return (
    <div ref={sidebarRef} className="nonPrintable-content">
      {loader && (
        <div className="absolute top-0 w-screen h-screen z-50 flex justify-center items-center bg-black/[0.5] ">
          <RingLoader color="#1c14a0" />
        </div>
      )}
      <div
        className={`${
          showSidebar
            ? "z-50 absolute h-[125vh] transform translate-x-0"
            : "-translate-x-full md:translate-x-0 z-50 absolute md:relative"
        } ${
          open ? "w-64" : "w-28"
        } transition-all duration-700 ease-in-out flex flex-col h-screen p-1 bg-[#0b1d34] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-[#0B1D34] scrollbar-thumb-[#30435e]`}
        style={{
          //   scrollbarWidth: "thin",
          // scrollbarColor: "gray #0B1D34",
          transitionProperty: "width, transform", // Add width transition explicitly
          // '::-webkit-scrollbar': {
          //   width: '1px'
          // }
        }}
      >
        {/* company head */}
        <CametHead
          handleSidebarItemClick={handleSidebarItemClick}
          open={open}
          setOpen={setOpen}
        />

        {/* <Popover/> */}

        {/* user profile section */}

        <ProfileSection
          org={org}
          userData={userData}
          handleDropDownchange={handleDropDownchange}
          handleLogout={handleLogout}
          open={open}
        />

        <div
          className={`flex flex-col   flex-1  my-3  ${
            !open ? "items-center  mt-1" :"mt-9"
          } `}
        >
          <p className="text-sm text-gray-400 px-4">
            Menu
          </p>

          {/* my accounts */}
          <nav>
            {navItems.map((item, index) => (
              <div key={index}>
                <SidebarCard
                  item={item}
                  tab={tab}
                  expandedSections={expandedSections}
                  handleSidebarItemClick={handleSidebarItemClick}
                />
              </div>
            ))}
          </nav>

          {/* security items */}
          <p className="text-sm text-gray-400 mt-7 px-4">Security</p>

          <nav>
            {securityItems.map((item, index) => (
              <div key={index}>
                <SidebarCard
                  item={item}
                  tab={tab}
                  expandedSections={expandedSections}
                  handleSidebarItemClick={handleSidebarItemClick}
                />
              </div>
            ))}
          </nav>

          {/* suport items */}
          <p className="text-sm text-gray-400 mt-7 px-4">Support</p>

          <nav>
            {supportItems.map((item, index) => (
              <div key={index}>
                <SidebarCard
                  item={item}
                  tab={tab}
                  expandedSections={expandedSections}
                  handleSidebarItemClick={handleSidebarItemClick}
                />
              </div>
            ))}
          </nav>

          {/* version */}
          <hr className="mt-4 mb-2 border mx-2 border-gray-700" />

          <div className="flex flex-col items-center px-4 bg-slate-800 py-1 ">
            <h3 className="text-[10px] text-gray-400  tracking-widest">
              Version 0.0.4
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SidebarSec;
