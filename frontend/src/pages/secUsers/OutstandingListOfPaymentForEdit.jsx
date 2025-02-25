import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setModifiedOutstandings,
  setTotalBillAmount,
  // addOutstandings,
  // setTotalBillAmount,
} from "../../../slices/payment";
import useFetch from "../../customHook/useFetch";
import OutstandingLIst from "../../components/secUsers/main/OutstandingLIst";

function OutstandingListOfPaymentForEdit() {
  ///company Id
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  ///from paymet redux
  const {
    outstandings,
    totalBillAmount,
    billData,
    modifiedOutstandings: modifiedOutstandingsRedux,
  } = useSelector((state) => state.payment);

  // console.log("billData", billData);
  // console.log("outstandings", outstandings);

  const [data, setData] = useState(outstandings);
  const [total, setTotal] = useState(totalBillAmount);

  const dispatch = useDispatch();
  const { party_id } = useParams();

  ////find the outstanding with latest remaining amount
  const { data: paymentData, loading } = useFetch(
    modifiedOutstandingsRedux.length === 0 &&
      `/api/sUsers/fetchOutstandingDetails/${party_id}/${cmp_id}?voucher=payment`
  );

  const modifyOutstandings = (outstandings, billData, paymentData) => {
    // Create a map of bill numbers to settled amounts from billData
    const billSettlements = new Map(
      billData.map((bill) => [bill.billId, bill.settledAmount])
    );

    // Create a map of bill numbers to pending amounts from paymentData
    const receiptPendingAmounts = new Map(
      paymentData.outstandings.map((bill) => [
        bill.billId,
        bill.bill_pending_amt,
      ])
    );

    // Combine outstandings and paymentData.outstandings, overwriting by bill_no
    const combinedMap = new Map();

    // Add all entries from paymentData.outstandings to the map
    paymentData.outstandings.forEach((bill) => {
      combinedMap.set(bill.billId, { ...bill });
    });

    // Add or overwrite entries from outstandings to the map
    outstandings.forEach((bill) => {
      combinedMap.set(bill.billId, {
        ...bill,
        ...combinedMap.get(bill.billId),
      });
    });

    // Convert the map back to an array and modify the pending amounts
    const combinedArray = Array.from(combinedMap.values()).map(
      (outstanding) => {
        const billId = outstanding.billId;
        const settledAmount = billSettlements.get(billId) || 0;
        const receiptPendingAmount = receiptPendingAmounts.get(billId) || 0;

        return {
          ...outstanding,
          bill_pending_amt: receiptPendingAmount + settledAmount,
        };
      }
    );

    // Filter out any entries with bill_pending_amt of 0
    const filteredArray = combinedArray.filter(
      (outstanding) => outstanding.bill_pending_amt !== 0
    );

    // Sort the filtered array by bill_date
    const sortedArray = filteredArray.sort((a, b) => {
      const dateA = new Date(a.bill_date);
      const dateB = new Date(b.bill_date);
      return dateA - dateB; // Ascending order
    });

    return sortedArray;
  };

  /// to get out standing with are in the time of edit with new (latest) pending amount
  //we need to alter remaining amount as bill_pending_amt=current bill_pending_amt + settledAmount

  useEffect(() => {
    if (paymentData && modifiedOutstandingsRedux.length === 0) {
      const modifiedOutstandings = modifyOutstandings(
        outstandings,
        billData,
        paymentData
      );

      setData(modifiedOutstandings);
      dispatch(setModifiedOutstandings(modifiedOutstandings));

      const totalBillAmount = modifiedOutstandings.reduce(
        (acc, cur) => acc + parseFloat(cur.bill_pending_amt),
        0
      );
      setTotal(totalBillAmount);
      dispatch(setTotalBillAmount(totalBillAmount));
    } else {
      setData(modifiedOutstandingsRedux);
    }
  }, [paymentData]);

  return (
    <OutstandingLIst
      {...{
        loading,
        data,
        total,
        tab: "payment",
        process: "edit",
      }}
    />
  );
}

export default OutstandingListOfPaymentForEdit;
