/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/api";
import {
  removeAll,
  removeItem,
  removeGodownOrBatch,
  changeDate,
  removeParty,
  addVoucherType,
  addVoucherNumber,
  addAllAdditionalCharges,
} from "../../../slices/voucherSlices/commonVoucherSlice";
import DespatchDetails from "./DespatchDetails";
import HeaderTile from "./HeaderTile";
import AddPartyTile from "./AddPartyTile";
import AddItemTile from "./AddItemTile";
// import PaymentSplittingIcon from "../../components/secUsers/main/paymentSplitting/PaymentSplittingIcon";
import FooterButton from "./FooterButton";
import TitleDiv from "../../components/common/TitleDiv";
import AdditionalChargesTile from "./AdditionalChargesTile";

function VoucherInitialPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // to find the current voucher
  const getVoucherType = () => {
    if (voucherTypeFromRedux) return;
    const pathname = location.pathname;
    let currentVoucher;
    if (pathname === "/sUsers/sales") {
      currentVoucher = "sales";
    } else {
      currentVoucher = "saleOrder";
    }

    dispatch(addVoucherType(currentVoucher));
  };

  // Redux selectors
  const { _id: cmp_id } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const {
    date,
    party,
    items,
    despatchDetails,
    // heights: batchHeights,
    voucherType,
    selectedPriceLevel: priceLevelFromRedux = "",
    voucherType: voucherTypeFromRedux,
    voucherNumber: voucherNumberFromRedux,
    allAdditionalCharges: allAdditionalChargesFromRedux,
    finalAmount: totalAmount,
  } = useSelector((state) => state.commonVoucherSlice);

  // const paymentSplittingReduxData = useSelector(
  //   (state) => state?.paymentSplitting?.paymentSplittingData
  // );

  const {
    additionalCharges: additionalChargesFromRedux = [],
    convertedFrom = [],
  } = useSelector((state) => state.commonVoucherSlice);

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [showAdditionalCharges, setShowAdditionalCharges] = useState(
    additionalChargesFromRedux.length > 0
  );
  const [voucherNumber, setVoucherNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  });
  

  const [openAdditionalTile, setOpenAdditionalTile] = useState(false);

  // Calculated values
  const subTotal = useMemo(() => {
    return items.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
  }, [items]);

  // API calls wrapped in promises
  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      // Prepare promises conditionally
      const promises = [];

      // Additional Charges
      let additionalCharges = allAdditionalChargesFromRedux;
      if (!additionalCharges || additionalCharges.length === 0) {
        promises.push(
          api.get(`/api/sUsers/additionalcharges/${cmp_id}`, {
            withCredentials: true,
          })
        );
      }

      // Configuration Number
      if (!voucherNumberFromRedux) {
        promises.push(
          api.get(`/api/sUsers/fetchConfigurationNumber/${cmp_id}/sales`, {
            withCredentials: true,
          })
        );
      } else {
        setVoucherNumber(voucherNumberFromRedux);
      }

      const responses = await Promise.all(promises);

      // Handle additional charges response if fetched
      if (responses[0] && !allAdditionalChargesFromRedux?.length) {
        const additionalChargesResponse = responses[0];
        additionalCharges =
          additionalChargesResponse.data?.additionalCharges || [];
        dispatch(addAllAdditionalCharges(additionalCharges));
      }

      // Handle configuration number response if fetched
      const configResponseIndex = allAdditionalChargesFromRedux?.length ? 0 : 1;

      if (responses[configResponseIndex]) {
        const configData = responses[configResponseIndex].data;

        if (configData.message === "default") {
          const voucherNumber = configData.configurationNumber;
          setVoucherNumber(voucherNumber);
          dispatch(addVoucherNumber(voucherNumber));
        } else {
          const { configDetails, configurationNumber } = configData;
          if (configDetails) {
            const { widthOfNumericalPart, prefixDetails, suffixDetails } =
              configDetails;
            const paddedNumber = configurationNumber
              .toString()
              .padStart(widthOfNumericalPart, 0);
            const finalOrderNumber = [
              prefixDetails,
              paddedNumber,
              suffixDetails,
            ]
              .filter(Boolean)
              .join("-");
            setVoucherNumber(finalOrderNumber);
            dispatch(addVoucherNumber(finalOrderNumber));
          } else {
            setVoucherNumber(configurationNumber);
            dispatch(addVoucherNumber(configurationNumber));
          }
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error fetching data");
    } finally {
      setIsLoading(false);
    }
  }, [cmp_id]);

  // Initialize component
  useEffect(() => {
    getVoucherType();
    if (!date) dispatch(changeDate(JSON.stringify(selectedDate)));
    localStorage.removeItem("scrollPositionAddItemSales");
    fetchData();
  }, [fetchData]);

  // Navigation and form handlers
  const handleAddItem = () => {
    if (Object.keys(party).length === 0) {
      toast.error("Select a party first");
      return;
    }
    navigate("/sUsers/addItemSales");
  };

  const submitHandler = async () => {
    // Validation
    if (Object.keys(party).length === 0) {
      toast.error("Add a party first");
      return;
    }

    if (items.length === 0) {
      toast.error("Add at least an item");
      return;
    }

    if (openAdditionalTile) {
      const hasEmptyValue = additionalChargesFromRedux.some(
        (row) => row.value === ""
      );
      if (hasEmptyValue) {
        toast.error("Please add a value.");
        setSubmitLoading(false);
        return;
      }
      const hasNagetiveValue = additionalChargesFromRedux.some(
        (row) => parseFloat(row.value) < 0
      );
      if (hasNagetiveValue) {
        toast.error("Please add a positive value");
        setSubmitLoading(false);

        return;
      }
    }

    setSubmitLoading(true);

    try {
      const formData = {
        selectedDate:new Date(selectedDate).toISOString(),
        voucherType,
        [`${voucherType}Number`]:voucherNumber,
        orgId:cmp_id,
        finalAmount: Number(totalAmount.toFixed(2)),
        party,
        items,
        despatchDetails,
         priceLevelFromRedux,
         additionalChargesFromRedux,
        // batchHeights,
        // convertedFrom,
        // paymentSplittingData:
        //   Object.keys(paymentSplittingReduxData).length !== 0
        //     ? paymentSplittingReduxData
        //     : {},
      };

      console.log(formData);

      const res = await api.post(
        `/api/sUsers/createSale?vanSale=${false}`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success(res.data.message);
      navigate(`/sUsers/salesDetails/${res.data.data._id}`, {
        state: { from: location?.state?.from || "null" },
      });
      dispatch(removeAll());
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating sale");
      console.log(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mb-14 sm:mb-0">
      <div className="flex-1 bg-slate-100 h -screen ">
        <TitleDiv
          title="Sales"
          // from={`/sUsers/selectVouchers`}
          loading={isLoading || submitLoading}
        />

        <div className={`${isLoading ? "pointer-events-none opacity-70" : ""}`}>
          {/* invoiec date */}

          <HeaderTile
            title={voucherTypeFromRedux}
            number={voucherNumber}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dispatch={dispatch}
            changeDate={changeDate}
            submitHandler={submitHandler}
            removeAll={removeAll}
            tab="add"
            isLoading={submitLoading}
          />
          {/* adding party */}

          <AddPartyTile
            party={party}
            dispatch={dispatch}
            removeParty={removeParty}
            link="/sUsers/searchPartySales"
            linkBillTo="/sUsers/billToSales"
            convertedFrom={convertedFrom}
          />

          {/* Despatch details */}

          <DespatchDetails tab={"sales"} />

          {/* adding items */}

          <AddItemTile
            items={items}
            handleAddItem={handleAddItem}
            dispatch={dispatch}
            removeItem={removeItem}
            removeGodownOrBatch={removeGodownOrBatch}
            navigate={navigate}
            godownname={""}
            subTotal={subTotal}
            type="sale"
            convertedFrom={convertedFrom}
            urlToAddItem="/sUsers/addItemSales"
            urlToEditItem="/sUsers/editItemSales"
          />

          <AdditionalChargesTile
            type={"sale"}
            subTotal={subTotal}
            setOpenAdditionalTile={setOpenAdditionalTile}
            openAdditionalTile={openAdditionalTile}
          />

          <div className="flex justify-between items-center bg-white mt-2 p-3">
            <p className="font-bold text-md">Total Amount</p>
            <div className="flex flex-col items-center">
              <p className="font-bold text-md">
                ₹ {totalAmount.toFixed(2) ?? 0}
              </p>
              <p className="text-[9px] text-gray-400">(rounded)</p>
            </div>
          </div>

          {/* {items.length > 0 && totalAmount > 0 && (
            <PaymentSplittingIcon
              totalAmount={totalAmount}
              party={party}
              voucherType="sale"
            />
          )} */}

          <FooterButton
            submitHandler={submitHandler}
            tab="add"
            title="Sale"
            isLoading={submitLoading || isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default VoucherInitialPage;
