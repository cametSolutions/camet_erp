import { useEffect, useState } from "react";
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
  const { voucherType, outstandings, party, totalBillAmount } = useSelector(
    (state) => state.commonAccountingVoucherSlice
  );

  const [data, setData] = useState(outstandings);
  const [total, setTotal] = useState(totalBillAmount);

  const dispatch = useDispatch();

  ////find the outstanding with latest remaining amount
  const { data: apiData, loading } = useFetch(
    outstandings.length === 0 &&
      `/api/sUsers/fetchOutstandingDetails/${party?._id}/${cmp_id}?voucher=${voucherType}`
  );

  useEffect(() => {
    if (apiData) {
      const { outstandings, totalOutstandingAmount } = apiData;
      setData(outstandings);
      setTotal(totalOutstandingAmount);
      dispatch(addOutstandings(outstandings));
      dispatch(setTotalBillAmount(totalOutstandingAmount));
    } else {
      ////use from redux
      setData(outstandings);
      setTotal(totalBillAmount);
    }
  }, [apiData]);

  return (
    <OutstandingLIstComponent
      {...{
        loading,
        data,
        total,
        tab: voucherType,
        party,
      }}
    />
  );
}

export default OutstandingListOfAccVoucher;
