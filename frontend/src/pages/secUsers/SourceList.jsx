import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
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
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  // const { bankList, cashList } = useSelector(
  //   (state) => state.commonAccountingVoucherSlice
  // );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { source } = useParams();

  // Fetch function for TanStack Query
  const fetchBankAndCashSources = async () => {
    const response = await api.get(
      `/api/sUsers/getBankAndCashSources/${cmp_id}?source=${source?.toLowerCase() || ''}`,
      {
        withCredentials: true,
      }
    );
    return response.data.data;
  };

  // TanStack Query hook
  const {
    data: queryData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['bankAndCashSources', cmp_id, source],
    queryFn: fetchBankAndCashSources,
    enabled: !!cmp_id ,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 30 * 1000, // 30 seconds
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const sourceSubmitHandler = (data) => {
    if (source === "Cash") {
      dispatch(addCashPaymentDetails(data));
    } else {
      dispatch(addBankPaymentDetails(data));
    }
    navigate(-1, { replace: true });
  };

  // Process and set data when query data changes
  useEffect(() => {
    if (queryData) {
      if (source === "Cash") {
        const filteredCashes = queryData?.cashs?.filter(
          (cash) =>
            cash._id &&
            cash._id !== "null" &&
            cash.cash_ledname &&
            cash.cash_ledname !== "null"
        );

        setData(filteredCashes || []);
        dispatch(addAllCashList(filteredCashes || []));
      } else {
        const filteredBanks = queryData?.banks?.filter(
          (bank) =>
            bank.bank_ledname && 
            bank.bank_ledname !== "null"
        );
        
        setData(filteredBanks || []);
        dispatch(addAllBankList(filteredBanks || []));
      }
    }
  }, [queryData, source, dispatch]);


  if (isError) {
    console.error("Error fetching bank and cash sources:", error);
  }

  return (
    <div>
      <SourceListComponent
        data={data}
        user="secondary"
        submitHandler={sourceSubmitHandler}
        source={source === "Cash" ? "cash" : "bank"}
        loading={isLoading}
      />
    </div>
  );
}

export default SourceList;