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

function PurchasePayment() {
  // ////////////////dispatch
  const dispatch = useDispatch();
  // ///////////////////  redux details /////////////////////
  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const {
    paymentNumber: paymentNumberFromRedux,
    date: dateRedux,
    outStandings,
    party,
    finalAmount,
    enteredAmount,
    paymentMethod,
    paymentDetails,
  } = useSelector((state) => state.payment);

  const [receiptNumber, setReceiptNumber] = useState("");
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
            dispatch(addPaymentNumber(finalOrderNumber));
          } else {
            setReceiptNumber(receiptNumber);
            dispatch(addPaymentNumber(receiptNumber));
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchConfigurationNumber();
    } else {
      setReceiptNumber(paymentNumberFromRedux);
    }
  }, []);

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
        number={receiptNumber}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        dispatch={dispatch}
        changeDate={changeDate}
        // submitHandler={submitHandler}
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
      <PaymentModeTile tab="receipt" />
    </div>
  );
}

export default PurchasePayment;
