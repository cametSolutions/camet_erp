import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";
import HeaderTile from "../../components/secUsers/main/HeaderTile";
import { useDispatch } from "react-redux";
import {
  addPaymentNumber,
  changeDate,
  removeAll,
  removeParty,
} from "../../../slices/payment";
import AddPartyTile from "../../components/secUsers/main/AddPartyTile";
import AddAmountTile from "../../components/secUsers/main/AddAmountTile";
import PaymentModeTile from "../../components/secUsers/main/PaymentModeTile";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import TitleDiv from "../../components/common/TitleDiv";
import FooterButton from "../../components/secUsers/main/FooterButton";
import { updateDashboardSummaryManually } from "../../../slices/dashboardSlices/fetchDashboardSummary";

function PurchasePayment() {
  // ////////////////dispatch
  const dispatch = useDispatch();

  const navigate = useNavigate();
  // ///////////////////  redux details /////////////////////
  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const {
    paymentNumber: paymentNumberFromRedux,
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
  } = useSelector((state) => state.payment);

  const [paymentNumber, setpaymentNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState(dateRedux);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  // ////////////for fetching configuration number
  useEffect(() => {
    if (paymentNumberFromRedux === "") {
      const fetchConfigurationNumber = async () => {
        setLoading(true);

        try {
          const res = await api.get(
            `/api/sUsers/fetchConfigurationNumber/${orgId}/payment`,

            {
              withCredentials: true,
            }
          );

          // console.log(res.data);
          if (res.data.message === "default") {
            const { configurationNumber } = res.data;
            setpaymentNumber(configurationNumber);
            return;
          }

          const { configDetails, configurationNumber } = res.data;

          if (configDetails) {
            const { widthOfNumericalPart, prefixDetails, suffixDetails } =
              configDetails;
            const newOrderNumber = configurationNumber.toString();

            const padedNumber = newOrderNumber.padStart(
              widthOfNumericalPart,
              0
            );
            // console.log(padedNumber);
            const finalOrderNumber = [prefixDetails, padedNumber, suffixDetails]
              .filter(Boolean)
              .join("-");
            // console.log(finalOrderNumber);
            setpaymentNumber(finalOrderNumber);
            dispatch(addPaymentNumber(finalOrderNumber));
          } else {
            setpaymentNumber(paymentNumber);
            dispatch(addPaymentNumber(paymentNumber));
          }
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };
      fetchConfigurationNumber();
    } else {
      setpaymentNumber(paymentNumberFromRedux);
    }
  }, []);

  /// submit handler
  const submitHandler = async () => {
    setSubmitLoading(true);

    // Form data
    const formData = {
      cmp_id: orgId,
      paymentNumber: paymentNumberFromRedux,
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
    if (!formData.paymentNumber) {
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

    // console.log(formData);

    // If validation passes, proceed with the form submission
    try {
      const res = await api.post(`/api/sUsers/createPayment`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
      /// to update to summary in dashboard
      
      dispatch(
        updateDashboardSummaryManually({
          voucher: "payments",
          amount: enteredAmount,
        })
      );
      /// for updating payables also

      dispatch(
        updateDashboardSummaryManually({
          voucher: "outstandingPayables",
          amount: formData.lastAmount,
        })
      );

      navigate(`/sUsers/payment/details/${res?.data?.payment._id}`);
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
        title="Payment"
        from={`/sUsers/selectVouchers`}
        loading={loading || submitLoading}
      />

      <div className={`${loading ? "pointer-events-none opacity-70" : ""}`}>
        <HeaderTile
          title={"Payment"}
          number={paymentNumber}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dispatch={dispatch}
          changeDate={changeDate}
          submitHandler={submitHandler}
          removeAll={removeAll}
          loading={submitLoading}
          tab="add"
        />
        <AddPartyTile
          party={party}
          dispatch={dispatch}
          removeParty={removeParty}
          link="/sUsers/searchPartyPurchasePayment"
          linkBillTo=""
        />
        <AddAmountTile party={party} tab="purchase" />
        <PaymentModeTile tab="payment" />
        <FooterButton
          submitHandler={submitHandler}
          tab="add"
          title="Payment"
          loading={submitLoading || loading}
        />{" "}
      </div>
    </div>
  );
}

export default PurchasePayment;
