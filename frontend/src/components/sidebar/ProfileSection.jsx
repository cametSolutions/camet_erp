/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { GrRadialSelected } from "react-icons/gr";
import { HiDotsVertical } from "react-icons/hi";

function ProfileSection({
  org,
  userData,
  handleLogout,
  handleDropDownchange
}) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

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
        className="mt-2  w-full flex items-center  gap-2 bg-gray-700 py-2 px-4 text-white cursor-pointer "
      >
        <GrRadialSelected size={12} />

        <p className="text-xs font-bold text-gray-300   ">
          {org?.name?.length > 20 ? org?.name.slice(0, 20) + "..." : org?.name}
        </p>
      </div>

      {/* Popover Content */}
      {isOpen && (
        <div
        style={{
          left: "50%",
    transform: "translateX(-50.5%)",
        }}
         className="absolute  mt-2 w-60 bg-gray-900 rounded-md shadow-xl border border-gray-700 z-50">
          {/* Companies Section */}
          <div className="  border-gray-700 mb-4">
            <h4 className="text-sm text-gray-300 mb-2 flex items-center bg-gray-800 p-2 font-bold ">
              Switch Companies
            </h4>
            {userData?.organization?.map((company) => (
              <div
                onClick={() => {
                  handleDropDownchange(company);
                  setIsOpen(false);
                }}
                key={company?.id}
                className="flex items-center hover:bg-gray-800  p-2 px-3 text-gray-300  hover:text-white   rounded cursor-pointer "
              >
                {company?.logo ? (
                  <img
                    src={company?.logo}
                    // alt={company.name}
                    className="w-5 h-5 rounded-full mr-3"
                  />
                ) : (
                  <div className="rounded-full  w-5 h-5 mr-3 flex justify-center items-center text-[9px] font-bold text-white bg-black border border-gray-500">
                    {company?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <span className="text-[12px] font-semibold ">{company?.name}</span>
              </div>
            ))}
          </div>

      
        </div>
      )}
    </div>
  );
}

export default ProfileSection;
