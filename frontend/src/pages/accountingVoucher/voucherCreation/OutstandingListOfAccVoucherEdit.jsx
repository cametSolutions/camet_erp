import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useFetch from "../../../customHook/useFetch";
import {
  addOutstandings,
  setTotalBillAmount,
  setIsInitialRender,
  addEnteredAmount
} from "../../../../slices/voucherSlices/commonAccountingVoucherSlice";
import OutstandingLIstComponent from "./OutstandingLIstComponent";

function OutstandingListOfAccVoucherEdit() {
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

  // Initialize with Redux data
  const [data, setData] = useState(outstandingFromRedux || []);
  const [total, setTotal] = useState(totalBillAmount || 0);
  const [shouldFetchApi, setShouldFetchApi] = useState(false); // Control API calls
  const dispatch = useDispatch();

  // Track initial entered amount for edit mode
  // const initialAmountChange = useRef(true);
  const isFirstRender = useRef(true);

  ////find the outstanding with latest remaining amount - only when shouldFetchApi is true
  const {
    data: apiData,
    loading,
    refreshHook,
  } = useFetch(
    shouldFetchApi 
      ? `/api/sUsers/fetchOutstandingDetails/${party?._id}/${cmp_id}?voucher=${voucherType}&voucherId=${ReceiptIdFromRedux}`
      : null // Don't make API call initially
  );

  // Function to show confirmation alert for amount change in edit mode
  const showAmountChangeAlert = () => {
    return new Promise((resolve) => {
      const userConfirmed = window.confirm(
        "⚠️ Warning: Modifying the amount will reset all selections and load the latest outstanding data. Do you want to continue?"
      );

      if (userConfirmed) {
        // initialAmountChange.current = false;
        setShouldFetchApi(true); // Enable API call
        refreshHook();
         dispatch(setIsInitialRender(false));
      }
      resolve(userConfirmed);
    });
  };

  // Initial setup - use Redux data only
  useEffect(() => {
    if (isFirstRender.current) {
      // On first render, process and show Redux data
      let initialData = [];
      let initialTotal = 0;

      if (mode === "edit" && Array.isArray(billDataFromRedux) && billDataFromRedux.length > 0 && outstandingFromRedux?.length === 0) {
        // In edit mode, show billDataFromRedux
        initialData = billDataFromRedux;
        initialTotal = billDataFromRedux.reduce((sum, bill) => sum + (bill.settledAmount || bill.bill_pending_amt || 0), 0);
      } else {
        // In other modes, show outstandingFromRedux
        initialData = outstandingFromRedux || [];
        initialTotal = totalBillAmount || 0;
      }

      setData(initialData);
      setTotal(initialTotal);
      
      // Mark as no longer initial render in Redux
      // if (isInitialRenderFromRedux !== false) {
      //   dispatch(setIsInitialRender(false));
      // }
      
      isFirstRender.current = false;
    }
  }, [mode, billDataFromRedux, outstandingFromRedux, totalBillAmount]);

  // Handle API data when it's available (after user triggers API call)
  useEffect(() => {
    if (apiData && shouldFetchApi) {
      let { outstandings = [], totalOutstandingAmount = 0 } = apiData;
      let updatedOutstandingList = [...outstandings];
      let updatedTotalOutstanding = totalOutstandingAmount;

      // Update local and redux states with fresh API data
      setData(updatedOutstandingList);
      setTotal(updatedTotalOutstanding);
      dispatch(addOutstandings(updatedOutstandingList));
      dispatch(setTotalBillAmount(updatedTotalOutstanding));
      dispatch(addEnteredAmount(0)); // Reset entered amount on data refresh
    }
  }, [apiData, shouldFetchApi, dispatch]);

  return (
    <OutstandingLIstComponent
      {...{
        loading, // Only show loading when API is being called for initial render
        data,
        total,
        tab: voucherType,
        party,
        showAmountChangeAlert,
        mode,
        // initialAmountChange
      }}
    />
  );
}

export default OutstandingListOfAccVoucherEdit;