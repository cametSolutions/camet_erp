import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";
import HeaderTile from "../../components/secUsers/main/HeaderTile";
import { useDispatch } from "react-redux";
import {
  addReceiptNumber,
  changeDate,
  removeAll,
  removeParty,
} from "../../../slices/receipt";
import AddPartyTile from "../../components/secUsers/main/AddPartyTile";
import AddAmountTile from "../../components/secUsers/main/AddAmountTile";
import PaymentModeTile from "../../components/secUsers/main/PaymentModeTile";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import TitleDiv from "../../components/common/TitleDiv";
import FooterButton from "../../components/secUsers/main/FooterButton";
import { updateDashboardSummaryManually } from "../../../slices/dashboardSlices/fetchDashboardSummary";

function Receipt() {
  // ////////////////dispatch
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // ///////////////////  redux details /////////////////////
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const {
    receiptNumber: receiptNumberRedux,
    date: dateRedux,
    party,
    billData,
    totalBillAmount,
    enteredAmount,
    advanceAmount,
    remainingAmount,
    paymentMethod,
    paymentDetails,
    note,
    outstandings,
  } = useSelector((state) => state.receipt);

  const [receiptNumber, setReceiptNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState(dateRedux);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // ////////////for fetching configuration number
  useEffect(() => {
    if (receiptNumberRedux === "") {
      const fetchConfigurationNumber = async () => {
        setLoading(true);
        try {
          const res = await api.get(
            `/api/sUsers/fetchConfigurationNumber/${cmp_id}/receipt`,

            {
              withCredentials: true,
            }
          );

          // console.log(res.data);
          if (res.data.message === "default") {
            const { configurationNumber } = res.data;
            setReceiptNumber(configurationNumber);
            return;
          }

          const { configDetails, configurationNumber } = res.data;
          // console.log(configDetails);
          // console.log(configurationNumber);

          if (configDetails) {
            const { widthOfNumericalPart, prefixDetails, suffixDetails } =
              configDetails;
            const newOrderNumber = configurationNumber.toString();
            // console.log(newOrderNumber);
            // console.log(widthOfNumericalPart);
            // console.log(prefixDetails);
            // console.log(suffixDetails);

            const padedNumber = newOrderNumber.padStart(
              widthOfNumericalPart,
              0
            );
            // console.log(padedNumber);
            const finalOrderNumber = [prefixDetails, padedNumber, suffixDetails]
              .filter(Boolean)
              .join("-");
            // console.log(finalOrderNumber);
            setReceiptNumber(finalOrderNumber);
            dispatch(addReceiptNumber(finalOrderNumber));
          } else {
            setReceiptNumber(receiptNumber);
            dispatch(addReceiptNumber(receiptNumber));
          }
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };
      fetchConfigurationNumber();
    } else {
      setReceiptNumber(receiptNumberRedux);
    }
  }, []);

  const submitHandler = async () => {
    setSubmitLoading(true);
    // Form data
    const formData = {
      cmp_id,
      receiptNumber,
      date: selectedDate,
      party,
      billData,
      totalBillAmount,
      enteredAmount,
      advanceAmount,
      remainingAmount,
      paymentMethod,
      paymentDetails,
      note,
      outstandings,
    };

    console.log();

    if (formData?.paymentMethod === "Online") {
      formData.paymentDetails = {
        ...formData.paymentDetails,
        chequeDate: null,
        chequeNumber: null,
      };
    }
    if (formData?.paymentMethod === "Cash") {
      formData.paymentDetails = {
        ...formData.paymentDetails,
        cash_name: formData.paymentDetails.cash_ledname,
        bank_ledname: null,
        bank_name: null,
        chequeDate: null,
        chequeNumber: null,
      };
    }

    // Validation
    if (!formData.receiptNumber) {
      setSubmitLoading(false);
      return toast.error("Receipt number is required.");
    }

    if (!formData.party || !formData.party._id) {
      setSubmitLoading(false);
      return toast.error("Party selection is required.");
    }

    if (!formData.enteredAmount) {
      setSubmitLoading(false);
      return toast.error(" Amount is required.");
    }

    if (!formData.paymentMethod) {
      setSubmitLoading(false);
      return toast.error("Payment method is required.");
    }
    if (
      (formData.paymentMethod === "Cheque" ||
        formData.paymentMethod === "Online") &&
      !formData.paymentDetails
    ) {
      setSubmitLoading(false);
      return toast.error(
        "Payment details are required for cheque or online payments."
      );
    }

    if (formData.paymentMethod === "Cheque") {
      if (!formData.paymentDetails.chequeDate) {
        setSubmitLoading(false);
        return toast.error("Cheque date is required.");
      }
      if (!formData.paymentDetails.chequeNumber) {
        setSubmitLoading(false);
        return toast.error("Cheque number is required.");
      }
      if (
        !formData.paymentDetails.bank_ledname ||
        !formData.paymentDetails.bank_name ||
        !formData.paymentDetails._id
      ) {
        setSubmitLoading(false);
        return toast.error("Bank details are required.");
      }
    }

    if (formData.paymentMethod === "Online") {
      if (
        !formData.paymentDetails.bank_ledname ||
        !formData.paymentDetails.bank_name ||
        !formData.paymentDetails._id
      ) {
        setSubmitLoading(false);
        return toast.error("Bank details are required.");
      }
    }
    if (formData.paymentMethod === "Cash") {
      if (
        !formData.paymentDetails.cash_ledname ||
        !formData.paymentDetails._id
      ) {
        setSubmitLoading(false);
        return toast.error("Cash details are required.");
      }
    }

    // If validation passes, proceed with the form submission
    try {
      const res = await api.post(`/api/sUsers/createReceipt`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log(res.data);
      toast.success(res.data.message);
      dispatch(
        updateDashboardSummaryManually({
          voucher: "receipts",
          amount: enteredAmount,
        })
      );
      navigate(`/sUsers/receipt/details/${res?.data?.receipt._id}`);
      dispatch(removeAll());
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
      console.log(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative mb-10 sm:mb-0">
      <TitleDiv
        title="Receipt"
        from={`/sUsers/selectVouchers`}
        loading={loading || submitLoading}
      />

      <div className={`${loading ? "pointer-events-none opacity-70" : ""}`}>
        <HeaderTile
          title={"Receipt"}
          number={receiptNumber}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dispatch={dispatch}
          changeDate={changeDate}
          submitHandler={submitHandler}
          removeAll={removeAll}
          tab="add"
          loading={submitLoading}
        />

        <AddPartyTile
          party={party}
          dispatch={dispatch}
          removeParty={removeParty}
          link="/sUsers/searchPartyReceipt"
          linkBillTo=""
        />

        <AddAmountTile party={party} tab="receipt" />
        <PaymentModeTile tab="receipt" />

        {/* <ReceiptButton submitHandler={submitHandler} text="Generate Receipt" /> */}
        <FooterButton
          submitHandler={submitHandler}
          tab="add"
          title="Receipt"
          loading={submitLoading || loading}
        />
      </div>
    </div>
  );
}

export default Receipt;
