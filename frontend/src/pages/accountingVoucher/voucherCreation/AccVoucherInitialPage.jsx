import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../api/api";
import HeaderTile from "../../voucher/voucherCreation/HeaderTile";
import { useDispatch } from "react-redux";
import {
  changeDate,
  removeAll,
  removeParty,
  addVoucherType,
  addVoucherSeries,
} from "../../../../slices/voucherSlices/commonAccountingVoucherSlice";
import AddPartyTile from "../../voucher/voucherCreation/AddPartyTile";
import AddAmountTile from "../../../components/secUsers/main/AddAmountTile";
import PaymentModeTile from "../../../components/secUsers/main/PaymentModeTile";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import TitleDiv from "../../../components/common/TitleDiv";
import FooterButton from "../../voucher/voucherCreation/FooterButton";
import { formatVoucherType } from "../../../../utils/formatVoucherType";

function AccVoucherInitialPage() {
  // ////////////////dispatch
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // ///////////////////  redux details /////////////////////
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const {
    voucherNumber: voucherNumberRedux,
    date: dateRedux,
    voucherType: voucherTypeFromRedux,
    party,
    billData,
    totalBillAmount,
    enteredAmount,
    advanceAmount,
    remainingAmount,
    paymentMethod,
    paymentDetails,
    note,
    mode,
    voucherSeries: voucherSeriesFromRedux,
  } = useSelector((state) => state.commonAccountingVoucherSlice);

  const [voucherNumber, setVoucherNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState(dateRedux || new Date());
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  /// get voucherType form location
  const voucherType = location.state?.voucherType;
  useEffect(() => {
    if (voucherType && voucherTypeFromRedux === "") {
      dispatch(addVoucherType(voucherType));
    }
  }, [voucherType]);

  // ////////////for fetching configuration number
  useEffect(() => {
    if (voucherSeriesFromRedux ===null) {
      const fetchConfigurationNumber = async () => {
        setLoading(true);
        try {
          const res = await api.get(
            `/api/sUsers/getSeriesByVoucher/${cmp_id}/?voucherType=${voucherType}`,

            {
              withCredentials: true,
            }
          );

          

          const configData = res?.data;

          console.log(configData);
          

          if (voucherSeriesFromRedux === null) {
            dispatch(addVoucherSeries(configData.series));
          }

          // console.log(res.data);
          // if (res.data.message === "default") {
          //   const { configurationNumber } = res.data;
          //   setVoucherNumber(configurationNumber);
          //   return;
          // }

          // const { configDetails, configurationNumber } = res.data;

          // if (configDetails) {
          //   const { widthOfNumericalPart, prefixDetails, suffixDetails } =
          //     configDetails;
          //   const newOrderNumber = configurationNumber.toString();

          //   const padedNumber = newOrderNumber.padStart(
          //     widthOfNumericalPart,
          //     0
          //   );
          //   const finalOrderNumber = [prefixDetails, padedNumber, suffixDetails]
          //     .filter(Boolean)
          //     .join("-");
          //   setVoucherNumber(finalOrderNumber);
          //   dispatch(addVoucherNumber(finalOrderNumber));
          // } else {
          //   setVoucherNumber(voucherNumber);
          //   dispatch(addVoucherNumber(voucherNumber));
          // }
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };
      fetchConfigurationNumber();
    } else {
      setVoucherNumber(voucherNumberRedux);
    }
  }, []);

  /// to get voucher number name

  const getVoucherNumberTitle = () => {
    if (!voucherTypeFromRedux) return "";
    return voucherTypeFromRedux + "Number";
  };

  const submitHandler = async () => {
    setSubmitLoading(true);
    const voucherNumberTitle = getVoucherNumberTitle();

    // Form data
    const formData = {
      cmp_id,
      [voucherNumberTitle]: voucherNumber,
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
        cash_name: null,
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
    if (!formData[voucherNumberTitle]) {
      setSubmitLoading(false);
      return toast.error(
        ` ${formatVoucherType(voucherNumberRedux)}  number is required`
      );
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
      const res = await api.post(`/api/sUsers/create${voucherType}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log(res.data);
      toast.success(res.data.message);

      navigate(`/sUsers/${voucherType}/details/${res?.data?.data._id}`);
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
        title={formatVoucherType(voucherTypeFromRedux)}
        from={`/sUsers/selectVouchers`}
        loading={loading || submitLoading}
      />

      <div className={`${loading ? "pointer-events-none opacity-70" : ""}`}>
        <HeaderTile
          title={formatVoucherType(voucherTypeFromRedux)}
          number={voucherNumberRedux}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dispatch={dispatch}
          changeDate={changeDate}
          submitHandler={submitHandler}
          removeAll={removeAll}
          tab="add"
          loading={submitLoading}
          mode={mode}
        />

        <AddPartyTile
          party={party}
          dispatch={dispatch}
          removeParty={removeParty}
          link={`/sUsers/searchParty${formatVoucherType(voucherTypeFromRedux)}`}
          linkBillTo=""
        />

        <AddAmountTile party={party} />
        <PaymentModeTile tab={voucherTypeFromRedux} />

        <FooterButton
          submitHandler={submitHandler}
          tab="add"
          title={formatVoucherType(voucherTypeFromRedux)}
          loading={submitLoading || loading}
          mode={mode}
        />
      </div>
    </div>
  );
}

export default AccVoucherInitialPage;
