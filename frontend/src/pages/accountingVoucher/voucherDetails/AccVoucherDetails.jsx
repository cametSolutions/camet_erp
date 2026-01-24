import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {  useLocation } from "react-router-dom";
import useFetch from "../../../customHook/useFetch";
import { formatVoucherType } from "../../../../utils/formatVoucherType";
import AccVoucherDetailsComponent from "./AccVoucherDetailsComponent";

function AccVoucherDetails() {
  const [data, setData] = useState("");
  const [actionLoading, setActionLoading] = useState(false);


  const { id } = useParams();
  const location = useLocation();

  let voucherType;
  if (location?.pathname.includes("receipt")) {
    voucherType = "receipt";
  } else if (location?.pathname.includes("payment")) {
    voucherType = "payment";
  }



  const {
    data: transactionDetails,
    loading,
    refreshHook,
  } = useFetch(`/api/sUsers/get${voucherType}Details/${id}`);
console.log("hhh")
  useEffect(() => {
    if (transactionDetails) {
console.log(transactionDetails[voucherType])
      setData(transactionDetails[voucherType]);
    }
  }, [transactionDetails]);

  const getVoucherNumberTitle = () => {
    const voucherType = data?.voucherType;
    if (!voucherType) return "";

    if (voucherType === "receipt") return "receiptNumber";
    if (voucherType === "payment") return "paymentNumber";

    return `${voucherType}Number`;
  };





  return (
    <AccVoucherDetailsComponent
      loading={loading}
      data={data}
      title={`${formatVoucherType(data?.voucherType)} Details`}
      voucherNumber={data[getVoucherNumberTitle()]}
      setActionLoading={setActionLoading}
      actionLoading={actionLoading}
      refreshHook={refreshHook}
 
    />
  );
}

export default AccVoucherDetails;
