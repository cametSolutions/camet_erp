

import { useState ,useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoReorderThreeSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/api";
import { RingLoader } from "react-spinners";

function SidebarComponent({ TAB, showBar }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [userData, setUserData] = useState({});
    const [dropdown, setDropdown] = useState(false);
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState("");
    const [loader, setLoader] = useState(false);
  
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const selectedOrgFromRedux = useSelector(
      (state) => state.setSelectedOrganization.selectedOrg
    );
  
    const [expandedSections, setExpandedSections] = useState({});
  
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
  
    useEffect(() => {
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
  
    const toggleSection = (section) => {
      setExpandedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    };
  
    return (
      <div className="relative">
        {loader && (
          <div className="absolute top-0 w-screen h-screen z-50 flex justify-center items-center bg-black/[0.5]">
            <RingLoader color="#1c14a0" />
          </div>
        )}
  
        <aside
          className={`${
            showSidebar
              ? "z-50 absolute h-[125vh] transform translate-x-0"
              : "-translate-x-full md:translate-x-0 z-40 absolute md:relative"
          } transition-transform duration-500 ease-in-out flex flex-col w-64 h-screen px-4 py-8 bg-gray-900 border-r rtl:border-r-0 rtl:border-l dark:bg-gray-900 dark:border-gray-700 overflow-y-auto`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="w-full relative">
            <div
              onClick={handleSidebarItemClick}
              className="text-white text-3xl absolute right-0 top-[-20px] md:hidden"
            >
              <IoReorderThreeSharp />
            </div>
          </div>
          <div className="flex flex-col items-center mt-6 -mx-2">
            <img
              className="object-cover w-24 h-24 mx-2 rounded-full"
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
                className="w-2.5 h-2.5 ms-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>
  
            {dropdown && (
              <div className="relative flex justify-center">
                <div
                  id="dropdown"
                  className="z-10 absolute mt-2 divide-y divide-gray-100 rounded-lg bg-white shadow w-44 dark:bg-gray-700"
                >
                  <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                    {organizations.length > 0 ? (
                      organizations.map((org, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            setSelectedOrg(org);
                            dispatch(setSelectedOrganization(org));
                            setDropdown(false);
                          }}
                        >
                          <a
                            href="#"
                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            {org.name}
                          </a>
                        </li>
                      ))
                    ) : (
                      <li>
                        <a
                          href="#"
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          No Organization added
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
  
          <div className="flex flex-col justify-between flex-1 mt-6">
            <nav>
              <div>
                {sidebarItems.map((item, index) => (
                  <SidebarItem
                    key={index}
                    item={item}
                    expanded={expandedSections[item.label]}
                    toggleSection={toggleSection}
                    handleSidebarItemClick={handleSidebarItemClick}
                  />
                ))}
              </div>
            </nav>
          </div>
  
          <div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 mt-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 focus:outline-none focus:bg-red-500"
            >
              Logout
            </button>
          </div>
        </aside>
      </div>
    );
  }
  
  export default SidebarComponent