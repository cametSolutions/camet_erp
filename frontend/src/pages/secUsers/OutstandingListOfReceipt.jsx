import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addOutstandings,
  setTotalBillAmount,
} from "../../../slices/receipt";
import useFetch from "../../customHook/useFetch";
import OutstandingLIst from "../../components/secUsers/main/OutstandingLIst";

///format the amount


function OutstandingListOfReceipt() {
  ///company Id
  const cmp_id = useSelector(
    (state) => state?.secSelectedOrganization.secSelectedOrg?._id
  );
  // ///from receipt redux
  const {
    // enteredAmount: enteredAmountRedux,
    outstandings,
    totalBillAmount,
  } = useSelector((state) => state.receipt);

  const [data, setData] = useState(outstandings);
  const [total, setTotal] = useState(totalBillAmount);

  const dispatch = useDispatch();
  const { party_id } = useParams();


  ////find the outstanding with latest remaining amount
  const { data: receiptData, loading } = useFetch(outstandings.length===0 &&
    `/api/sUsers/fetchOutstandingDetails/${party_id}/${cmp_id}?voucher=receipt`,
  );

  useEffect(() => {
    if (receiptData) {
      setData(receiptData.outstandings);
      setTotal(receiptData.totalOutstandingAmount);
      dispatch(addOutstandings(receiptData.outstandings));
      dispatch(setTotalBillAmount(receiptData.totalOutstandingAmount));
    }else{
      ////use from redux
      setData(outstandings);
      setTotal(totalBillAmount);
    }
  }, [receiptData]);




  // const handleNextClick = () => {
  //   console.log(enteredAmount);

  //   if (enteredAmount == null || enteredAmount <= 0) {
  //     toast.error("Enter an amount");
  //     return;
  //   }

  //   const results = [];
  //   let remainingAmount = enteredAmount;

  //   data.forEach((el) => {
  //     const billAmount = parseFloat(el.bill_pending_amt) || 0;
  //     const settledAmount = Math.min(billAmount, remainingAmount);

  //     // Check if settledAmount is greater than zero before including it in results
  //     if (settledAmount > 0) {
  //       const remainingBillAmount = Math.max(0, billAmount - settledAmount);

  //       remainingAmount -= settledAmount;

  //       const resultObject = {
  //         billNo: el.bill_no,
  //         billId: el.billId,
  //         settledAmount,
  //         remainingAmount: remainingBillAmount,
  //       };

  //       results.push(resultObject);
  //     }
  //   });

  //   const settlementData = {
  //     // party_id: data[0]?.party_id,
  //     // party_name: data[0]?.party_name,
  //     totalBillAmount: parseFloat(total),
  //     enteredAmount: enteredAmount,
  //     // cmp_id: data[0]?.cmp_id,
  //     billData: results,
  //   };

  //   console.log(settlementData);
    

  //   dispatch(addSettlementData(settlementData));
  //   navigate("/sUsers/receipt");
  // };

  return (
    <OutstandingLIst
      {...{
        loading,
        data,
        total,
        tab: "receipt",
      }}
    />
  );
}

export default OutstandingListOfReceipt;
