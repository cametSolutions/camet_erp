/* eslint-disable react/prop-types */

import { useLocation } from "react-router-dom";
import TitleDiv from "../../../../components/common/TitleDiv";
import { useState } from "react";
import { FaRegCircleDot } from "react-icons/fa6";

const PaymentSplitting = () => {
  const location = useLocation();
  const [totalAmount, setTotalAmount] = useState(0);

  const bankOptions = {
    cash: ["Main Cash Registry", "Secondary Cash Registry", "Petty Cash"],
    online: ["SBI Bank", "HDFC Bank", "ICICI Bank", "Axis Bank"],
    cheque: ["SBI Bank", "HDFC Bank", "ICICI Bank", "Axis Bank"],
    credit: ["AMEX", "Mastercard", "Visa", "Discover"],
  };

  const [payments, setPayments] = useState([
    {
      mode: "cash",
      title: "Cash",
      bank: "",
      amount: "",
      icon: <FaRegCircleDot className="h-3 w-3  " />,
    },
    {
      mode: "online",
      title: "NEFT/Upi",
      bank: "",
      amount: "",
      icon: <FaRegCircleDot className="h-3 w-3 " />,
    },
    {
      mode: "cheque",
      title: "Cheque",
      bank: "",
      amount: "",
      icon: <FaRegCircleDot className="h-3 w-3 " />,
    },
    {
      mode: "credit",
      title: "Credit",
      bank: "",
      amount: "",
      icon: <FaRegCircleDot className="h-3 w-3" />,
    },
  ]);

  const handleAmountChange = (index, value) => {
    const newPayments = [...payments];
    newPayments[index].amount = value;
    setPayments(newPayments);

    const total = newPayments.reduce((sum, payment) => {
      return sum + (Number(payment.amount) || 0);
    }, 0);
    setTotalAmount(total);
  };

  const handleBankChange = (index, value) => {
    const newPayments = [...payments];
    newPayments[index].bank = value;
    setPayments(newPayments);
  };

  // Mobile payment card component
  const PaymentCard = ({ payment, index }) => (
    <div className="bg-white  rounded-lg shadow-sm border mb-2 p-3  ">
      <div className="flex items-center gap-2 text-gray-700 mb-2 " >
        {payment.icon}
        <span className="capitalize font-bold text-xs  ">{payment.mode}</span>
      </div>
      <select
        value={payment.bank}
        onChange={(e) => handleBankChange(index, e.target.value)}
        className="w-full p-2 mb-2 text-sm border-b border-0  no-focus-box"
      >
        <option value="" className="text-xs">Select source</option>
        {bankOptions[payment.mode].map((bank) => (
          <option key={bank} value={bank}>
            {bank}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Enter amount"
        value={payment.amount}
        onChange={(e) => handleAmountChange(index, e.target.value)}
        className="w-full p-2 text-sm border-b border-0  no-focus-box"
      />
    </div>
  );

  return (
    <>
      <TitleDiv title="Payment Splitting" from={location?.state?.from} />

      <div className="p-0 py-3 sm:p-6 sm:mt-2  mx-4 sm:mx-5 shadow-lg  bg-slate-50 ">
        {/* <div className=" p-3 bg-[#A3AFC9] ">
       <p className=" font-bold text-white "> Total Amount: {totalAmount}</p>
      </div> */}
        <div className="bg-white rounded-lg shadow-lg  mb-6 ">
          <div className="">
            {/* Desktop view */}
            <div className="hidden sm:block overflow-x-auto ">
              <table className="w-full ">
                <thead className="border-b bg-gray-200 text-gray-600 ">
                  <tr>
                    <th className="text-left p-3  font-bold ">Mode</th>
                    <th className="text-left p-3  font-bold">Bank/Source</th>
                    <th className="text-left p-3  font-bold">Amount</th>
                  </tr>
                </thead>

                <tbody className="mt-4  ">
                  {payments.map((payment, index) => (
                    <tr
                      key={payment.mode}
                      className="border-b hover:bg-gray-50  "
                    >
                      <td className="p-5 py-6">
                        <div className="flex items-center gap-4 text-gray-700 ">
                          {payment.icon}
                          <span className=" font-bold text-sm  ">
                            {payment.title}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <select
                          value={payment.bank}
                          onChange={(e) =>
                            handleBankChange(index, e.target.value)
                          }
                          className="w-full p-2 text-sm border-b outline-none border-0  no-focus-box"
                        >
                          <option value="">Select source</option>
                          {bankOptions[payment.mode].map((bank) => (
                            <option key={bank} value={bank}>
                              {bank}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          placeholder="Enter amount"
                          value={payment.amount}
                          onChange={(e) =>
                            handleAmountChange(index, e.target.value)
                          }
                          className="w-full p-2 text-sm border-b outline-none border-0  no-focus-box"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view */}
            <div className="sm:hidden p-2">
              {payments.map((payment, index) => (
                <PaymentCard
                  key={payment.mode}
                  payment={payment}
                  index={index}
                />
              ))}
            </div>

            {/* Total Amount Display */}
            <div className="mt-6 bg-gray-200 border text-gray-700  p-4 flex justify-between ">
              <div className=" font-bold text-xs flex flex-col gap-2">
                <span> Total Amount </span>
                <span>{totalAmount.toFixed(2)}</span>
              </div>
              <div className=" font-bold text-xs flex flex-col gap-2">
                <span> Balance Amount </span>
                <span className="text-right">{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            className="bg-pink-500  w-20 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
            type="button"
            // onClick={submitHandler}
          >
            Save
          </button>
          <button
            className="  w-20 text-black active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
            type="button"
            // onClick={submitHandler}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default PaymentSplitting;
