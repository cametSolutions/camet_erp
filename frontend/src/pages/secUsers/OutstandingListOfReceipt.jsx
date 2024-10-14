import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addSettlementData,
  addOutstandings,
  setTotalBillAmount,
} from "../../../slices/receipt";

import useFetch from "../../customHook/useFetch";
import OutstandingLIst from "../../components/secUsers/main/OutstandingLIst";

function OutstandingListOfReceipt() {
  ///company Id
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  ///from receipt redux
  const {
    enteredAmount: enteredAmountRedux,
    outstandings,
    totalBillAmount,
  } = useSelector((state) => state.receipt);

  const [data, setData] = useState(outstandings);
  const [total, setTotal] = useState(totalBillAmount);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  // const loading=true;

  const [enteredAmount, setEnteredAmount] = useState(() => {
    const storedAmount = enteredAmountRedux || 0;

    // Convert to a valid number or default to 0
    const parsedAmount = parseFloat(storedAmount);
    const validAmount = !isNaN(parsedAmount) ? parsedAmount : 0;

    return validAmount;
  });

  function formatAmount(amount) {
    // Use toLocaleString to add commas to the number
    return amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { party_id } = useParams();

  const {
    data: receiptData,
    loading,
    error,
    refreshHook,
  } = useFetch(
    `/api/sUsers/fetchOutstandingDetails/${party_id}/${cmp_id}?voucher=receipt`
  );

  useEffect(() => {
    if (receiptData) {
      setData(receiptData.outstandings);
      setTotal(receiptData.totalOutstandingAmount);
      dispatch(addOutstandings(receiptData.outstandings));
      dispatch(setTotalBillAmount(receiptData.totalOutstandingAmount));
    }
  }, [receiptData]);

  const handleAmountChange = (event) => {
    const amount = parseFloat(event.target.value) || 0;
    if (amount > total) {
      setAdvanceAmount(amount - total);
    } else {
      setAdvanceAmount(0);
    }
    setEnteredAmount(amount);
  };

  console.log("data", data);

  let remainingAmount = enteredAmount;

  const handleNextClick = () => {
    console.log(enteredAmount);

    if (enteredAmount == null || enteredAmount <= 0) {
      toast.error("Enter an amount");
      return;
    }

    const results = [];
    let remainingAmount = enteredAmount;

    data.forEach((el) => {
      const billAmount = parseFloat(el.bill_pending_amt) || 0;
      const settledAmount = Math.min(billAmount, remainingAmount);

      // Check if settledAmount is greater than zero before including it in results
      if (settledAmount > 0) {
        const remainingBillAmount = Math.max(0, billAmount - settledAmount);

        remainingAmount -= settledAmount;

        const resultObject = {
          billNo: el.bill_no,
          settledAmount,
          remainingAmount: remainingBillAmount,
        };

        results.push(resultObject);
      }
    });

    const settlementData = {
      // party_id: data[0]?.party_id,
      // party_name: data[0]?.party_name,
      totalBillAmount: parseFloat(total),
      enteredAmount: enteredAmount,
      // cmp_id: data[0]?.cmp_id,
      billData: results,
    };

    dispatch(addSettlementData(settlementData));
    navigate("/sUsers/receipt");
  };

  return (
    <OutstandingLIst
      {...{
        loading,
        data,
        navigate,
        total,
        handleAmountChange,
        enteredAmount,
        handleNextClick,
        remainingAmount,
        formatAmount,
        advanceAmount,
        tab: "receipt",
      }}
    />
  );
}

export default OutstandingListOfReceipt;
