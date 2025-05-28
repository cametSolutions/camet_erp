import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/api";
import SourceListComponent from "../../components/common/List/SourceListComponent";
import {
  addAllBankList,
  addAllCashList,
  addBankPaymentDetails,
  addCashPaymentDetails,
} from "../../../slices/voucherSlices/commonAccountingVoucherSlice";

import { useNavigate, useParams } from "react-router-dom";
function SourceList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const { bankList, cashList } = useSelector(
    (state) => state.commonAccountingVoucherSlice
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { source } = useParams();

  const sourceSubmitHandler = (data) => {
    if (source === "Cash") {
      dispatch(addCashPaymentDetails(data));
    } else {
      dispatch(addBankPaymentDetails(data));
    }
    navigate(-1, { replace: true });
    // console.log(data);
  };

  useEffect(() => {
    const fetchSource = async () => {
      setLoading(true);

      try {
        const res = await api.get(
          `api/sUsers/getBankAndCashSources/${cmp_id}`,
          {
            withCredentials: true,
          }
        );

        const apiData = res.data.data;

        if (source === "Cash") {
          const filteredCashes = apiData?.cashs?.filter(
            (cash) =>
              cash.cash_id &&
              cash.cash_id !== "null" &&
              cash.cash_ledname &&
              cash.cash_ledname !== "null"
          );

          setData(filteredCashes);
          dispatch(addAllCashList(filteredCashes));
        } else {
          const filteredBanks = apiData?.banks?.filter(
            (bank) =>
              bank.bank_name &&
              bank.bank_name !== "null" &&
              bank.bank_ledname &&
              bank.bank_ledname !== "null"
          );
          setData(filteredBanks);
          dispatch(addAllBankList(filteredBanks));
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (bankList.length === 0 || cashList.length === 0) {
      fetchSource();
    } else {
      if (source === "Cash") {
        setData(cashList);
      } else {
        setData(bankList);
      }
    }
  }, [cmp_id]);

  return (
    <div>
      <SourceListComponent
        data={data}
        user="secondary"
        submitHandler={sourceSubmitHandler}
        source={source === "Cash" ? "cash" : "bank"}
        loading={loading}
      />
    </div>
  );
}

export default SourceList;
