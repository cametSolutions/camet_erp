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


function Transaction() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showSidebar, setShowSidebar] = useState(false);

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

      const dateFilterCondition =
        !dateFilter || item.createdAt?.startsWith(dateFilter);


      return searchFilter && dateFilterCondition ;
    });
  };

  const finalData = filterOutstanding(data);

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
    <div className="flex h-screen overflow-hidden">
      <div>
        <SidebarSec TAB={"transaction"} showBar={showSidebar} />
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
              <Link to={"/sUsers/dashboard"}>
                <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer md:hidden" />
              </Link>

              <p className="text-white text-lg   font-bold  ">Receipts</p>
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
                <div className="">
                  <input
                    type="date"
                    className=" bg-blue-300 p-0 px-3 m-4 rounded-md"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4  text-center pb-7 mt-5 md:px-8 ">
            {finalData?.map((el, index) => (
              <div
                key={index}
                onClick={() => {
                  // navigate(`/sUsers/receiptDetails/${el._id}`);
                  navigate(el.type==="Receipt"?`/sUsers/receiptDetails/${el._id}`: el.type==="Tax Invoice"?`/sUsers/salesDetails/${el._id}`:`/sUsers/InvoiceDetails/${el._id}`)}}
                className={`${
                  el?.isCancelled ? "bg-gray-200 pointer-events-none " : ""
                } bg-[#f8ffff] cursor-pointer rounded-md shadow-xl border border-gray-100 flex flex-col justify-between px-4 transition-all duration-150 transform hover:scale-105 ease-in-out`}
              >
                <div className=" flex justify-start text-xs mt-2 ">
                <div className={` ${el.type==="Receipt" ? "bg-[#FB6D48]" : el.type==="Tax Invoice" ? "bg-violet-500":"bg-[#3ed57a]" }   flex items-center text-white px-2 rounded-sm `}>
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
