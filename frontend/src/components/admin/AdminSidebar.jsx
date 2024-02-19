/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { IoReorderThree } from "react-icons/io5";
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./sidebar.css";
// import "animate.css/animate.min.css";
import {useDispatch } from "react-redux";
import { removeAdminData } from "../../../slices/adminData";
import { RiUserFollowFill } from "react-icons/ri";
import { BsFillBuildingsFill } from "react-icons/bs";
import { TbLivePhoto } from "react-icons/tb";
import { CgUnblock } from "react-icons/cg";
import { SlUserFollow } from "react-icons/sl";







function AdminSidebar({ onTabChange }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [admin, setAdmin] = useState({});
  const [tab, setTab] = useState("addOrganizations");
  const navigate = useNavigate();
  const dispatch=useDispatch()

  const [expandedSections, setExpandedSections] = useState({
    pUsers: false,
    organizationList: false,
    secUsers: false,
  });

  const handleToggleSection = (section) => {
    setExpandedSections((prevSections) => ({
      // ...prevSections,
      [section]: !prevSections[section],
    }));
  };

  useEffect(() => {
    const getAdminData = async () => {
      try {
        const res = await api.get("/api/admin/getAdminData", {
          withCredentials: true,
        });
        setAdmin(res.data.data.adminData);
      } catch (error) {
        console.log(error);
      }
    };
    getAdminData();
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };
  const handleSidebarItemClick = (newTab) => {
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }

    setTab(newTab);
    onTabChange(newTab);
  };

  const handleLogout = async () => {
    try {
      const res = await api.post(
        "/api/admin/logout",
        {},
        {
          withCredentials: true,
        }
      );
      toast.success(res.data.message);
      dispatch(removeAdminData())
      navigate("/admin/login");
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <div>
      <div className={`md:hidden absolute`}>
        <IoReorderThree
          onClick={handleToggleSidebar}
          className="text-4xl ml-4 mt-3"
        />
      </div>

      <aside
        className={`${
          showSidebar ? "z-10 block absolute h-[125vh] " : " hidden md:block"
        } flex flex-col w-64 h-screen overflow-y-auto  px-4 py-8 bg-white border-r rtl:border-r-0 rtl:border-l`}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "transparent transparent",
          boxShadow:  "5px 0 15px rgba(0, 0, 0, 0.1)"  
        }}
      >
        <IoReorderThree
          onClick={handleToggleSidebar}
          className="text-4xl ml-0 mt-[-20px] text-white block md:hidden"
        />

        <div className="flex justify-center mb-12">
          <button class="shadow__btn">Admin</button>
        </div>

        <div className="flex flex-col items-center mt-6 -mx-2">
          <img
            className="object-cover w-24 h-24 mx-2 rounded-full"
            src="https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg"
            alt="avatar"
          />
          <h4 className="mx-2 mt-2 font-medium text-black ">
            Camet
          </h4>
          <p className="mx-2 mt-1 text-sm font-medium text-black ">
            {admin.email}
          </p>
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

        <div className="flex flex-col justify-between flex-1 mt-6 overflow-y-auto">
          <nav>
            <a
              onClick={() => {
                handleSidebarItemClick("pUsers");
                handleToggleSection("pUsers");
              }}
              className={` ${
                tab === "pUsers" ? "bg-gray-800 text-white" : "text-black"
              } hover:bg-gray-800 hover:text-white text-black flex items-center px-4 py-2 mt-5 transition-colors duration-300 transform rounded-lg   `}
              href="#"
            >
              <RiUserFollowFill className="text-lg"/>
              <span className="mx-4 font-medium ">Subscriber List</span>
            </a>
            <a
              onClick={() => {
                handleToggleSection("organizationList");
              }}
              className={` ${
                tab === "organizationListLive" ||
                tab === "organizationListBlocked"
                  ? "bg-gray-800 text-white"
                  : "text-black"
              } hover:bg-gray-800 hover:text-white flex items-center px-4 py-2 mt-5 transition-colors duration-300 transform rounded-lg   `}
              href="#"
            >
            <BsFillBuildingsFill/>

              <span className="mx-4 font-medium">Companies</span>
            </a>
            {expandedSections.organizationList && (
              <div
                className="pl-8 mt-2 text-white flex flex-col gap-2 pt-2"
                
              >
                {/* Add your sections here, for example: */}
                <label
                  onClick={() => {
                    handleSidebarItemClick("organizationListLive");
                  }}
                  className={` ${
                    tab === "organizationListLive"
                      ? " bg-gray-800 text-white "
                      : ""
                  } rounded-lg flex items-center mb-3 text-black hover:bg-gray-800 hover:text-white  cursor-pointer`}
                >
                  <div className="flex items-center gap-3">

                  <TbLivePhoto/>
                  <span className="mr-2 p-2">Live</span>
                  </div>
                  <div className="custom-checkbox"></div>
                  {/* Add your logic for live section */}
                </label>

                <label
                  onClick={() => {
                    handleSidebarItemClick("organizationListBlocked");
                  }}
                  className={` ${
                    tab === "organizationListBlocked"
                      ? " bg-gray-800 text-white "
                      : ""
                  } rounded-lg flex items-center mb-3 text-black hover:bg-gray-800 hover:text-white  cursor-pointer`}
                >
                  <div className="flex items-center  gap-2">
                    <CgUnblock className="text-lg"/>
                  <span className="mr-2 p-2">Blocked</span>
                  </div>
                  <div className="custom-checkbox"></div>
                  {/* Add your logic for blocked section */}
                </label>
              </div>
            )}
            <a
              onClick={() => {
                handleToggleSection("secUsers");
              }}
              className={` ${
                tab === "secUsers" ? "bg-gray-800 text-white" : "text-black"
              } hover:bg-gray-800 hover:text-white flex items-center px-4 py-2 mt-5 transition-colors duration-300 transform rounded-lg   `}
              href="#"
            >
              <SlUserFollow/>

              <span className="mx-4 font-medium">Retailers</span>
            </a>

            {expandedSections.secUsers && (
              <div className="pl-8 mt-2 text-white  flex flex-col gap-2 pt-2  ">
                {/* Add your sections here, for example: */}
                <label
                  onClick={() => {
                    handleSidebarItemClick("secUsersLive");
                  }}
                  className=" rounded-lg flex items-center mb-3 text-black hover:bg-gray-800 hover:text-white  cursor-pointer"
                >
                   <div className="flex items-center gap-3">

                  <TbLivePhoto/>
                  <span className="mr-2 p-2 ">Live</span>
                  </div>
                  <div className="custom-checkbox"></div>
                  {/* Add your logic for live section */}
                </label>

                <label
                  onClick={() => {
                    handleSidebarItemClick("secUsersBlocked");
                  }}
                  className=" rounded-lg flex items-center text-black hover:bg-gray-800 hover:text-white  cursor-pointer"
                >
                   <div className="flex items-center  gap-2">
                    <CgUnblock className="text-lg"/>
                  <span className="mr-2 p-2">Blocked</span>
                  </div>
                  <div className="custom-checkbox"></div>
                  {/* Add your logic for blocked section */}
                </label>
              </div>
            )}
          </nav>
        </div>
      </aside>
    </div>
  );
}

export default AdminSidebar;
