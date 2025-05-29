import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api/api";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import useFetch from "../../../customHook/useFetch";
import { useSelector } from "react-redux";
import { formatVoucherType } from "../../../../utils/formatVoucherType";
import AccVoucherDetailsComponent from "./AccVoucherDetailsComponent";

function AccVoucherDetails() {
  const [data, setData] = useState("");

  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  let voucherType;
  if (location?.pathname.includes("receipt")) {
    voucherType = "receipt";
  } else if (location?.pathname.includes("payment")) {
    voucherType = "payment";
  }

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const {
    data: transactionDetails,
    loading,
    refreshHook,
  } = useFetch(`/api/sUsers/get${voucherType}Details/${id}`);

  useEffect(() => {
    if (transactionDetails) {
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
          `/api/sUsers/cancelReceipt/${id}/${cmp_id}`,
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

        refreshHook();
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response.data.message,
        });
      }
    }
  };

  const backHandler = () => {
    if (location?.state?.from === "dashboard") {
      navigate("/sUsers/dashboard");
    } else {
      navigate("/sUsers/transaction");
    }
  };

  return (
    <AccVoucherDetailsComponent
      loading={loading}
      backHandler={backHandler}
      data={data}
      handleCancel={handleCancel}
      title={`${formatVoucherType(data?.voucherType)} Details`}
      voucherNumber={data[getVoucherNumberTitle()]}
      to="/sUsers/receiptPrintOut"
      editTo="/sUsers/editReceipt"
    />
  );
}

export default AccVoucherDetails;
