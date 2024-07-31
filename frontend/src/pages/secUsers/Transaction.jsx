/* eslint-disable react/no-unknown-property */
import SidebarSec from "../../components/secUsers/SidebarSec";
import { useEffect, useState } from "react";
import api from "../../api/api";
import dayjs from "dayjs";
import { IoArrowRedoOutline } from "react-icons/io5";
import { IoIosArrowRoundBack } from "react-icons/io";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FcCancel } from "react-icons/fc";
import { FaRegCircleDot } from "react-icons/fa6";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { AiFillCaretRight } from "react-icons/ai";
import DashboardTransaction from "../../components/common/DashboardTransaction";

function Transaction() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [total, setTotal] = useState(0);

  const org = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const navigate = useNavigate();

  console.log(org);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get(`/api/sUsers/transactions/${org._id}`, {
          withCredentials: true,
        });

        console.log(res.data);

        setData(res.data.data.combined);

        // dispatch(addData(res.data.outstandingData));
      } catch (error) {
        console.log(error);
      }
    };
    fetchTransactions();
  }, []);

  console.log(data);

  const filterOutstanding = (data) => {
    return data?.filter((item) => {
      const searchFilter = item.party_name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const createdAtDate = new Date(item.createdAt);
      const adjustedStartDate = new Date(startDate).setHours(0, 0, 0, 0);
      const adjustedEndDate = new Date(endDate).setHours(23, 59, 59, 999);

      const dateFilterCondition =
        (!startDate || createdAtDate >= adjustedStartDate) &&
        (!endDate || createdAtDate <= adjustedEndDate) &&
        (startDate && endDate
          ? createdAtDate >= adjustedStartDate &&
            createdAtDate <= adjustedEndDate
          : true);

      return searchFilter && dateFilterCondition;
    });
  };

  const finalData = filterOutstanding(data);

  const calulateTotal = () => {
    if (finalData && finalData.length > 0) {
      let total = 0;
      try {
        total = finalData.reduce((acc, curr) => {
          const enteredAmount = curr?.enteredAmount;
          if (
            typeof enteredAmount === "number" ||
            typeof enteredAmount === "string"
          ) {
            return acc + parseFloat(enteredAmount);
          }
          return acc;
        }, 0);
      } catch (error) {
        console.error("Error when calculating total:", error);
      }
      console.log(total);
      setTotal(total);
    }
  };

  useEffect(() => {
    calulateTotal();
  }, [finalData]);

  // const handleCancel = async (id) => {
  //   try {
  //     const res = await api.post(`/api/sUsers/cancelTransaction/${id}`, {}, {
  //       withCredentials: true,
  //     });

  //     console.log(res.data);

  //     toast.success(res.data.message);
  //     setRefresh(!refresh);
  //     // dispatch(addData(res.data.outstandingData));
  //   } catch (error) {
  //     console.log(error);
  //     toast.error(error.response.data.message);
  //   }
  // };

  console.log(data);

  return (
     
      <div className="flex-1">
        <div className=" flex-1   ">
          <div className="sticky top-0 flex flex-col z-30 bg-white">
            <div className="bg-white"></div>
            <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex items-center gap-2  ">
              {/* <IoReorderThreeSharp
              onClick={handleToggleSidebar}
              className="block md:hidden text-white text-3xl"
            /> */}
              <Link to={"/sUsers/dashboard"}>
                <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer md:hidden" />
              </Link>

              <p className="text-white text-lg   font-bold  ">Transactions</p>
            </div>
            <div className=" mt-0 shadow-lg p-2 md:p-0">
              <form>
                <label
                  for="default-search"
                  class="mb-2 text-sm font-medium text-gray-900 sr-only"
                >
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500 "
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>
                  <input
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                    value={search}
                    type="search"
                    id="default-search"
                    className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-t-none rounded-b-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search Mockups, Logos..."
                    required
                  />
                  <button
                    type="submit"
                    className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
                  >
                    Search
                  </button>
                </div>
                <div className="p-2 flex justify-between pr-4 items-center">
                  <div
                    className="flex gap-3 items-center
                  "
                  >
                    <AiFillCaretRight />
                    <DatePicker
                      className="h-6 text-xs bg-blue-200 rounded-sm w-full"
                      startDate={startDate}
                      dateFormat="dd/MM/yyyy"
                      endDate={endDate}
                      selectsRange
                      onChange={(dates) => {
                        console.log(dates);
                        if (dates) {
                          setStartDate(dates[0]);
                          setEndDate(dates[1]);
                        }
                      }}
                    />
                  </div>

                  <div>
                    <p className="font-semibold text-green-500 text-sm">
                      <span className="text-gray-500 ">Total : </span>₹{" "}
                      {total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>

      <DashboardTransaction filteredData={finalData} userType="secondary"/>
        </div>
      </div>
  );
}

export default Transaction;
