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

///format the amount
function formatAmount(amount) {
  // Use toLocaleString to add commas to the number
  return amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function OutstandingListOfReceiptForEdit() {
  ///company Id
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  ///from receipt redux
  const {
    enteredAmount: enteredAmountRedux,
    outstandings,
    totalBillAmount,
    billData,
    _id,
  } = useSelector((state) => state.receipt);

  // console.log("billData", billData);
  // console.log("outstandings", outstandings);

  const [data, setData] = useState(outstandings);
  const [total, setTotal] = useState(totalBillAmount);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [enteredAmount, setEnteredAmount] = useState(() => {
    const storedAmount = enteredAmountRedux || 0;
    // Convert to a valid number or default to 0
    const parsedAmount = parseFloat(storedAmount);
    const validAmount = !isNaN(parsedAmount) ? parsedAmount : 0;
    return validAmount;
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { party_id } = useParams();

  ////find the outstanding with latest remaining amount
  const { data: receiptData, loading } = useFetch(

      `/api/sUsers/fetchOutstandingDetails/${party_id}/${cmp_id}?voucher=receipt`
  );



  const modifyOutstandings = (outstandings, billData, receiptData) => {

    

    console.log("outstandings", outstandings);
    console.log("receiptData", receiptData);
    
    // Create a map of bill numbers to settled amounts from billData
    const billSettlements = new Map(billData.map(bill => [bill.billNo, bill.settledAmount]));

    console.log("billSettlements", billSettlements);
    

    // Create a map of bill numbers to pending amounts from receiptData
    const receiptPendingAmounts = new Map(receiptData.outstandings.map(bill => [bill.bill_no, bill.bill_pending_amt]));

    console.log("receiptPendingAmounts", receiptPendingAmounts);

    // Modify the outstandings array
    return receiptData?.outstandings.map(outstanding => {
      const billNo = outstanding.bill_no;
      const settledAmount = billSettlements.get(billNo) || 0;
      const receiptPendingAmount = receiptPendingAmounts.get(billNo) || 0;

      return {
        ...outstanding,
        bill_pending_amt: (receiptPendingAmount ) + settledAmount
      };
    });
  };








  /// to get out standing with are in the time of edit with new (latest) pending amount
  //we need to alter remaining amount as bill_pending_amt=current bill_pending_amt + settledAmount

  useEffect(() => {
    if (receiptData) {
      const modifiedOutstandings = modifyOutstandings(outstandings, billData, receiptData);
      setData(modifiedOutstandings);

      const totalBillAmount = modifiedOutstandings.reduce(
        (acc, cur) => acc + parseFloat(cur.bill_pending_amt),
        0
      );
      setTotal(totalBillAmount);
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


    console.log("settlementData", settlementData);
    

    dispatch(addSettlementData(settlementData));
    navigate(`/sUsers/editReceipt/${_id}`);
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

export default OutstandingListOfReceiptForEdit;
