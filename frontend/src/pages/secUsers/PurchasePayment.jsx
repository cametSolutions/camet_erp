import { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
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
  } = useSelector((state) => state.payment);

  const [paymentNumber, setpaymentNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState(dateRedux);

  // ////////////for fetching configuration number
  useEffect(() => {
    if (paymentNumberFromRedux === "") {
      const fetchConfigurationNumber = async () => {
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
            setpaymentNumber(finalOrderNumber);
            dispatch(addPaymentNumber(finalOrderNumber));
          } else {
            setpaymentNumber(paymentNumber);
            dispatch(addPaymentNumber(paymentNumber));
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchConfigurationNumber();
    } else {
      setpaymentNumber(paymentNumberFromRedux);
    }
  }, []);

  /// submit handler
  const submitHandler = async () => {
    // Form data
    const formData = {
      cmp_id : orgId,
      paymentNumber:paymentNumberFromRedux,
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
        bank_ledname: null,
        bank_name: null,
        _id: null,
        chequeDate: null,
        chequeNumber: null,
      };
    }

    // console.log(formData);

    // Validation
    if (!formData.paymentNumber) {
      return toast.error("Receipt number is required.");
    }

    if (!formData.party || !formData.party._id) {
      return toast.error("Party selection is required.");
    }

    if (!formData.enteredAmount) {
      return toast.error(" Amount is required.");
    }

    if (!formData.paymentMethod) {
      return toast.error("Payment method is required.");
    }
    if (
      (formData.paymentMethod === "Cheque" ||
        formData.paymentMethod === "Online") &&
      !formData.paymentDetails
    ) {
      return toast.error(
        "Payment details are required for cheque or online payments."
      );
    }

    if (formData.paymentMethod === "Cheque") {
      if (!formData.paymentDetails.chequeDate) {
        return toast.error("Cheque date is required.");
      }
      if (!formData.paymentDetails.chequeNumber) {
        return toast.error("Cheque number is required.");
      }
      if (
        !formData.paymentDetails.bank_ledname ||
        !formData.paymentDetails.bank_name ||
        !formData.paymentDetails._id
      ) {
        return toast.error("Bank details are required.");
      }
    }

    if (formData.paymentMethod === "Online") {
      if (
        !formData.paymentDetails.bank_ledname ||
        !formData.paymentDetails.bank_name ||
        !formData.paymentDetails._id
      ) {
        return toast.error("Bank details are required.");
      }
    }

    console.log(formData);
    


    // If validation passes, proceed with the form submission
    try {
      const res = await api.post(
        `/api/sUsers/createPayment`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log(res.data);
      toast.success(res.data.message);

      navigate(`/sUsers/payment/details/${res?.data?.payment._id}`);
      dispatch(removeAll());
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
      console.log(error);
    }
  };


  return (
    <div>
      <header className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2 sticky top-0 z-50  ">
        <Link to={"/sUsers/selectVouchers"}>
          <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer" />
        </Link>
        <p className="text-white text-lg   font-bold ">Payment</p>
      </header>

      <HeaderTile
        title={"Payment"}
        number={paymentNumber}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        dispatch={dispatch}
        changeDate={changeDate}
        submitHandler={submitHandler}
        removeAll={removeAll}
        tab="add"
      />

      <AddPartyTile
        party={party}
        dispatch={dispatch}
        removeParty={removeParty}
        link="/sUsers/searchPartyPurchasePayment"
        linkBillTo=""
      />

      <AddAmountTile party={party}  tab="purchase" />
      <PaymentModeTile tab="payment" />
    </div>
  );
}

export default PurchasePayment;
