import { MdOutlineArrowBack } from "react-icons/md";
import Sidebar from "../../components/homePage/Sidebar";
import { FaArrowDown } from "react-icons/fa6";
import { FcCancel } from "react-icons/fc";
import { IoMdShareAlt } from "react-icons/io";
import { MdTextsms } from "react-icons/md";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import SidebarSec from "../../components/secUsers/SidebarSec";

function ReceiptDetails() {
  const [data, setData] = useState("");
  const [refresh, setRefresh] = useState(false);

  const { id } = useParams();
  console.log(id);

  useEffect(() => {
    const getTransactionDetails = async () => {
      try {
        const res = await api.get(`/api/sUsers/getTransactionDetails/${id}`, {
          withCredentials: true,
        });
        setData(res.data.data);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    getTransactionDetails();
  }, [refresh]);

  const handleCancel = async (id) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "Once cancelled, you cannot undo this action!",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it!",
    });

    if (confirmed.isConfirmed) {
      try {
        const res = await api.post(
          `/api/sUsers/cancelTransaction/${id}`,
          {},
          {
            withCredentials: true,
          }
        );

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: res.data.message,
        });

        setRefresh(!refresh);
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response.data.message,
        });
      }
    }
  };
  console.log(data);

  return (
    <div className="flex">
      <div>
        <SidebarSec />
      </div>

      <div className="bg-[rgb(244,246,254)] flex-1 h-screen overflow-y-scroll relative ">
        {/* headinh section  */}
        <div className="flex bg-[#012a4a] items-center justify-between">
          <div className="flex items-center gap-3  text-white text-md p-4 ">
            <Link to={'/sUsers/transaction'}>
              <MdOutlineArrowBack className="text-2xl" />
            </Link>
            <h3 className="font-bold">Received Payment</h3>
          </div>
          {/* <div className="text-white mr-4 bg-pink-700 p-0 px-2 rounded-md text-center transition-all duration-150 transform hover:scale-105">
            <button>Cancel</button>
          </div> */}
        </div>
        {/* headinh section  */}

        {/* payment details */}
        <div className=" mt-3 bg-white p-4">
          <p className="text-sm text-violet-500 font-semibold ">
            ID #{data._id}
          </p>
          <p className="text-xs font-medium text-gray-500 mt-1 ">
            {dayjs(data.createdAt).format("DD/MM/YYYY")}
          </p>
        </div>
        {/* payment details */}

        {/* party details */}

        <div className="bg-white mt-2 p-4  ">
          <div className="flex justify-between text-sm mb-2">
            <h2 className="font-semibold text-sm  text-gray-500">PARTY NAME</h2>
            <div className="flex items-center gap-2 text-green-500">
              <p className="text-black">
                Current Balance :{" "}
                <span className="text-green-500 font-bold">
                  ₹{(data.totalBillAmount - data.enteredAmount).toFixed(2)}
                </span>
              </p>
              <FaArrowDown />
            </div>
          </div>
          <hr />
          <hr />
          <hr />
          <div className="mt-2">
            <p className="font-semibold ">{data.party_name}</p>
            <p className="text-xs mt-1 text-gray-400 font-semibold ">
              {data.mobile_no !== "null" ? data.mobile_no : ""}
            </p>
          </div>
        </div>
        {/* party details */}
        {/* party Total Mount */}

        <div className="flex justify-between p-4 bg-white mt-2">
          <p className="font-bold">Settled Amount</p>
          <p className="font-bold">₹ {parseInt((data.enteredAmount)).toFixed(2)}</p>
        </div>
        {/* party Total Mount */}
        {/* payment method */}

        <div className="p-4 bg-white mt-2">
          <h3 className="font-bold text-sm">PAYMENT MODE</h3>
          <p className="font-semibold text-sm mt-3 uppercase">
            {data.paymentMethod}
          </p>

          {(data.paymentMethod == "cheque" || data.paymentMethod == "upi") && (
            <h3 className="text-sm font-semibold mt-1 text-gray-500">
              {data.paymentDetails.bank}
            </h3>
          )}
        </div>
        {/* payment method */}

        <div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex justify-center p-4 gap-12 text-lg text-violet-500">
            <div
              onClick={() => handleCancel(data._id)}
              disabled={data.isCancelled}
              className={`flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110 cursor-pointer ${
                data.isCancelled ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <FcCancel className="text-violet-500" />
              <p className="text-black font-bold text-sm">
                {data.isCancelled ? "Cancelled" : "Cancel"}
              </p>
            </div>
            <div className="flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer">
              <IoMdShareAlt />
              <p className="text-black font-bold text-sm">Share</p>
            </div>
            <div className="flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer">
              <MdTextsms className="text-green-500" />
              <p className="text-black font-bold text-sm">Sms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceiptDetails;
