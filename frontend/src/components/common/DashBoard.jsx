/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import DashboardTransaction from "./DashboardTransaction";
import { FaCaretDown } from "react-icons/fa";
import { CiCalendarDate } from "react-icons/ci";
import { IoReorderThreeSharp } from "react-icons/io5";
import DashboardCard from "../../components/homePage/DashboardCardPrimary";
import DashboardSummary from "./DashboardSummary";

function DashBoard({
  handleToggleSidebar,
  filteredData,
  org,
  receiptTotal,
  handleLinkClick,
  type,
  from,
}) {
  return (
    <div className="">
      <div className="  ">
        <div className="sticky top-0  z-[100] h-[100px] ">
          <div className="bg-[#012a4a]   p-3  text-white text-lg font-bold flex items-center gap-3  shadow-lg">
            <IoReorderThreeSharp
              onClick={handleToggleSidebar}
              className="block md:hidden text-3xl"
            />
            <p>Dashboard</p>
          </div>

          {/* company name */}

          <div className="  bg-white shadow-lg p-2  flex items-center gap-3 mb-2 ">
            <div className="bg-blue-500 rounded-full w-[30px] h-[30px]  flex justify-center items-center text-md  text-white font-bold">
              <div className="rounded-full w-[25px] h-[25px] md:w-[25px] md:h-[25px] bg-[#012a4a] flex items-center justify-center">
                <p>{org?.name?.trim().slice(0, 1)}</p>
              </div>
            </div>
            <p className="font-bold text-md md:text-lg">
              {org?.name || "Company Name"}
            </p>
            <FaCaretDown />
          </div>
          

          
        </div>
        {/* company name */}

        <div className="flex flex-col    ">
          <div className=" z-20  shadow-xl  ">
            {/* tiles */}
            <DashboardCard
              receiptTotal={receiptTotal}
              handleLinkClick={handleLinkClick}
              userType={type}
            />
            {/* tiles */}

            <hr className="border" />

            <div className="  z-10 flex w-full">
              <div className=" bg-white p-2 w-1/2 text-gray-500 text-xs md:text-sm font-bold flex items-center gap-3  ">
                <p> Today's Transactions</p>

                <p className="text-[9px] md:text-sm">
                  ( {new Date().toDateString()} )
                </p>
                <CiCalendarDate className="text-xl font-bold text-violet-500" />
                <FaCaretDown />
              </div>
              <div className=" bg-white p-2  w-1/2 text-gray-500 text-xs md:text-sm font-bold flex items-center gap-3  ">
                <p> Summary</p>

                <p className="text-[9px] md:text-sm">
                  ( {new Date().toDateString()} )
                </p>
                <CiCalendarDate className="text-xl font-bold text-violet-500" />
                <FaCaretDown />
              </div>
            </div>
          </div>

          {/* transactions */}

          <div className="flex w-full  ">
            <div className="w-1/2 h-[calc(100vh-277px)] overflow-y-scroll scrollbar-thin mt-2 ">
              <DashboardTransaction
                filteredData={filteredData}
                userType={type}
                from={from}
              />
            </div>
            <div className="w-1/2">
              <DashboardSummary />
            </div>
          </div>
          {/* one */}
          {/* one */}

          {/* transactions */}
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
