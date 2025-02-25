import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addOutstandings, setTotalBillAmount } from "../../../slices/payment";
import useFetch from "../../customHook/useFetch";
import OutstandingLIst from "../../components/secUsers/main/OutstandingLIst";

function OutstandingListOfPayment() {
  ///company Id
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  ///from receipt redux
  const { outstandings, totalBillAmount } = useSelector(
    (state) => state.payment
  );

  const [data, setData] = useState(outstandings);
  const [total, setTotal] = useState(totalBillAmount);

  const dispatch = useDispatch();
  const { party_id } = useParams();

  const { data: paymentData, loading } = useFetch(
    `/api/sUsers/fetchOutstandingDetails/${party_id}/${cmp_id}?voucher=payment`
  );

  useEffect(() => {
    if (paymentData) {
      setData(paymentData.outstandings);
      setTotal(paymentData.totalOutstandingAmount);
      dispatch(addOutstandings(paymentData.outstandings));
      dispatch(setTotalBillAmount(paymentData.totalOutstandingAmount));
    }
  }, [paymentData]);

  return (
    <OutstandingLIst
      {...{
        loading,
        data,
        total,

        tab: "payment",
      }}
    />
  );
}

export default OutstandingListOfPayment;
