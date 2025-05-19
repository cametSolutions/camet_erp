// import { MdTextsms } from "react-icons/md";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// import { FaEdit } from "react-icons/fa";
import {
  // useNavigate,
  useLocation,
} from "react-router-dom";
import SalesProductDetails from "./SalesProductDetails";
// import SwallFireForPdf from "../../../components/common/SwallFireForPdf";
// import CancelButton from "../../../components/common/CancelButton";
import VoucherDetailsHeader from "./VoucherDetailsHeader";
import PaymentSplittingDetails from "../../../components/secUsers/main/paymentSplitting/PaymentSplittingDetails";
import VoucherDetailsParty from "./VoucherDetailsParty";
import useFetch from "@/customHook/useFetch";
import TitleDiv from "@/components/common/TitleDiv";
import { formatVoucherType } from "../../../../utils/formatVoucherType";
import VoucherDetailsActionButtons from "./actionButtons/VoucherDetailsActionButtons";
import VoucherDetailsToGodown from "./VoucherDetailsToGodown";

function VoucherDetails() {
  const [data, setData] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { id } = useParams();
  const location = useLocation();

  const getEndPoint = () => {
    const pathName = location.pathname.split("/")[2];

    if (pathName === "vanSaleDetails" || pathName === "salesDetails") {
      return "getSalesDetails";
    } else {
      return `get${pathName}`;
    }
  };

  const params = {};
  if (location.pathname.split("/")[2] === "vanSaleDetails") {
    params.vanSale = true;
  }

  const endPoint = getEndPoint();

  const {
    data: voucherDetails,
    loading,
    refreshHook,
  } = useFetch(endPoint ? `/api/sUsers/${endPoint}/${id}` : null, params);
  useEffect(() => {
    if (voucherDetails) {
      setData(voucherDetails.data);
    }
  }, [voucherDetails, endPoint]);

  const getVoucherNumberTitle = () => {
    let voucherTypeGlobal;
    if (voucherDetails) {
      const {
        data: { voucherType },
      } = voucherDetails;

      voucherTypeGlobal = voucherType;
    } else {
      voucherTypeGlobal = "";
    }

    if (!voucherTypeGlobal) return "";
    if (voucherTypeGlobal === "sales" || voucherTypeGlobal === "vanSale") {
      return "salesNumber";
    }
    if (voucherTypeGlobal === "saleOrder") {
      return "orderNumber";
    } else {
      return voucherTypeGlobal + "Number";
    }
  };

  const reFetch = () => {
    setRefresh(!refresh);
  };

  const wholeLoading = loading || actionLoading;
  return (
    <div className="bg-[rgb(244,246,254)] flex-1  relative  pb-[70px] md:pb-0  ">
      {/* headinh section  */}
      <TitleDiv
        title={
          formatVoucherType(data?.voucherType) + " Details" || "Voucher Details"
        }
        loading={wholeLoading}
      />
      {/* headinh section  */}

      {!loading && (
        <div>
          <VoucherDetailsHeader
            data={data}
            reFetchParent={reFetch}
            editLink={`/sUsers/editSale/${data?._id}`}
            user={"secondary"}
            number={data?.[getVoucherNumberTitle()]}
            tab={"Sales"}
            reFetch={refreshHook}
            setActionLoading={setActionLoading}
            actionLoading={actionLoading}
          />

          {data?.voucherType === "stockTransfer" ? (
           <VoucherDetailsToGodown data={data} />
          ) : (
            <VoucherDetailsParty data={data} />
          )}

          <SalesProductDetails
            data={data}
            items={data?.items}
            priceLevel={data?.priceLevel}
            additionalCharges={data?.additionalCharges}
            paymentSplittingData={data?.paymentSplittingData}
          />

          {data?.paymentSplittingData &&
            data?.paymentSplittingData?.splittingData?.length > 0 && (
              <PaymentSplittingDetails data={data?.paymentSplittingData} />
            )}

          {/* payment method */}

          <div className=" block sm:hidden z-0 ">
            <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 flex justify-center p-4 gap-12 text-lg text-violet-500  ">
              {/* <CancelButton
                id={data._id}
                tab="Sales"
                isCancelled={data?.isCancelled}
                reFetch={reFetch}
                isEditable={data?.isEditable}
              />

              <div
                onClick={handleEdit}
                className="flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer"
              >
                <FaEdit className="text-blue-500" />
                <p className="text-black font-bold text-sm">Edit</p>
              </div>
              <SwallFireForPdf data={data} />

              <div className="flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer">
                <MdTextsms className="text-green-500" />
                <p className="text-black font-bold text-sm">Sms</p>
              </div> */}

              <VoucherDetailsActionButtons
                data={data}
                reFetch={refreshHook}
                setActionLoading={setActionLoading}
                actionLoading={actionLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoucherDetails;
