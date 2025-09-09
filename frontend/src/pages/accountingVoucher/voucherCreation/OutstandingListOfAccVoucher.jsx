import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useFetch from "../../../customHook/useFetch";
import {
  addOutstandings,
  setTotalBillAmount,
} from "../../../../slices/voucherSlices/commonAccountingVoucherSlice";
import OutstandingLIstComponent from "./OutstandingLIstComponent";

///format the amount

function OutstandingListOfAccVoucher() {
  ///company Id
  const cmp_id = useSelector(
    (state) => state?.secSelectedOrganization.secSelectedOrg?._id
  );
  // ///from receipt redux
  const {
    voucherType,
    outstandings: outstandingFromRedux,
    billData: billDataFromRedux,
    party,
    totalBillAmount,
    mode,
    _id: ReceiptIdFromRedux,
  } = useSelector((state) => state.commonAccountingVoucherSlice);

  const [data, setData] = useState(outstandingFromRedux);
  const [total, setTotal] = useState(totalBillAmount);
  const dispatch = useDispatch();

  // Track initial entered amount for edit mode
  const initialAmountChange = useRef(true)
  const isFirstRender = useRef(true);

  ////find the outstanding with latest remaining amount
  const {
    data: apiData,
    loading,
    refreshHook,
  } = useFetch(
      `/api/sUsers/fetchOutstandingDetails/${party?._id}/${cmp_id}?voucher=${voucherType}&voucherId=${ReceiptIdFromRedux}`
  );

  // Function to show confirmation alert for amount change in edit mode
  const showAmountChangeAlert = () => {
    return new Promise((resolve) => {
      const userConfirmed = window.confirm(
        "⚠️ Warning: Modifying the amount will reset all selections and load the latest outstanding data. Do you want to continue?"
      );

      if (userConfirmed) {
        initialAmountChange.current = false
        refreshHook();
      }
      resolve(userConfirmed);
    });
  };



  useEffect(() => {
    if (apiData) {
      let { outstandings = [], totalOutstandingAmount = 0 } = apiData;
      let updatedOutstandingList = [...outstandings];
      let updatedTotalOutstanding = totalOutstandingAmount;

      // if (mode === "edit" && Array.isArray(billDataFromRedux)) {

      //   billDataFromRedux.forEach((bill) => {
      //     const index = updatedOutstandingList.findIndex(
      //       (item) => item.billId === bill.billId
      //     );

      //     if (index !== -1) {
      //       // Bill exists, update bill_pending_amt
      //       updatedOutstandingList[index] = {
      //         ...updatedOutstandingList[index],
      //         bill_pending_amt:
      //           (bill.settledAmount || 0) +
      //           (updatedOutstandingList[index]?.bill_pending_amt || 0),
      //       };

      //       console.log(
      //         "updatedOutstandingList[index]",
      //         updatedOutstandingList[index]
      //       );
      //     } else {

      //       // Bill doesn't exist, add at beginning
      //       updatedOutstandingList.unshift({
      //         _id: bill._id,
      //         billId: bill.billId,
      //         bill_no: bill.bill_no,
      //         bill_date: bill.bill_date,
      //         bill_pending_amt: bill.bill_pending_amt || 0,
      //         classification: "Dr",
      //         source: bill.source || "sales",
      //       });
      //     }
      //   });

      //   // Recalculate total
      //   updatedTotalOutstanding = updatedOutstandingList.reduce(
      //     (sum, item) => sum + (item.bill_pending_amt || 0),
      //     0
      //   );
      // }

      // Update local and redux states
      setData(updatedOutstandingList);
      setTotal(updatedTotalOutstanding);
      dispatch(addOutstandings(updatedOutstandingList));
      dispatch(setTotalBillAmount(updatedTotalOutstanding));
    } else {
      // Fallback to redux values
      setData(billDataFromRedux || []);
      setTotal(totalBillAmount || 0);
    }
  }, [apiData, mode]);


  useEffect(()=>{
    if(isFirstRender.current){
      isFirstRender.current = false;
    }
  },[])



  return (
    <OutstandingLIstComponent
      {...{
        loading,
        data,
        total,
        tab: voucherType,
        party,
        showAmountChangeAlert,
        mode,
        initialAmountChange
      }}
    />
  );
}

export default OutstandingListOfAccVoucher;
