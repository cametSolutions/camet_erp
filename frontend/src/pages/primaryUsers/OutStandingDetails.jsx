/* eslint-disable react/prop-types */

import "./outStanding.css";
import { FaPhoneVolume } from "react-icons/fa6";
import { IoPersonSharp } from "react-icons/io5";
import { TbMoneybag } from "react-icons/tb";
import { FaChevronDown } from "react-icons/fa";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";

function OutStandingDetails({ onTabChange, id, cmp_id, total }) {
  const [data, setData] = useState([]);
  const [enteredAmount, setEnteredAmount] = useState(0);
  console.log(total);

  useEffect(() => {
    const fetchOutstandingDetails = async () => {
      try {
        let endpoint;

        if (id) {
          if (cmp_id) {
            // Both id and cmp_id are defined
            endpoint = `/api/pUsers/fetchOutstandingDetails/${id}/${cmp_id}`;
          } else {
            // Only id is defined
            endpoint = `/api/pUsers/fetchOutstandingDetails/${id}`;
          }

          const res = await api.get(endpoint, {
            withCredentials: true,
          });

          setData(res.data.outstandings);
        } else {
          // Handle the case when id is undefined
          console.error("id is undefined");
          // Optionally set some default data or show an error message
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };

    fetchOutstandingDetails();
  }, []);

  const handleAmountChange = (event) => {
    const amount = parseFloat(event.target.value) || 0;
    setEnteredAmount(amount);
  };
  let remainingAmount = enteredAmount;

  console.log(data);

  return (
    <div className=" h-screen overflow-scroll lg:px-[100px]  lg:mt-2  pb-28 bg-[rgb(244,246,254)]   ">
      <div className="sticky  top-0 z-10 w-full shadow-lg  flex flex-col rounded-[3px] gap-1">
        {/* receive payment */}

        <div className=" flex flex-col rounded-[3px] gap-1  bg-white">
          <div className="bg-[#012a4a] shadow-lg px-4 py-4 pb-3 flex justify-between items-center  ">
            <div className="flex items-center gap-2">
              <IoIosArrowRoundBack
            
                className="text-3xl text-white "
              />
              <p className="text-md text-white font-bold text-lg">Receive Payment</p>
            </div>
            <p className="text-[12px] text-white mt-1 font-bold  ">
              23 JAN 2024
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
                <p className="  text-green-600">₹{total}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaPhoneVolume />
              <p className="text-[13px] ">
                {data[0]?.mobile_no === "null" ? "Nil" : data[0]?.mobile_no}
              </p>
            </div>
          </div>

          <div className="flex  gap-2 mt-0 bg-white shadow-lg px-4 py-5  justify-between items-center rounded-md">
            <label
              className=" uppercase text-blueGray-600 text-sm font-bold px-3 flex "
              htmlFor="grid-password"
            >
              Amount <span className="text-red-500 ml-3">*</span>
            </label>
            <input
              onChange={handleAmountChange}
              type="number"
              placeholder="₹12,500"
              className="border-0 px-3 py-4 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            />
          </div>
          <div
            className="bg-white px-4 py-4 pb-3 mt-3 rounded-md flex gap-2"
            style={{ boxShadow: "0px -4px 115px rgba(244,246,254 0.1)" }}
          >
            <p className="text-[11px] font-bold"># INVOICES ({data.length})</p>
            <FaChevronDown />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1 mt-2 text-center px-2  ">
        {data.map((el, index) => {
          const billAmount = parseFloat(el.bill_amount) || 0;
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
                  <input type="checkbox" 
                  checked={remainingBillAmount===0}
                 
                   className="w-7 h-7" />
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
                  <p className="   ">₹{el.bill_amount}</p>
                  <p className=" text-[12px]  text-green-500">₹ {settledAmount} Settled</p>
                <p className=" text-[12px]  text-red-500">₹ {remainingBillAmount} Remaining</p>
                </div>
              </div>
            </div>
          );
        })}

        <div className=" block md:hidden fixed bottom-0 p-4 left-0 w-full flex justify-center bg-white ">
          <div
            onClick={() => onTabChange("payment")}
            className="bg-blue-500 p-4 rounded-lg w-full text-white font-bold"
          >
            Next
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutStandingDetails;
