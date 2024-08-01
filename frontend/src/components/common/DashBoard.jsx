/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import DashboardTransaction from "./DashboardTransaction";
import { FaCaretDown } from "react-icons/fa";
import { CiCalendarDate } from "react-icons/ci";
import { IoReorderThreeSharp } from "react-icons/io5";
import DashboardCard from "../../components/homePage/DashboardCardPrimary";

function DashBoard({
  handleToggleSidebar,
  filteredData,
  org,
  receiptTotal,
  handleLinkClick,
  type
}) {
  return (
    <div className="">
      <div className="sticky top-0  ">
        <div className="sticky top-0  z-[100] h-[100px] ">
          <div className="bg-[#012a4a]   sticky top-0 p-3  text-white text-lg font-bold flex items-center gap-3  shadow-lg">
            <IoReorderThreeSharp
              onClick={handleToggleSidebar}
              className="block md:hidden text-3xl"
            />
            <p>Dashboard</p>
          </div>

          {/* company name */}

          <div className="  bg-white shadow-lg p-2  flex items-center gap-3">
            <div className="bg-blue-500 rounded-full w-[30px] h-[30px]  flex justify-center items-center text-md  text-white font-bold">
              <div className="rounded-full w-[25px] h-[25px] md:w-[25px] md:h-[25px] bg-[#012a4a] flex items-center justify-center">
                <p>{org?.name?.slice(0, 1)}</p>
              </div>
            </div>
            <p className="font-bold text-md md:text-lg">
              {org?.name || "Company Name"}
            </p>
            <FaCaretDown />
          </div>
        </div>
        {/* company name */}

        <div className="flex flex-col lg:flex-row   ">
          <div className=" lg:h-screen sticky top-[100px] z-20  shadow-xl  ">
            {/* tiles */}
            <DashboardCard
              receiptTotal={receiptTotal}
              handleLinkClick={handleLinkClick}
              userType={type}
            />
            {/* tiles */}

            <div className=" md:hidden border-t-2  bg-white px-4 p-2  text-gray-500 text-sm md:text-lg font-bold flex items-center gap-3 z shadow-lg sm:sticky top-[115px]">
              <p> Today's Transactions</p>

              <p className="text-[9px] md:text-sm">
                ( {new Date().toDateString()} )
              </p>
              <CiCalendarDate className="text-xl font-bold text-violet-500" />
              <FaCaretDown />
            </div>
          </div>

          {/* transactions */}

          <div className=" md:flex-1 z-10   ">
            <div className="hidden md:block  md:sticky md:top-[97px] z-10">
              <div className=" bg-white p-2  text-gray-500 text-sm md:text-lg font-bold flex items-center gap-3 z shadow-lg  ">
                <p> Today's Transactions</p>

                <p className="text-[9px] md:text-sm">
                  ( {new Date().toDateString()} )
                </p>
                <CiCalendarDate className="text-xl font-bold text-violet-500" />
                <FaCaretDown />
              </div>
            </div>
            {/* one */}
            <DashboardTransaction
              filteredData={filteredData}
              userType={type}
            />
            {/* one */}
          </div>

          {/* transactions */}
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
