/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import Sidebar from "../../components/homePage/Sidebar";
import { IoReorderThreeSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import { IoReceiptSharp } from "react-icons/io5";
import { BsGraphUp } from "react-icons/bs";
import { HiDocumentText } from "react-icons/hi2";
import { FaCartArrowDown } from "react-icons/fa6";
import { CiCalendarDate } from "react-icons/ci";
import api from "../../api/api";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { IoArrowRedoOutline } from "react-icons/io5";
import { FaCaretDown } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const org = useSelector((state) => state.setSelectedOrganization.selectedOrg);
  console.log(org);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get(`/api/pUsers/transactions`, {
          withCredentials: true,
        });

        console.log(res.data);

        setData(res.data.data.transactions);

        // dispatch(addData(res.data.outstandingData));
      } catch (error) {
        console.log(error);
      }
    };
    fetchTransactions();
  }, []);

  console.log(data);

  const today = new Date();

  // Filter data based on today's date
  const filteredData = data.filter((item) => {
    const companyFilter = item.cmp_id === org._id;
    const createdAtDate = new Date(item.createdAt);
    return (
      createdAtDate.toDateString() === today.toDateString() && companyFilter
    );
  });
  console.log(filteredData);

  const receiptTotal = filteredData.reduce((acc, curr) => {
    if (!curr.isCancelled) {
      return (acc = acc + curr.enteredAmount);
    } else {
      return acc;
    }
  }, 0);

  console.log(receiptTotal);

  console.log(filteredData);
  return (
    <div className="flex bg-[#f9fdff]  ">
      <div>
        <Sidebar TAB={"dash"} showBar={showSidebar} />
      </div>

      <div className="flex-1 h-screen overflow-y-scroll">
        <div className="sticky top-0 z-[10]">
          <div className="sticky top-0  ">
            <div className="bg-[#012a4a]   sticky top-0 p-3  text-white text-lg font-bold flex items-center gap-3  shadow-lg">
              <IoReorderThreeSharp
                onClick={handleToggleSidebar}
                className="block md:hidden text-3xl"
              />
              <p>Dashboard</p>
            </div>

            {/* tiles */}

            <div className=" bg-white shadow-lg p-2  flex items-center gap-3">
              <div className="bg-blue-500 rounded-full w-[30px] h-[30px]  flex justify-center items-center text-md  text-white font-bold">
                <div className="rounded-full w-[25px] h-[25px] md:w-[25px] md:h-[25px] bg-[#012a4a] flex items-center justify-center">
                  <p>{org?.name?.slice(0, 1)}</p>
                </div>
              </div>
              <p className="font-bold text-md md:text-lg">{org?.name}</p>
              <FaCaretDown />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 p-6 lg:px-12 gap-4 md:gap-6 bg-white  ">
            <Link to={"/pUsers/transaction"}>
              <div className="flex flex-wrap -mx-6   duration-150 hover:scale-105 ease-in-out cursor-pointer ">
                <div className="w-full px-6 ">
                  <div className="flex items-center px-2 py-3 md:px-5 md:py-2 shadow-sm rounded-md bg-slate-100">
                    <div className="p-3 rounded-full bg-green-500 bg-opacity-75 text-2xl text-white">
                      <IoReceiptSharp />
                    </div>

                    <div className="mx-5">
                      <h4 className=" sm:text-md md:text-2xl  font-semibold text-gray-700">
                        ₹{receiptTotal}
                      </h4>
                      <div className="text-gray-500">Receipts</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <div className="flex flex-wrap -mx-6  duration-150 hover:scale-105 ease-in-out cursor-pointer">
              <div className="w-full px-6 ">
                <div className="flex items-center px-2 py-3 md:px-5 md:py-2 shadow-sm rounded-md bg-slate-100">
                  <div className="p-3 rounded-full bg-red-500 bg-opacity-75 text-2xl text-white">
                    <BsGraphUp />
                  </div>

                  <div className="mx-5">
                    <h4 className=" sm:text-md md:text-2xl  font-semibold text-gray-700">
                      ₹0
                    </h4>
                    <div className="text-gray-500">Sale</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap -mx-6  duration-150 hover:scale-105 ease-in-out cursor-pointer">
              <div className="w-full px-6 ">
                <div className="flex items-center px-2 py-3 md:px-5 md:py-2 shadow-sm rounded-md bg-slate-100">
                  <div className="p-3 rounded-full bg-blue-500 bg-opacity-75 text-2xl text-white">
                    <HiDocumentText />
                  </div>

                  <div className="mx-5">
                    <h4 className=" sm:text-md md:text-2xl  font-semibold text-gray-700">
                      ₹0
                    </h4>
                    <div className="text-gray-500">Quotation</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap -mx-6  duration-150 hover:scale-105 ease-in-out cursor-pointer">
              <div className="w-full px-6 ">
                <div className="flex items-center px-2 py-3 md:px-5 md:py-2 shadow-sm rounded-md bg-slate-100">
                  <div className="p-3 rounded-full bg-orange-500 bg-opacity-75 text-2xl  text-white">
                    <FaCartArrowDown />
                  </div>

                  <div className="mx-5">
                    <h4 className=" sm:text-md md:text-2xl  font-semibold text-gray-700">
                      ₹0
                    </h4>
                    <div className="text-gray-500">Stock</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* tiles */}

          {/* transactions */}
          <hr />
          <hr />

          <div className=" bg-white px-4 p-2 z-40 text-gray-500 text-lg font-bold flex items-center gap-3 z shadow-lg sm:sticky top-[115px]">
            <p> Today's Transactions</p>

            <CiCalendarDate className="text-xl font-bold text-violet-500" />
            <FaCaretDown />
          </div>
        </div>

        <div className="z-0 p-3 md:p-5 lg:p-6">
          {/* one */}
          <div className="grid grid-cols-1 gap-4  text-center pb-7  ">
            {filteredData.map((el, index) => (
              <div
                key={index}
                onClick={() => {
                  navigate(`/pUsers/receiptDetails/${el._id}`);
                }}
                className={`${
                  el?.isCancelled ? "bg-gray-200 pointer-events-none " : ""
                } bg-[#f8ffff] cursor-pointer rounded-md shadow-xl border border-gray-100 flex flex-col justify-between px-4 transition-all duration-150 transform hover:scale-105 ease-in-out`}
              >
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
          {/* one */}
        </div>

        {/* transactions */}
      </div>
    </div>
  );
}

export default Dashboard;
