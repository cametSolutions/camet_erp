/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { BsBoxArrowRight, BsBuildingFill } from "react-icons/bs";
import { GrRadialSelected } from "react-icons/gr";
import { HiDotsVertical } from "react-icons/hi";

function ProfileSection({
  org,
  userData,
  dropdown,
  setDropdown,
  handleDropDownchange,
  handleLogout,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Sample companies data
  const companies = [
    { id: 1, name: "Acme Inc", logo: "/api/placeholder/40/40" },
    { id: 2, name: "Tech Solutions", logo: "/api/placeholder/40/40" },
    { id: 3, name: "Innovate Co", logo: "/api/placeholder/40/40" },
  ];

  // Handle clicks outside the popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener when popover is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  return (
    // <div>
    //   <div className="flex flex-col items-center    bg-[#0b1d34] p-4 py-6 rounded-sm ">

    //     <div className="flex">

    //       <div className="flex items-center justify-center h-26 w-26 rounded-full bg-blue-500 p-0.5">
    //         <div className="flex items-center justify-center h-25 w-25 rounded-full bg-black p-1">
    //           <img
    //             className="object-cover w-8 h-8 rounded-full"
    //             src={
    //               org?.logo ||
    //               "https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg"
    //             }
    //             alt="avatar"
    //           />
    //         </div>
    //       </div>
    //     <h4 className="mx-2 mt-2 font-medium text-white ">{userData.name}</h4>
    //     {/* <p className="mx-2 mt-1 text-sm font-medium text-white">
    //       {userData.email}
    //     </p> */}
    //     </div>

    //     <button
    //       onClick={() => {
    //         setDropdown(!dropdown);
    //       }}
    //       id="dropdownDefaultButton"
    //       data-dropdown-toggle="dropdown"
    //       className="text-white mt-6 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
    //       type="button"
    //     >
    //       {org?.name || "No company added"}{" "}
    //       <svg
    //         className="w-2.5 h-2.5 ms-3"
    //         aria-hidden="true"
    //         xmlns="http://www.w3.org/2000/svg"
    //         fill="none"
    //         viewBox="0 0 10 6"
    //       >
    //         <path
    //           stroke="currentColor"
    //           strokeLinecap="round"
    //           strokeLinejoin="round"
    //           strokeWidth="2"
    //           d="m1 1 4 4 4-4"
    //         />
    //       </svg>
    //     </button>

    //     {dropdown && (
    //       <div
    //         className="relative flex justify-center
    //             "
    //       >
    //         <div
    //           id="dropdown"
    //           className="z-10 absolute mt-2   bg-gray-700 divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
    //         >
    //           <ul
    //             className="py-2 text-sm text-gray-200"
    //             aria-labelledby="dropdownDefaultButton"
    //           >
    //             {userData &&
    //               userData?.organization?.map((el, index) => (
    //                 <li key={index}>
    //                   <a
    //                     // onClick={()=>{setDropdown(!dropdown);setOrg(el)}}
    //                     onClick={() => handleDropDownchange(el)}
    //                     href="#"
    //                     className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
    //                   >
    //                     {el.name}
    //                   </a>
    //                 </li>
    //               ))}
    //           </ul>
    //         </div>
    //       </div>
    //     )}

    //     {/* <div>
    //       <button onClick={handleLogout} className="Btn">
    //         <div className="sign">
    //           <svg viewBox="0 0 512 512">
    //             <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
    //           </svg>
    //         </div>

    //         <div className="text">Logout</div>
    //       </button>
    //     </div> */}
    //   </div>
    // </div>

    <div className="relative" ref={popoverRef}>
     
      <div className="flex justify-between  bg-gray-700 py-2 pl-3 pr-1 text-white items-center gap-3 w-full">
        <div className="flex items-center gap-3 ">
          <div className="   flex items-center justify-center  rounded-full  border-2 border-gray-500 p-0.5">
            <img
              className="object-cover w-8 h-8 rounded-full"
              src={
                org?.logo ||
                "https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg"
              }
              alt="avatar"
            />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-300   ">
              {userData?.name?.length > 20
                ? userData?.name.slice(0, 20) + "..."
                : userData?.name}
            </p>
            <p className="text-[9px] font-semibold text-gray-300 ">
              {userData?.email?.length > 25
                ? userData?.email.slice(0, 25) + "..."
                : userData?.email}
            </p>
          </div>
        </div>
        <HiDotsVertical className="text-gray-300" />
      </div>
      <div 
      onClick={() => setIsOpen(!isOpen)}
        className="mt-2  w-full flex items-center  gap-2 bg-gray-700 py-2 px-4 text-white cursor-pointer ">
        <GrRadialSelected size={12} />

        <p className="text-xs font-bold text-gray-300   ">
          {org?.name?.length > 20
            ? org?.name.slice(0, 20) + "..."
            : org?.name}
        </p>
      </div>

      {/* Popover Content */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-lg shadow-xl border border-gray-700 z-50">
          {/* Companies Section */}
          <div className="p-4 border-b border-gray-700">
            <h4 className="text-sm text-gray-300 mb-2 flex items-center">
              <BsBuildingFill className="mr-2" /> Switch Companies
            </h4>
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex items-center hover:bg-gray-800 p-2 rounded cursor-pointer"
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <span className="text-white text-sm">{company.name}</span>
              </div>
            ))}
          </div>

          {/* Logout Section */}
          <div className="p-2">
            <button
              className="w-full flex items-center text-red-400 hover:bg-gray-800 p-2 rounded"
              onClick={() => {
                // Add logout logic here
                console.log("Logging out");
              }}
            >
              <BsBoxArrowRight size={18} className="mr-2" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSection;
