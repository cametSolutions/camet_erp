import { MdOutlineArrowBack } from "react-icons/md";
import { MdTextsms } from "react-icons/md";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { FaEdit } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import SalesProductDetails from "../../components/common/SalesProductDetails";
import SwallFireForPdf from "../../components/common/SwallFireForPdf";
import VoucherDetailsHeader from "../../components/common/VoucherDetailsHeader";

function VanSaleDetailsSecondary() {
  const [data, setData] = useState("");
  const [refresh, setRefresh] = useState(false);

  const { id } = useParams();
  console.log(id);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const getTransactionDetails = async () => {
      try {
        const res = await api.get(`/api/sUsers/getSalesDetails/${id}`, {
          params: { vanSale: true },
          withCredentials: true,
        });
        setData(res.data.data);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    getTransactionDetails();
  }, [refresh,id]);

  const reFetch = () => {
    setRefresh(!refresh);
  };

  console.log(data);
  const backHandler = () => {
    if (location?.state?.from === "dashboard") {
      navigate("/sUsers/dashboard");
    } else {
      navigate("/sUsers/transaction");
    }
  };

  console.log(data.items);

  return (
    <div className="bg-[rgb(244,246,254)] flex-1  relative  pb-[70px] md:pb-0 ">
      {/* headinh section  */}
      <div className="flex bg-[#012a4a] items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3  text-white text-md p-4 ">
          <MdOutlineArrowBack
            onClick={backHandler}
            className="text-2xl cursor-pointer"
          />

          <h3 className="font-bold">Van Sale Details</h3>
        </div>
        {/* <div className="text-white mr-4 bg-pink-700 p-0 px-2 rounded-md text-center transition-all duration-150 transform hover:scale-105">
            <button>Cancel</button>
          </div> */}
      </div>
      {/* headinh section  */}

      

      <VoucherDetailsHeader
        data={data}
        reFetchParent={reFetch}
        editLink={`/sUsers/editVanSale/${data?._id}`}
        user={"secondary"}
        number={data?.salesNumber}
        tab={"vanSale"}
      />

      {/* party details */}

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

      <SalesProductDetails
        data={data}
        items={data?.items}
        priceLevel={data?.priceLevel}
        additionalCharges={data?.additionalCharges}
      />

      {/* payment method */}

      <div className=" block md:hidden z-0 ">
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 flex justify-center p-4 gap-12 text-lg text-violet-500  ">
          <div
            onClick={() => navigate(`/sUsers/editVanSale/${data._id}`)}
            className="flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer"
          >
            <FaEdit className="text-blue-500" />
            <p className="text-black font-bold text-sm">Edit</p>
          </div>
          {/* <Link to={`/sUsers/shareSales/${data._id}`}> */}
          <SwallFireForPdf data={data} tab="vanSale" />

          <div className="flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer">
            <MdTextsms className="text-green-500" />
            <p className="text-black font-bold text-sm">Sms</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VanSaleDetailsSecondary;
