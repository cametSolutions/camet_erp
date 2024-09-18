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
      }
    );

    if (selectedOrg.type === "self") {
      navItems.push({
        to: "/pUsers/hsnList",
        tab: "hsn",
        icon: <HiDocumentText />,
        label: "Tax classification",
      });
    }

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

    navItems.push(
      {
        to: "/pUsers/additionalChargesList",
        tab: "additionalCharge",
        icon: <GiMoneyStack />,
        label: "Additional Charges",
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

        {/* <div className="flex flex-col items-center mt-6 -mx-2">
          <img
            className="object-cover w-24 h-24 mx-2 rounded-full"
            // src="https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg"
            src={
              selectedOrg?.logo ||
              "https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg"
            }
            alt="avatar"
          />
          <h4 className="mx-2 mt-2 font-medium text-white dark:text-gray-200">
            {userData?.userName}
          </h4>
          <p className="mx-2 mt-1 text-sm font-medium text-white dark:text-gray-400">
            {userData?.email}
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
            {selectedOrg?.name || "No Company Added"}

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
                className="z-10 absolute mt-2    divide-y divide-gray-100 rounded-lg shadow w-44 bg-gray-700"
              >
                <ul
                  class="py-2 text-sm text-white dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  {organizations.map((el, index) => (
                    <li key={index}>
                      <a
                        onClick={() => {
                          setDropdown(!dropdown);
                          if (window.innerWidth <= 640) {
                            setShowSidebar(!showSidebar);
                          }
                          setLoader(true);
                          setTimeout(() => {
                            setSelectedOrg(el);
                            dispatch(setSelectedOrganization(el));
                            navigate("/pUsers/dashboard");
                            setLoader(false);
                          }, 1000);
                        }}
                        // onClick={() => handleDropDownchange(el)}
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-500 "
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
        </div> */}

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
