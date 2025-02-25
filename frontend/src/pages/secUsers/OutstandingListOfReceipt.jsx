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
