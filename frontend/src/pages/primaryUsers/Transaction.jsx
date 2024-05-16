/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from "react";
import api from "../../api/api";
import dayjs from "dayjs";
import { IoArrowRedoOutline } from "react-icons/io5";
import Sidebar from "../../components/homePage/Sidebar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FcCancel } from "react-icons/fc";
import { IoIosArrowRoundBack } from "react-icons/io";
import { Link } from "react-router-dom";
import { FaRegCircleDot } from "react-icons/fa6";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AiFillCaretRight } from "react-icons/ai";

function Transaction() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showSidebar, setShowSidebar] = useState(false);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  const org = useSelector((state) => state.setSelectedOrganization.selectedOrg);
  console.log(org);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get(`/api/pUsers/transactions/${org._id}`, {
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

    const fetchSecondaryUsers = async () => {
      try {
        const res = await api.get("/api/pUsers/fetchSecondaryUsers", {
          withCredentials: true,
        });

        setUsers(res.data.secondaryUsers);
        const allSecUsers=res?.data?.secondaryUsers
        const companyWiseSecUsers = allSecUsers?.filter((item) => {
          // Correctly compare org._id to item._id
          return item.organization.some(company => company._id === org._id);
        });

        console.log(companyWiseSecUsers.length);
        setUsers(companyWiseSecUsers)
      } catch (error) {
        console.log(error);
      }
    };
    fetchSecondaryUsers();
  }, []);

  console.log(users);
  console.log(selectedUser);
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

      let secondaryUserIdMatch;

      if (!selectedUser) {
        secondaryUserIdMatch = true;
      } else {
        secondaryUserIdMatch = item?.Secondary_user_id === selectedUser;
      }

      console.log(secondaryUserIdMatch);

      return searchFilter && dateFilterCondition && secondaryUserIdMatch;
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
    else{
      setTotal(0);
    }
  };

  useEffect(() => {
    calulateTotal();
  }, [finalData]);

  console.log(finalData);

  return (
    <div className="flex h-screen overflow-hidden">
      <div>
        <Sidebar TAB={"transaction"} showBar={showSidebar} />
      </div>
      <div className="flex-1">
        <div className=" flex-1   h-screen overflow-y-scroll ">
          <div className="sticky top-0 flex flex-col z-30 bg-white">
            <div className="bg-white"></div>
            <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex items-center gap-2  ">
              {/* <IoReorderThreeSharp
              onClick={handleToggleSidebar}
              className="block md:hidden text-white text-3xl"
            /> */}
              <Link to={"/pUsers/dashboard"}>
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
                {/* <div className="">
                  <input
                    type="date"
                    className=" bg-blue-300 p-0 px-3 m-4 rounded-md"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div> */}
                <div className="p-2 mt-1 md:flex justify-between pr-4 items-center ">
                  <div className="flex gap-3 items-center">
                    <AiFillCaretRight className="text-[9px] md:text-sm" />
                    <DatePicker
                      className="h-8 text-xs bg-blue-200 rounded-sm w-full"
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

                    <select
                      onChange={(e) => {
                        setSelectedUser(e.target.value);
                      }}
                      className="h-8 text-xs bg-green-100 rounded-sm "
                      name="users"
                      id="users"
                    >
                      <option className="text-xs " value="">
                        All
                      </option>
                      {users.map((user, index) => (
                        <option
                          className="text-xs "
                          key={index}
                          value={user._id}
                        >
                          {user?.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[9px] md:text-sm">
                  <AiFillCaretRight className="md:hidden" />
                    <p className="font-semibold text-green-500 text-sm">
                      <span className="text-gray-500 ">Total : </span>₹{" "}
                      {total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* <div className="p-2 bg-white">
                  <select className="h-6 bg-green-200">
                    <option value="">Select an option</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </select>
                </div> */}
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4  text-center pb-7 mt-5 md:px-8 ">
            {finalData?.map((el, index) => (
              <div
                key={index}
                onClick={() => {
                  // navigate(`/pUsers/receiptDetails/${el._id}`);
                  navigate(
                    el.type === "Receipt"
                      ? `/pUsers/receiptDetails/${el._id}`
                      : el.type === "Tax Invoice"
                      ? `/pUsers/salesDetails/${el._id}`
                      : `/pUsers/InvoiceDetails/${el._id}`
                  );
                }}
                className={`${
                  el?.isCancelled ? "bg-gray-200 pointer-events-none " : ""
                } bg-[#f8ffff] cursor-pointer rounded-md shadow-xl border border-gray-100 flex flex-col justify-between px-4 transition-all duration-150 transform hover:scale-105 ease-in-out`}
              >
                <div className=" flex justify-start text-xs mt-2 ">
                  <div
                    className={` ${
                      el.type === "Receipt"
                        ? "bg-[#FB6D48]"
                        : el.type === "Tax Invoice"
                        ? "bg-violet-500"
                        : "bg-[#3ed57a]"
                    }   flex items-center text-white px-2 rounded-sm `}
                  >
                    <FaRegCircleDot />
                    <p className=" p-1  rounded-lg px-3 font-semibold">
                      {" "}
                      {el.type}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between ">
                  <div className=" h-full px-2 py-4  lg:p-6 w-[150px] md:w-[180px] lg:w-[300px] flex justify-center items-start relative flex-col ">
                    <p className="font-bold md:font-semibold text-[11.3px] md:text-[15px] text-left mb-3 ">
                      {el.party_name}
                    </p>
                    <p className="font-bold md:font-semibold text-[11.3px] md:text-[15px] text-left text-violet-500 ">
                      {el.billNo}
                    </p>

                    <p className="text-gray-400 text-sm  ">
                      {dayjs(el?.createdAt).format("DD/MM/YYYY")}
                    </p>
                  </div>
                  <div className=" h-full p-2 lg:p-6 w-[150px] md:w-[180px] lg:w-[300px] flex justify-center items-end relative flex-col">
                    <div className="flex-col  ">
                      <p className=" font-semibold text-green-600  ">
                        ₹{el.enteredAmount}
                      </p>
                    </div>
                  </div>
                </div>
                <hr />
                <hr />
                <hr />
                <div className="flex justify-between p-4">
                  {/* <button
                    onClick={() => {
                      handleCancel(el._id);
                    }}
                    className="p-2 py-1 rounded-lg text-white bg-red-500 flex items-center gap-2 transition-all duration-150 transform hover:scale-105 hover:bg-red-600"
                  >
                    <ImCancelCircle />
                    {el.isCancelled ? "Cancelled" : "Cancel"}
                  </button> */}

                  <div className=" flex items-center justify-between w-full gap-2 text-md text-violet-500">
                    <div className="flex items-center gap-2">
                      <IoArrowRedoOutline />

                      <p>Send Receipt</p>
                    </div>
                    {el.isCancelled && (
                      <div className="flex justify-center items-center gap-2 text-red-500">
                        <FcCancel />
                        <p>Canelled</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transaction;
