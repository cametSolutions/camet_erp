/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { BsFillBuildingsFill } from "react-icons/bs";
import { FaEye } from "react-icons/fa6";
import { SlUserFollow } from "react-icons/sl";
import { IoIosCreate } from "react-icons/io";
import { GiTakeMyMoney } from "react-icons/gi";
import { PiBankFill } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { removeSelectedOrganization } from "../../../slices/PrimarySelectedOrgSlice";
import { setSelectedOrganization } from "../../../slices/PrimarySelectedOrgSlice";
import { IoReorderThreeSharp } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { TiUserAdd } from "react-icons/ti";
import { HiDocumentText } from "react-icons/hi2";




function Sidebar({ TAB, showBar }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [userData, setUserData] = useState({});
  const [dropdown, setDropdown] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedOrgFromRedux = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg
  );

  const [expandedSections, setExpandedSections] = useState({
    orgList: false,
    addOrg: false,
    addSec: false,
    agentLIst: false,
    addBank: false,
    bankList: false,
  });


  const user = localStorage.getItem("pUserData");

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

  const handleToggleSection = (section) => {
    setExpandedSections((prevSections) => ({
      // ...prevSections,
      [section]: !prevSections[section],
    }));
  };

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

  useEffect(() => {
    fetchOrganizations();
    const getUserData = async () => {
      try {
        const res = await api.get("/api/pUsers/getPrimaryUserData", {
          withCredentials: true,
        });
        setUserData(res.data.data.userData);
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

  useEffect(() => {
    if (showSidebar) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [showSidebar]);

  const handleSidebarItemClick = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
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


  return (
    <div className="relative">
    

      <aside
        className={` ${
          showSidebar
            ? "z-50 absolute h-[125vh] transform translate-x-0 "
            : "-translate-x-full md:translate-x-0  z-50 absolute md:relative "
        }  transition-transform duration-500 ease-in-out flex flex-col w-64 h-screen  px-4 py-8  bg-gray-900  border-r rtl:border-r-0 rtl:border-l dark:bg-gray-900 dark:border-gray-700   
          
        overflow-y-auto`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="w-full relative">

        <div 
        onClick={handleSidebarItemClick}
        className="text-white text-3xl absolute right-0 top-[-20px]  md:hidden  ">
        <IoReorderThreeSharp/>
        </div>
        </div>
        <div className="flex flex-col items-center mt-6 -mx-2">
          <img
            className="object-cover w-24 h-24 mx-2 rounded-full"
            src="https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg"
            alt="avatar"
          />
          <h4 className="mx-2 mt-2 font-medium text-white dark:text-gray-200">
            {userData.userName}
          </h4>
          <p className="mx-2 mt-1 text-sm font-medium text-white dark:text-gray-400">
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
            {selectedOrg.name}

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
                          setSelectedOrg(el);
                          dispatch(setSelectedOrganization(el));
                        }}
                        // onClick={() => handleDropDownchange(el)}
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

                <Link to={"/pUsers/dashboard"}>
                <a
                  onClick={() => {
                    handleSidebarItemClick("outstanding");
                  }}
                  className={` ${
                    TAB === "dash"
                      ? "bg-gray-800 text-white"
                      : "text-gray-400"
                  } hover:bg-gray-800 hover:text-white flex items-center px-4 py-2 mt-5 transition-colors duration-300 transform rounded-lg   `}
                  href="#"
                >
                  <MdDashboard />

                  <span className="mx-4 font-medium">Dashboard</span>
                </a>
              </Link>
              <a
                onClick={() => {
                  // handleSidebarItemClick("addOrganizations");
                  handleToggleSection("addOrg");
                }}
                className={` ${
                  TAB === "addOrg" || TAB === "orgList"
                    ? "bg-gray-800 text-white"
                    : "text-gray-400"
                } hover:bg-gray-800 hover:text-white flex items-center px-4 py-2 mt-5 transition-colors duration-300 transform rounded-lg   `}
                href="#"
              >
                <BsFillBuildingsFill />
                <span className="mx-4 font-medium">Company</span>
              </a>
              {expandedSections.addOrg && (
                <div
                  className="pl-8 mt-2 text-white flex flex-col gap-1 pt-2 animate__animated animate__fadeIn"
                  style={{ animationDuration: "5s" }}
                >
                  {/* Add your sections here, for example: */}
                  <label
                    onClick={() => {
                      handleSidebarItemClick("organizationListLive");
                    }}
                    className={` ${
                      TAB === "addOrg" ? " bg-gray-800 text-white " : ""
                    } rounded-lg flex items-center mb-3 hover:bg-gray-800 hover:text-white  cursor-pointer p-2`}
                  >
                    <div className="flex items-center gap-2 ">
                      <IoIosCreate />
                      <Link to={"/pUsers/addOrganization"}>
                        <span className={`mr-2 p-2 `}>Create</span>
                      </Link>
                    </div>
                    <div className="custom-checkbox"></div>
                  </label>

                  <label
                    onClick={() => {
                      handleSidebarItemClick("organizationListBlocked");
                    }}
                    className={` ${
                      TAB === "orgList" ? " bg-gray-800 text-white " : ""
                    } rounded-lg flex items-center mb-3 hover:bg-gray-800 hover:text-white  cursor-pointer p-2`}
                  >
                    <div className="flex items-center  gap-2">
                      <FaEye className="" />
                      <Link to={"/pUsers/organizationList"}>
                        <span className="mr-2 p-2">Display</span>
                      </Link>
                    </div>
                    <div className="custom-checkbox"></div>
                    {/* Add your logic for blocked section */}
                  </label>
                </div>
              )}

              {/* <a
                onClick={() => {
                  handleSidebarItemClick("organizationList");
                }}
                className={` ${
                  TAB === "orgList" ? "bg-gray-800 text-white" : "text-gray-400"
                } hover:bg-gray-800 hover:text-white flex items-center px-4 py-2 mt-5 transition-colors duration-300 transform rounded-lg   `}
                href="#"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>

                <span className="mx-4 font-medium">Your organizations</span>
              </a> */}

              {/* <Link to={"/pUsers/addSecUsers"}> */}
              <a
                onClick={() => {
                  // handleSidebarItemClick("addAgents");
                  handleToggleSection("addSec");
                }}
                className={` ${
                  TAB === "addSec" ? "bg-gray-800 text-white" : "text-gray-400"
                } hover:bg-gray-800 hover:text-white flex items-center px-4 py-2 mt-5 transition-colors duration-300 transform rounded-lg   `}
                href="#"
              >
                <SlUserFollow />

                <span className="mx-4 font-medium">Retailers</span>
              </a>
              {expandedSections.addSec && (
                <div
                  className="pl-8 mt-2 text-white flex flex-col gap-2 pt-2 animate__animated animate__fadeIn"
                  style={{ animationDuration: "5s" }}
                >
                  {/* Add your sections here, for example: */}
                  <label
                    onClick={() => {
                      handleSidebarItemClick("organizationListLive");
                    }}
                    className={` ${
                      TAB === "addSec" ? " bg-gray-800 text-white " : ""
                    } rounded-lg flex items-center mb-3 hover:bg-gray-800 hover:text-white  cursor-pointer p-2`}
                  >
                    <div className="flex items-center gap-2">
                      <IoIosCreate />
                      <Link to={"/pUsers/addSecUsers"}>
                        <span className="mr-2 p-2">Create</span>
                      </Link>
                    </div>
                    <div className="custom-checkbox"></div>
                    {/* Add your logic for live section */}
                  </label>

                  <label
                    onClick={() => {
                      handleSidebarItemClick("organizationListBlocked");
                    }}
                    className={` ${
                      TAB === "agentLIst" ? " bg-gray-800 text-white " : ""
                    } rounded-lg flex items-center mb-3 hover:bg-gray-800 hover:text-white  cursor-pointer p-2`}
                  >
                    <div className="flex items-center  gap-2">
                      <FaEye />
                      <Link to={"/pUsers/secUsersList"}>
                        <span className="mr-2 p-2">Display</span>
                      </Link>
                    </div>
                    <div className="custom-checkbox"></div>
                    {/* Add your logic for blocked section */}
                  </label>
                </div>
              )}

              <a
                onClick={() => {
                  // handleSidebarItemClick("addOrganizations");
                  handleToggleSection("addBank");
                }}
                className={` ${
                  TAB === "addBank" || TAB === "bankList"
                    ? "bg-gray-800 text-white"
                    : "text-gray-400"
                } hover:bg-gray-800 hover:text-white flex items-center px-4 py-2 mt-5 transition-colors duration-300 transform rounded-lg   `}
                href="#"
              >
                <PiBankFill />
                <span className="mx-4 font-medium">Banks</span>
              </a>
              {expandedSections.addBank && (
                <div
                  className="pl-8 mt-2 text-white flex flex-col gap-1 pt-2 animate__animated animate__fadeIn"
                  style={{ animationDuration: "5s" }}
                >
                  {/* Add your sections here, for example: */}
                  <label
                    onClick={() => {
                      handleSidebarItemClick("organizationListLive");
                    }}
                    className={` ${
                      TAB === "addBank" ? " bg-gray-800 text-white " : ""
                    } rounded-lg flex items-center mb-3 hover:bg-gray-800 hover:text-white  cursor-pointer p-2`}
                  >
                    <div className="flex items-center gap-2 ">
                      <IoIosCreate />
                      {/* <Link to={"/pUsers/addOrganization"}> */}
                      <span className={`mr-2  `}>Create</span>
                      {/* </Link> */}
                    </div>
                    <div className="custom-checkbox"></div>
                  </label>

                  <label
                    onClick={() => {
                      handleSidebarItemClick("organizationListBlocked");
                    }}
                    className={` ${
                      TAB === "bankList" ? " bg-gray-800 text-white " : ""
                    } rounded-lg flex items-center mb-3 hover:bg-gray-800 hover:text-white  cursor-pointer p-2`}
                  >
                    <div className="flex items-center  gap-2">
                      <FaEye className="" />
                      <Link to={"/pUsers/bankList"}>
                        <span className="mr-2 p-2">Display</span>
                      </Link>
                    </div>
                    <div className="custom-checkbox"></div>
                    {/* Add your logic for blocked section */}
                  </label>
                </div>
              )}

              <Link to={"/pUsers/outstanding"}>
                <a
                  onClick={() => {
                    handleSidebarItemClick("outstanding");
                  }}
                  className={` ${
                    TAB === "outstanding"
                      ? "bg-gray-800 text-white"
                      : "text-gray-400"
                  } hover:bg-gray-800 hover:text-white flex items-center px-4 py-2 mt-5 transition-colors duration-300 transform rounded-lg   `}
                  href="#"
                >
                  <GiTakeMyMoney />

                  <span className="mx-4 font-medium">Outstandings</span>
                </a>
              </Link>
              <Link to={"/pUsers/addParty"}>
                <a
                  onClick={() => {
                    handleSidebarItemClick("addParty");
                  }}
                  className={` ${
                    TAB === "addParty"
                      ? "bg-gray-800 text-white"
                      : "text-gray-400"
                  } hover:bg-gray-800 hover:text-white flex items-center px-4 py-2 mt-5 transition-colors duration-300 transform rounded-lg   `}
                  href="#"
                >
                  <TiUserAdd />

                  <span className="mx-4 font-medium">Add Party</span>
                </a>
              </Link>
              <Link to={"/pUsers/hsn"}>
                <a
                  onClick={() => {
                    handleSidebarItemClick("addParty");
                  }}
                  className={` ${
                    TAB === "hsn"
                      ? "bg-gray-800 text-white"
                      : "text-gray-400"
                  } hover:bg-gray-800 hover:text-white flex items-center px-4 py-2 mt-5 transition-colors duration-300 transform rounded-lg   `}
                  href="#"
                >
                  <HiDocumentText />

                  <span className="mx-4 font-medium">Tax classification</span>
                </a>
              </Link>
            
            </nav>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Sidebar;
