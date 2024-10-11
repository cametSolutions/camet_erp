
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import Swal from "sweetalert2";
import { useNavigate,useLocation} from "react-router-dom";
import useFetch from "../../customHook/useFetch";
import ReceiptDetailsComponent from "../../components/common/sidebar/ReceiptDetailsComponent";
import { useSelector } from "react-redux";

function ReceiptDetails() {
  const [data, setData] = useState("");
  const [refresh, setRefresh] = useState(false);

  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

    const cmp_id = useSelector(
      (state) => state.secSelectedOrganization.secSelectedOrg._id
    );

  const { data: transactionDetails,refreshHook  } = useFetch(
    `/api/sUsers/getReceiptDetails/${id}`
  );

  useEffect(() => {
    if (transactionDetails) {
      setData(transactionDetails.receipt);
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
    <ReceiptDetailsComponent
      backHandler={backHandler}
      data={data}
      handleCancel={handleCancel}
      title="Receipt Details"
      voucherNumber={data.receiptNumber}
      to="/sUsers/receiptPrintOut"
      editTo= "/sUsers/editReceipt"

    />
  );
}

export default ReceiptDetails;
