import SidebarSec from "../../components/secUsers/SidebarSec";
import { FaPhoneVolume } from "react-icons/fa6";
import { IoPersonSharp } from "react-icons/io5";
import { TbMoneybag } from "react-icons/tb";
import { FaChevronDown } from "react-icons/fa";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { PrAddSettlementData } from "../../../slices/prSettlementDataSlice";
import Sidebar from "../../components/homePage/Sidebar";

function OutStandingDetails({ onTabChange }) {
  const [data, setData] = useState([]);
  const prevAmount = useSelector(
    (state) => state.prSettlementData.prSettlementData.enteredAmount
  );

  console.log(data);

  const [enteredAmount, setEnteredAmount] = useState(() => {
    const storedAmount = prevAmount;

    // Convert to a valid number or default to 0
    const parsedAmount = parseFloat(storedAmount);
    const validAmount = !isNaN(parsedAmount) ? parsedAmount : 0;

    return validAmount;
  });


  function formatAmount(amount) {
    // Use toLocaleString to add commas to the number
    return amount.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }
  

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { party_id, cmp_id, total } = useParams();

  useEffect(() => {
    const fetchOutstandingDetails = async () => {
      try {
        let endpoint;
        endpoint = `/api/pUsers/fetchOutstandingDetails/${party_id}/${cmp_id}`;

        const res = await api.get(endpoint, {
          withCredentials: true,
        });

        setData(res.data.outstandings);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };

    fetchOutstandingDetails();
  }, [party_id, cmp_id]);

  const handleAmountChange = (event) => {
    const amount = parseFloat(event.target.value) || 0;
    if (amount > total) {
      toast.error("You can't enter an amount greater than total amount");
      return;
    }
    setEnteredAmount(amount);
  };
  let remainingAmount = enteredAmount;

  const handleNextClick = () => {
    console.log(enteredAmount);

    if (enteredAmount == null || enteredAmount <= 0) {
      toast.error("Enter an amount");
      return;
    }

    const results = [];
    let remainingAmount = enteredAmount;

    data.forEach((el) => {
      const billAmount = parseFloat(el.bill_pending_amt) || 0;
      const settledAmount = Math.min(billAmount, remainingAmount);

      // Check if settledAmount is greater than zero before including it in results
      if (settledAmount > 0) {
        const remainingBillAmount = Math.max(0, billAmount - settledAmount);

        remainingAmount -= settledAmount;

        const resultObject = {
          billNo: el.bill_no,
          settledAmount,
          remainingAmount: remainingBillAmount,
        };

        results.push(resultObject);
      }
    });

   

    const settlementData = {
      party_id: data[0]?.party_id,
      party_name: data[0]?.party_name,
      mobile_no:data[0]?.mobile_no,
      totalBillAmount: parseFloat(total),
      cmp_id: data[0]?.cmp_id,
      billData: results,
      enteredAmount: enteredAmount,

    };

    console.log(settlementData);
    dispatch(PrAddSettlementData(settlementData));
    navigate("/pUsers/payment");
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className=" flex-1 h-screen overflow-scroll lg:px-[100px]  lg:mt-2  pb-28 bg-[rgb(244,246,254)]   ">
        <div className="sticky  top-0 z-10 w-full shadow-lg  flex flex-col rounded-[3px] gap-1">
          {/* receive payment */}

          <div className=" flex flex-col rounded-[3px] gap-1  bg-white">
            <div className="bg-[#012a4a] shadow-lg px-4 py-4 pb-3 flex justify-between items-center  ">
              <div className="flex items-center gap-2">
                <IoIosArrowRoundBack
                  onClick={() => {
                    navigate("/pUsers/outstanding");
                  }}
                  className="text-3xl text-white cursor-pointer"
                />
                <p className="text-md text-white font-bold">
                  Outstanding Details
                </p>
              </div>
              <p className="text-[12px] text-white mt-1 font-bold  ">
                {dayjs(new Date()).format("DD/MM/YYYY")}
              </p>
              {/* <button
              onClick={() => {
                onTabChange("outstanding");
              }}
            >
              back
            </button> */}
            </div>

            {/* party details */}
            <div className="bg-white shadow-lg px-4 py-5 flex justify-between rounded-md ">
              <div className="flex-col">
                <div className="flex items-center gap-2">
                  <IoPersonSharp />
                  <p className="font-medium">{data[0]?.party_name}</p>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <TbMoneybag className="" />
                  <p className="  text-green-600">
                    ₹{formatAmount(parseFloat(total))}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaPhoneVolume />
                <p className="text-[13px] ">
                  {data[0]?.mobile_no === "null" ? "Nil" : data[0]?.mobile_no}
                </p>
              </div>
            </div>

            <div className="flex  gap-0 mt-0 bg-white shadow-lg px-4 py-5  justify-between  items-center rounded-md">
              <div className="flex items-center w-3/4 ">
                <label
                  className=" uppercase text-blueGray-600 text-sm font-bold px-3  "
                  htmlFor="grid-password"
                >
                  Amount
                </label>
                <input
                  onChange={handleAmountChange}
                  type="text"
                  value={(enteredAmount)}
                  placeholder="₹12,500"
                  className="border-  px-3 py-4 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow-lg focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                />
              </div>
              {/* <Link to={"/sUsers/payment"}> */}
              <div>
                <button
                  onClick={handleNextClick}
                  className=" hidden md:block text-white p-4 bg-blue-500 text-md rounded-lg w-[150px]"
                >
                  Next
                </button>
              </div>
              {/* </Link> */}
            </div>
            <div
              className="bg-white px-4 py-4 pb-3 mt-3 rounded-md flex gap-2"
              style={{ boxShadow: "0px -4px 115px rgba(244,246,254 0.1)" }}
            >
              <p className="text-[11px] font-bold">
                # INVOICES ({data.length})
              </p>
              <FaChevronDown />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1 mt-2 text-center px-2  ">
          {data.map((el, index) => {
            const billAmount = parseFloat(el.bill_pending_amt) || 0;
            const settledAmount = Math.min(billAmount, remainingAmount);
            const remainingBillAmount = Math.max(0, billAmount - settledAmount);

            remainingAmount -= settledAmount;

            return (
              <div
                key={index}
                className=" h-[100px] bg-[#f8ffff] rounded-md shadow-xl border border-gray-100  flex justify-between px-4  transition-all duration-150 transform hover:scale-105 ease-in-out "
              >
                <div className=" h-full px-2 py-8 lg:p-6 w-[200px] md:w-[180px] lg:w-[300px] flex justify-center items-start relative flex-col ">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settledAmount > 0 || remainingBillAmount == 0}
                      className="w-7 h-7"
                    />
                    <div className="flex flex-col gap-1 ml-2">
                      <p className="font-bold text-[12px]">#{el.bill_no}</p>
                      <pc className="text-sm text-gray-500 text-violet-600">
                        {/* {el.bill_date} */}
                        {dayjs(el.bill_date).format("DD/MM/YYYY")}
                      </pc>
                    </div>
                  </div>
                </div>
                <div className=" h-full p-2 lg:p-6 w-[150px] md:w-[180px] lg:w-[300px] flex justify-center items-end  relative flex-col">
                  <div className="flex-col justify-center text-end ">
                    <p className="   ">₹{formatAmount(el.bill_pending_amt)}</p>
                    <p className=" text-[12px]  text-green-500">
                      ₹ {formatAmount(settledAmount)} Settled
                    </p>

                    <p className=" text-[12px]  text-red-500">
                      ₹ {formatAmount(remainingBillAmount)} Remaining
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className=" block md:hidden fixed bottom-0 p-4 left-0 w-full flex justify-center bg-white ">
            <div
              onClick={handleNextClick}
              className="bg-blue-500 p-4 rounded-lg w-full text-white font-bold"
            >
              Next
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutStandingDetails;
