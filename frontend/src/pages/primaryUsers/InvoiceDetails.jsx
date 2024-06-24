import { MdOutlineArrowBack } from "react-icons/md";
import Sidebar from "../../components/homePage/Sidebar";

import { IoMdShareAlt } from "react-icons/io";
import { MdTextsms } from "react-icons/md";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import SalesOrderProductDetails from "../../components/common/SalesOrderProductDetails";

function InvoiceDetails() {
  const [data, setData] = useState("");

  const { id } = useParams();
  console.log(id);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const getTransactionDetails = async () => {
      try {
        const res = await api.get(`/api/pUsers/getInvoiceDetails/${id}`, {
          withCredentials: true,
        });
        setData(res.data.data);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    getTransactionDetails();
  }, []);

  console.log(data);
  const backHandler = () => {
    if (location?.state?.from === "dashboard") {
      navigate("/pUsers/dashboard");
    } else {
      navigate("/pUsers/transaction");
    }
  };


  return (
    <div className="flex relative">
      <div>
        <Sidebar />
      </div>

      <div className="bg-[rgb(244,246,254)] flex-1 h-screen overflow-y-scroll relative  pb-[70px] md:pb-0 ">
        {/* headinh section  */}
        <div className="flex bg-[#012a4a] items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3  text-white text-md p-4 ">
            <MdOutlineArrowBack
              onClick={backHandler}
              className="text-2xl cursor-pointer"
            />

            <h3 className="font-bold">Order Details</h3>
          </div>
          {/* <div className="text-white mr-4 bg-pink-700 p-0 px-2 rounded-md text-center transition-all duration-150 transform hover:scale-105">
            <button>Cancel</button>
          </div> */}
        </div>
        {/* headinh section  */}

        {/* payment details */}
        <div className="bg-white p-4 mt-3 flex justify-between items-center">
          <div className=" ">
            <p className="text-sm text-violet-500 font-semibold ">
              ID #{data?.orderNumber}
            </p>
            <p className="text-xs font-medium text-gray-500 mt-1 ">
              {dayjs(data.createdAt).format("DD/MM/YYYY")}
            </p>
          </div>

          <div className="hidden md:block z-10">
            <div className="  flex justify-center p-4 gap-12 text-lg text-violet-500 mr-4">
             
              <Link to={`/pUsers/shareInvoice/${data._id}`}>
              <div
                // onClick={chooseFormat}
                className="flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer"
              >
                <IoMdShareAlt />
                <p className="text-black font-bold text-sm">Share</p>
              </div>
              </Link>
              <div className="flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer">
                <MdTextsms className="text-green-500" />
                <p className="text-black font-bold text-sm">Sms</p>
              </div>
            </div>
          </div>
        </div>
  

        <div className="bg-white mt-2 p-4  ">
          <div className="flex justify-between text-sm mb-2">
            <h2 className="font-semibold text-sm  text-gray-500">PARTY NAME</h2>
           
          </div>
          <hr />
          <hr />
          <hr />
          <div className="mt-2">
            <p className="font-semibold ">{data?.party?.partyName}</p>
            <p className="text-xs mt-1 text-gray-400 font-semibold ">
              {data?.party?.mobileNumber !== "null"
                ? data?.party?.mobileNumber
                : ""}
            </p>
          </div>
        </div>
        {/* party details */}
        {/* party Total Mount */}

        <SalesOrderProductDetails
          data={data}
          items={data?.items}
          priceLevel={data?.priceLevel}
          additionalCharges={data?.additionalCharges}
        />
        {/* payment method */}

        <div className=" block md:hidden ">
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 flex justify-center p-4 gap-12 text-lg text-violet-500  ">
            {/* <div
              onClick={() => handleCancel(data?._id)}
              disabled={data?.isCancelled}
              className={`flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110 cursor-pointer ${
                data?.isCancelled ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <FcCancel className="text-violet-500" />
              <p className="text-black font-bold text-sm">
                {data?.isCancelled ? "Cancelled" : "Cancel"}
              </p>
            </div> */}
            {/* <div
              onClick={() => navigate(`/pUsers/editInvoice/${data._id}`)}
              className="flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer"
            >
              <FaEdit className="text-blue-500" />
              <p className="text-black font-bold text-sm">Edit</p>
            </div> */}
            <Link to={`/pUsers/shareInvoice/${data._id}`}>
              <div 
                //  onClick={chooseFormat}
              className="flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer">
                <IoMdShareAlt />
                <p className="text-black font-bold text-sm">Share</p>
              </div>
            </Link>
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

export default InvoiceDetails;
