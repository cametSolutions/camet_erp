/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import DashboardTransaction from "../../../components/common/DashboardTransaction";
import { FaCaretDown } from "react-icons/fa"
import { CiCalendarDate } from "react-icons/ci"
import { IoReorderThreeSharp } from "react-icons/io5"
import DashboardCard from "../../../components/homePage/DashboardCardPrimary"
import DashboardSummary from "./DashboardSummary"
import { useState } from "react"
import TransactionSkeleton from "../../../components/common/TransactionSkeleton"
import NotFound from "../../../assets/images/space.png"

function DashBoardLayout({
  handleToggleSidebar,
  filteredData,
  org,
  receiptTotal,
  handleLinkClick,
  type,
  from,
  loader
}) {
  const [tab, setTab] = useState("transactions")


  return (
    <div className="overflow-hidden h-screen">
      <div className="sticky top-0   h-[100px] ">
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
      <hr className="sm:hidden" />
      {/* company name */}

      <div className="flex flex-col   ">
        <div className=" z-20  shadow-xl   ">
          {/* tiles */}
          <DashboardCard
            receiptTotal={receiptTotal}
            handleLinkClick={handleLinkClick}
            userType={type}
            organization={org}
          />
          {/* tiles */}

          <hr className="border" />

          <div className=" hidden  sm:flex items-center   z-10  w-full pl-4">
            <div className=" bg-white p-2 w-1/2 text-gray-500 text-xs md:text-sm font-bold flex items-center gap-3  ">
              <p> Today's Transactions</p>
              {/* 
                <p className="text-[9px] md:text-sm">
                  ( {new Date().toDateString()} )
                </p> */}
              <CiCalendarDate className="text-xl font-bold text-violet-500" />
              <FaCaretDown />
            </div>
            <div className=" bg-white p-2  w-1/2 text-gray-500 text-xs md:text-sm font-bold flex items-center gap-3  ">
              <p> Summary</p>
              {/* 
                <p className="text-[9px] md:text-sm">
                  ( {new Date().toDateString()} )
                </p> */}
              <CiCalendarDate className="text-xl font-bold text-violet-500" />
              <FaCaretDown />
            </div>
          </div>
        </div>

        {/* mobile view */}
        <div className=" sm:hidden bg-white  w-full  text-gray-500 text-xs font-bold    flex items-center gap-8 border-b-2 ">
          <div
            onClick={() => setTab("transactions")}
            className={` ${
              tab === "transactions" && "text-violet-500 border-b-2 "
            }   flex items-center gap-3 w-1/2 py-2 pl-4 mt-1 cursor-pointer`}
          >
            <p> Today's Transactions</p>
            <CiCalendarDate className="text-sm font-bold text-violet-500" />
          </div>
          <div
            onClick={() => setTab("summary")}
            className={` ${
              tab === "summary" && "text-violet-500 border-b-2 "
            }   flex items-center gap-3 w-1/2 py-2  mt-1 cursor-pointer`}
          >
            <p> Summary</p>
            <CiCalendarDate className="text-sm font-bold text-violet-500" />
          </div>
        </div>

        {/* transactions */}

        <div className=" w-full hidden sm:flex ">
          <div className="w-1/2 h-[calc(100vh-290px)] overflow-y-scroll scrollbar-thin mt-2 ">
            {loader ? (
              <TransactionSkeleton />
            ) : filteredData.length === 0 ? (
              <div className="h-[calc(100vh-301px)] flex justify-center flex-col items-center">
                <img className="h-16 w-16" src={NotFound} alt="" />
                <p className="text-xs font-bold text-gray-500 mt-1">
                  {" "}
                  No Transactions
                </p>
              </div>
            ) : (
              <DashboardTransaction
                filteredData={filteredData}
                userType={type}
                from={from}
              />
            )}
          </div>
          <div className="w-1/2">
            <DashboardSummary />
          </div>
        </div>

        {/* mobile view */}

        <div className=" w-full sm:hidden  ">
          {tab === "transactions" ? (
            <div className=" h-[calc(100vh-301px)] overflow-y-scroll scrollbar-thin mt-2 ">
              {loader ? (
                <TransactionSkeleton />
              ) : filteredData.length === 0 ? (
                <div className="h-[calc(100vh-301px)] flex justify-center flex-col items-center">
                  <img className="h-12 w-12" src={NotFound} alt="" />
                  <p className="text-xs font-bold text-gray-500 mt-2">
                    {" "}
                    No Transactions
                  </p>
                </div>
              ) : (
                <DashboardTransaction
                  filteredData={filteredData}
                  userType={type}
                  from={from}
                />
              )}
            </div>
          ) : (
            <div className="">
              <DashboardSummary />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashBoardLayout
