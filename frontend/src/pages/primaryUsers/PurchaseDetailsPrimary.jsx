import { MdOutlineArrowBack } from "react-icons/md";

import { IoMdShareAlt } from "react-icons/io";
import { MdTextsms } from "react-icons/md";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarSec from "../../components/secUsers/SidebarSec";
import Swal from "sweetalert2";
import Sidebar from "../../components/homePage/Sidebar";


function PurchaseDetailsPrimary() {
  const [data, setData] = useState("");
  const [refresh, setRefresh] = useState(false);

  const { id } = useParams();
  console.log(id);
  const location = useLocation();
  const navigate = useNavigate();



  useEffect(() => {
    const getTransactionDetails = async () => {
      try {
        const res = await api.get(`/api/pUsers/getPurchaseDetails/${id}`, {
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

  console.log(data);
  const backHandler = () => {
    if (location?.state?.from === "dashboard") {
      navigate("/pUsers/dashboard");
    } else {
      navigate("/pUsers/transaction");
    }
  };

  const chooseFormat = () => {
    Swal.fire({
      title: "Which format would you like?",
      html: "<p>Choose between:</p>",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Tax Invoice",
      denyButtonText: `POS format`,
      customClass: {
        container: "swal2-container-custom",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Swal.fire("Tax Invoice selected", "", "success");
        navigate(`/pUsers/sharePurchase/${data._id}`)
      } else if (result.isDenied) {
        navigate(`/pUsers/sharePurchaseThreeInch/${data._id}`)

      }
    });
    
  };

  return (
    <div className="flex relative">
      <div>
        <Sidebar />
      </div>

      <div className="bg-[rgb(244,246,254)] flex-1 h-screen overflow-y-scroll relative  pb-[70px] md:pb-0 ">
        {/* headinh section  */}
        <div className="flex bg-[#012a4a] items-center justify-between">
          <div className="flex items-center gap-3  text-white text-md p-4 ">
            <MdOutlineArrowBack
              onClick={backHandler}
              className="text-2xl cursor-pointer"
            />

            <h3 className="font-bold">Purchase Details</h3>
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
              ID #{data?.purchaseNumber}
            </p>
            <p className="text-xs font-medium text-gray-500 mt-1 ">
              {dayjs(data.createdAt).format("DD/MM/YYYY")}
            </p>
          </div>

          <div className="hidden md:block">
            <div className="  flex justify-center p-4 gap-12 text-lg text-violet-500 mr-4">

                <div
                 onClick={chooseFormat}

                 className="flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer">
                  <IoMdShareAlt />
                  <p className="text-black font-bold text-sm">Share</p>
                </div>
              {/* </Link> */}
              <div className="flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer">
                <MdTextsms className="text-green-500" />
                <p className="text-black font-bold text-sm">Sms</p>
              </div>
            </div>
          </div>
        </div>
        {/* payment details */}

        {/* party details */}

        <div className="bg-white mt-2 p-4  ">
          <div className="flex justify-between text-sm mb-2">
            <h2 className="font-semibold text-sm  text-gray-500">PARTY NAME</h2>
            {/* <div className="flex items-center gap-2 text-green-500">
              <p className="text-black">
                Current Balance :{" "}
                <span className="text-green-500 font-bold">
                ₹{(data.totalBillAmount - data.enteredAmount).toFixed(2)}
                </span>
              </p>
              <FaArrowDown />
            </div> */}
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

        <div className="flex justify-between p-4 bg-white mt-2">
          <p className="font-bold">Total Amount</p>
          <p className="font-bold">
            ₹ {parseInt(data?.finalAmount).toFixed(2)}
          </p>
        </div>

        <h3 className="font-bold text-md px-4 py-2 bg-white mt-2">Products</h3>
        {Array.isArray(data?.items) &&
          data.items.map((el, index) => (
            <div
              key={el?._id || index}
              className="p-4 bg-white text-gray-500 text-xs md:text-base "
            >
              <div className="flex justify-between items-center ">
                <div className="text-sm font-semibold">{el?.product_name}</div>
                <p className="text-sm font-semibold">₹ {el?.total || "0"}</p>
              </div>
              ₹
              {el.Priceleveles.find(
                (item) => item?.pricelevel === data?.priceLevel
              )?.pricerate || "N/A"}{" "}
              * {el?.count} + ( {el?.igst}% ) -
              {el?.discount > 0
                ? ` ₹${el?.discount} (discount)`
                : el?.discountPercentage > 0
                ? ` ${el?.discountPercentage}% (discount)`
                : " (0 discount)"}
            </div>
          ))}
           <h3 className="font-bold text-md px-4 py-2 bg-white mt-2">Additional Charges</h3>
            {data.additionalCharges && data.additionalCharges.length > 0 && (
          <div className="p-4 bg-white text-gray-500 text-xs md:text-base">
            {data.additionalCharges.map((values, index) => (
              <div key={index}>
                <p className="font-semibold text-black">{values.option}</p>
                <p> ₹{values?.value} + {values.taxPercentage ? `(${values.taxPercentage}%)` : ('0%')} = ₹{parseInt(values.value) + (parseInt(values.value) * ((parseInt(values.taxPercentage) || 0) / 100))}</p>
              </div>
            ))}
          </div>
        )}

        {/* payment method */}

        <div className=" block md:hidden ">
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 flex justify-center p-4 gap-12 text-lg text-violet-500  ">
          
              <div 
               onClick={chooseFormat}
              className="flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer">
                <IoMdShareAlt />
                <p className="text-black font-bold text-sm">Share</p>
              </div>
            {/* </Link> */}
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

export default PurchaseDetailsPrimary;
