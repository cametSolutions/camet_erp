/* eslint-disable react/no-unknown-property */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import Swal from "sweetalert2";
import { useNavigate,useLocation} from "react-router-dom";
import useFetch from "../../customHook/useFetch";
import PaymentDetailsComponent  from "../../components/common/sidebar/ReceiptDetailsComponent";

function PaymtentDetails() {
  const [data, setData] = useState("");
  const [refresh, setRefresh] = useState(false);

  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: transactionDetails } = useFetch(
    `/api/sUsers/getPaymentDetails/${id}`
  );

  useEffect(() => {
    if (transactionDetails) {
      setData(transactionDetails.payment);
    }
  }, [transactionDetails]);

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


  const backHandler = () => {
    if (location?.state?.from === "dashboard") {
      navigate("/sUsers/dashboard");
    } else {
      navigate("/sUsers/transaction");
    }
  };


  return (
    <PaymentDetailsComponent
      backHandler={backHandler}
      data={data}
      handleCancel={handleCancel}
      title="Payment Details"
      voucherNumber={data.paymentNumber}
      to="/sUsers/paymentPrintOut"
    />
  );
}

export default PaymtentDetails;
