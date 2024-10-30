/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect, useCallback } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { BsFillBuildingsFill } from "react-icons/bs";
import { SlUserFollow } from "react-icons/sl";
import { PiBankFill } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { removeSelectedOrganization } from "../../../slices/PrimarySelectedOrgSlice";
import { setSelectedOrganization } from "../../../slices/PrimarySelectedOrgSlice";
import { IoReorderThreeSharp } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { TiUserAdd } from "react-icons/ti";
import { HiDocumentText } from "react-icons/hi2";
import { RingLoader } from "react-spinners";
import { GiMoneyStack } from "react-icons/gi";
import { IoMdSettings } from "react-icons/io";
import { TbBrandAppgallery } from "react-icons/tb";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { TbCategory2 } from "react-icons/tb";
import { RiBox3Fill } from "react-icons/ri";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp, IoIosPricetags } from "react-icons/io";
import { HiBuildingStorefront } from "react-icons/hi2";
import { MdOutlineInventory } from "react-icons/md";
import Header from "../common/sidebar/Header";

function Sidebar({ TAB, showBar }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [userData, setUserData] = useState({});
  const [dropdown, setDropdown] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [loader, setLoader] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    inventory: false,
  });

  const selectedOrgFromRedux = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg
  );
  const [selectedTab, setSelectedTab] = useState(
    localStorage.getItem("selectedPrimarySidebarTab") || ""
  );
  const [selectedSubTab, setSelectedSubTab] = useState(
    localStorage.getItem("selectedSubTab") || ""
  );


  const navItems = [
    {
      to: "/pUsers/dashboard",
      tab: "dash",
      icon: <MdDashboard />,
      label: "Dashboard",
    },
    {
      to: "/pUsers/organizationList",
      tab: "orgList",
      icon: <BsFillBuildingsFill />,
      label: "Company",
    },
  ];

  if (
    organizations &&
    organizations.length > 0 &&
    selectedOrgFromRedux?.isApproved === true
  ) {
    navItems.push(
      {
        to: "/pUsers/retailers",
        tab: "addSec",
        icon: <SlUserFollow />,
        label: "Users",
      },
      {
        to: "/pUsers/bankList",
        tab: "addBank",
        icon: <PiBankFill />,
        label: "Banks",
      },
      {
        to: "/pUsers/partyList",
        tab: "addParty",
        icon: <TiUserAdd />,
        label: "Customers",
      },

      {
        to: "/pUsers/hsnList",
        tab: "hsn",
        icon: <HiDocumentText />,
        label: "Tax classification",
      }
    );

    // if (selectedOrg.type === "self") {
    //   navItems.push({
    //     to: "/pUsers/hsnList",
    //     tab: "hsn",
    //     icon: <HiDocumentText />,
    //     label: "Tax classification",
    //   });
    // }

    if (selectedOrg.type === "self") {

    navItems.push({
      to: "#",
      // tab: "product",
      icon: <MdOutlineInventory />,
      label: "Inventory",
      onClick: () => toggleSection("inventory"),
      subItems: [
        {
          to: "/pUsers/productList",
          label: "Products",
          icon: <RiBox3Fill />,
          tab: "product",
        },
        {
          to: "/pUsers/brand",
          label: "Brand",
          icon: <TbBrandAppgallery />,
          tab: "brand",
        },
        {
          to: "/pUsers/category",
          label: "Category",
          icon: <BiSolidCategoryAlt />,
          tab: "category",
        },
        {
          to: "/pUsers/subcategory",
          label: "Sub Category",
          icon: <TbCategory2 />,
          tab: "subcategory",
        },
        {
          to: "/pUsers/godown",
          label: "Godown",
          icon: <HiBuildingStorefront />,
          tab: "godown",
        },
        {
          to: "/pUsers/pricelevel",
          label: "Price Level",
          icon: <IoIosPricetags />,
          tab: "pricelevel",
        },
      ],
    });

  }else{


    // if it is self no need to show inventory but  to show the products only

    navItems.push(  {
      to: "/pUsers/productList",
      label: "Products",
      icon: <RiBox3Fill />,
      tab: "product",
    });

  }

    navItems.push(
      {
        to: "/pUsers/additionalChargesList",
        tab: "additionalCharge",
        icon: <GiMoneyStack />,
        label: "Ledgers",
      },
      {
        to: "/pUsers/OrderConfigurations",
        tab: "terms",
        icon: <IoMdSettings />,
        label: "Settings",
      }
    );
  }

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (TAB == "addOrg") {
      expandedSections.addOrg = true;
    }
    if (TAB == "orgList") {
      expandedSections.addOrg = true;
    }
    if (TAB == "addSec") {
      expandedSections.addSec = true;
    }
    if (TAB == "agentLIst") {
      expandedSections.addSec = true;
    }
    if (TAB == "bankList") {
      expandedSections.addBank = true;
    }
  }, [TAB]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await api.get("/api/pUsers/getOrganizations", {
          withCredentials: true,
        });

        setOrganizations(res.data.organizationData);

        if (selectedOrgFromRedux) {
          setSelectedOrg(selectedOrgFromRedux);
        } else {
          // If no organization is selected, set the first organization as selectedOrg
          setSelectedOrg(res.data.organizationData[0]);
          dispatch(setSelectedOrganization(res.data.organizationData[0]));
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    fetchOrganizations();
  }, [selectedOrg]);


  const  getUserData =useCallback( async () => {
    try {
      const res = await api.get("/api/pUsers/getPrimaryUserData", {
        withCredentials: true,
      });
      setUserData(res.data.data.userData);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (!userData || !userData.userName) { // only make the API call if data is not already present
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

  useEffect(() => {
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  }, []);


  useEffect(() => {
    if (showSidebar) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [showSidebar]);

  const handleSidebarItemClick = (tab) => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
    localStorage.setItem("selectedPrimarySidebarTab", tab);
    localStorage.removeItem("PrimaryTransactionEndDate")
    localStorage.removeItem("PrimaryTransactionStartDate")
  };

  const handleLogout = async () => {
    try {
      const res = await api.post(
        "/api/pUsers/primaryUserLogout",
        {},
        {
          withCredentials: true,
        }
      );
      toast.success(res.data.message);
      localStorage.removeItem("pUserData");
      dispatch(removeSelectedOrganization());
      navigate("/pUsers/login");
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prevSections) => ({
      ...prevSections,
      [section]: !prevSections[section],
    }));
  };



  return (
    <div className="relative">
      {loader && (
        <div className=" absolute top-0 w-screen h-screen z-50  flex justify-center items-center bg-black/[0.5]">
          <RingLoader color="#1c14a0" />
        </div>
      )}
      {/* <div className=" absolute top-0 w-screen h-screen z-50  flex justify-center items-center bg-black/[0.5]">
        <RingLoader color="#1c14a0" />
      </div> */}

      <aside
        className={` ${
          showSidebar
            ? "z-50 absolute h-[125vh] transform translate-x-0 "
            : "-translate-x-full md:translate-x-0  z-40 absolute md:relative "
        }  transition-transform duration-500 ease-in-out flex flex-col w-64 h-screen  px-4 py-8  bg-gray-900  border-r rtl:border-r-0 rtl:border-l dark:bg-gray-900 dark:border-gray-700   
          
        overflow-y-auto`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="w-full sticky top-0">
          <div
            onClick={handleSidebarItemClick}
            className="text-white text-3xl absolute right-0 top-[-20px]  md:hidden  "
          >
            <IoReorderThreeSharp />
          </div>
        </div>

    

        <Header
          selectedOrg={selectedOrg}
          userData={userData}
          setDropdown={setDropdown}
          dropdown={dropdown}
          organizations={organizations}
          setShowSidebar={setShowSidebar}
          setLoader={setLoader}
          setSelectedOrg={setSelectedOrg}
          dispatch={dispatch}
          navigate={navigate}
          setSelectedOrganization={setSelectedOrganization}
          showSidebar={showSidebar}
          handleLogout={handleLogout}
        />

        <div className="">
          <div className="flex flex-col justify-between flex-1 mt-6  ">
            <nav>
              {navItems.map((item, index) => (
                <div key={index}>
                  <Link to={item.to}>
                    <a
                      onClick={() => {
                        setSelectedTab(item.tab);
                        handleSidebarItemClick(item.tab);
                        if (item.onClick) item.onClick();
                      }}
                      className={`${
                        selectedTab === item.tab
                          ? "bg-gray-800 text-white"
                          : "text-gray-400"
                      } hover:bg-gray-800 hover:text-white flex items-center px-4 py-2 mt-5 transition-colors duration-300 transform rounded-lg`}
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
                    </a>
                  </Link>
                  {item.subItems && expandedSections.inventory && (
                    <ul className="mt-2 space-y-2">
                      {item.subItems.map((subItem, subIndex) => (
                        <li
                          key={subIndex}
                          className={`${
                            selectedSubTab === subItem.tab
                              ? " text-white"
                              : "text-gray-400"
                          }  hover:text-white ml-4 rounded-md mt-5 px-4 py-2 flex items-center gap-4 text-sm font-medium`}
                          href="#"
                        >
                          <Link
                            className="flex items-center gap-3 mb-3"
                            to={subItem.to}
                            onClick={() => {
                              handleSidebarItemClick;
                              setSelectedTab(item.tab);
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
      </aside>
    </div>
  );
}

export default Sidebar;
