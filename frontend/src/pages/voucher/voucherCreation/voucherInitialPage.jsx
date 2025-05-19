/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../api/api";
import {
  removeAll,
  removeItem,
  removeGodownOrBatch,
  changeDate,
  removeParty,
  addVoucherType,
  addVoucherNumber,
  addAllAdditionalCharges,
  addVansSaleGodown,
} from "../../../../slices/voucherSlices/commonVoucherSlice";
import DespatchDetails from "./DespatchDetails";
import HeaderTile from "./HeaderTile";
import AddPartyTile from "./AddPartyTile";
import AddItemTile from "./AddItemTile";
// import PaymentSplittingIcon from "../../components/secUsers/main/paymentSplitting/PaymentSplittingIcon";
import FooterButton from "./FooterButton";
import TitleDiv from "../../../components/common/TitleDiv";
import AdditionalChargesTile from "./AdditionalChargesTile";
import { formatVoucherType } from "../../../../utils/formatVoucherType";
import AddGodownTile from "./AddGodownTile";

function VoucherInitialPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isMounted = useRef(true);

  // to find the current voucher
  const getVoucherType = () => {
    if (voucherTypeFromRedux) return;
    /// if the voucherType is not present in redux then we will take it from the location state
    /// voucher type is assigned from the select voucher page to this page
    let currentVoucher = "sales";
    if (location && location.state && location.state.voucherType) {
      currentVoucher = location.state.voucherType;
    }
    dispatch(addVoucherType(currentVoucher));
  };

  /// to get voucher number name

  const getVoucherNumberTitle = () => {
    if (!voucherTypeFromRedux) return "";
    if (
      voucherTypeFromRedux === "sales" ||
      voucherTypeFromRedux === "vanSale"
    ) {
      return "salesNumber";
    } else {
      return voucherTypeFromRedux + "Number";
    }
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
    vanSaleGodown: vanSaleGodownFromRedux,
    additionalCharges: additionalChargesFromRedux = [],
    convertedFrom = [],
    stockTransferToGodown,
  } = useSelector((state) => state.commonVoucherSlice);

  const getApiEndPoint = () => {
    if (voucherTypeFromRedux) {
      return `create${voucherTypeFromRedux
        ?.split("")[0]
        ?.toUpperCase()}${voucherTypeFromRedux?.split("")?.slice(1).join("")}`;
    } else {
      return null;
    }
  };

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
      // Initialize API requests container with names
      const apiRequests = {};

      // Additional Charges
      let additionalCharges = allAdditionalChargesFromRedux;
      if (additionalCharges && additionalCharges.length === 0) {
        apiRequests.additionalChargesRequest = api.get(
          `/api/sUsers/additionalcharges/${cmp_id}`,
          { withCredentials: true }
        );
      }

      // Configuration Number
      if (!voucherNumberFromRedux && voucherTypeFromRedux) {
        apiRequests.configNumberRequest = api.get(
          `/api/sUsers/fetchConfigurationNumber/${cmp_id}/${voucherTypeFromRedux}`,
          { withCredentials: true }
        );
      } else {
        if (isMounted.current) {
          setVoucherNumber(voucherNumberFromRedux);
        }
      }

      // Add godownsName API call if voucher type is 'vanSale'
      if (
        voucherType === "vanSale" &&
        Object.keys(vanSaleGodownFromRedux).length === 0
      ) {
        apiRequests.godownsRequest = api.get(
          `/api/sUsers/godownsName/${cmp_id}`,
          { withCredentials: true }
        );
      }

      // Execute all API requests in parallel
      const responseData = await Promise.all(Object.values(apiRequests));

      // Map responses back to their request names
      const responses = {};
      Object.keys(apiRequests).forEach((key, index) => {
        responses[key] = responseData[index];
      });

      // Process Additional Charges
      if (responses.additionalChargesRequest && isMounted.current) {
        additionalCharges =
          responses.additionalChargesRequest.data?.additionalCharges || [];
        dispatch(addAllAdditionalCharges(additionalCharges));
      }

      // Process Configuration Number
      if (responses.configNumberRequest) {
        const configData = responses.configNumberRequest.data;

        if (configData.message === "default" && isMounted.current) {
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
            if (isMounted.current) {
              dispatch(addVoucherNumber(finalOrderNumber));
            }
          } else {
            setVoucherNumber(configurationNumber);
            dispatch(addVoucherNumber(configurationNumber));
          }
        }
      }

      // Process Godowns data if requested
      if (
        responses.godownsRequest &&
        voucherType === "vanSale" &&
        Object.keys(vanSaleGodownFromRedux).length === 0 &&
        isMounted.current
      ) {
        const godownsData = responses.godownsRequest.data;

        if (godownsData?.data === null) {
          navigate("/sUsers/selectVouchers");
          toast.error("No godown is configured");
          return;
        }
        dispatch(addVansSaleGodown(godownsData?.data || {}));
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error fetching data");
    } finally {
      setIsLoading(false);
    }
  }, [cmp_id, voucherTypeFromRedux]);

  // Initialize component
  useEffect(() => {
    getVoucherType();

    if (!date) dispatch(changeDate(JSON.stringify(selectedDate)));
    localStorage.removeItem("scrollPositionAddItemSales");
    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  // Navigation and form handlers
  const handleAddItem = () => {
    if (
      Object.keys(party).length === 0 &&
      voucherTypeFromRedux !== "stockTransfer"
    ) {
      toast.error("Select a party first");
      return;
    } else if (
      voucherTypeFromRedux === "stockTransfer" &&
      Object.keys(stockTransferToGodown).length === 0
    ) {
      toast.error("Select a from godown first");
      return;
    }
    navigate("/sUsers/addItemSales");
  };

  const submitHandler = async () => {
    // Validation
    if (
      Object.keys(party).length === 0 &&
      voucherTypeFromRedux !== "stockTransfer"
    ) {
      toast.error("Add a party first");
      return;
    }

    if (
      voucherTypeFromRedux === "stockTransfer" &&
      Object.keys(stockTransferToGodown).length === 0
    ) {
      toast.error("Select a from godown first");
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
    const voucherNumberTitle = getVoucherNumberTitle();

    let formData = {};

    try {
      if (voucherTypeFromRedux === "stockTransfer") {
        formData = {
          selectedDate: new Date(selectedDate).toISOString(),
          voucherType,
          orgId: cmp_id,

          [voucherNumberTitle]: voucherNumber,
          stockTransferToGodown,
          items,
          finalAmount: 0,
        };
      } else {
        formData = {
          selectedDate: new Date(selectedDate).toISOString(),
          voucherType,
          [voucherNumberTitle]: voucherNumber,
          orgId: cmp_id,
          finalAmount: Number(totalAmount.toFixed(2)),
          party,
          items,
          despatchDetails,
          priceLevelFromRedux,
          additionalChargesFromRedux,
          selectedGodownDetails: vanSaleGodownFromRedux,
        };
      }

      const endPoint = getApiEndPoint();
      let params = {};
      if (voucherTypeFromRedux === "vanSale") {
        params = {
          vanSale: true,
        };
      }

      console.log(endPoint);

      const res = await api.post(
        `/api/sUsers/${endPoint}?${new URLSearchParams(params)}`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success(res.data.message);
      navigate(`/sUsers/${voucherTypeFromRedux}Details/${res.data.data._id}`, {
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
          title={formatVoucherType(voucherTypeFromRedux)}
          // from={`/sUsers/selectVouchers`}
          loading={isLoading || submitLoading}
        />

        <div className={`${isLoading ? "pointer-events-none opacity-70" : ""}`}>
          {/* invoiec date */}

          <HeaderTile
            title={formatVoucherType(voucherTypeFromRedux)}
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

          {voucherTypeFromRedux === "stockTransfer" ? (
            <AddGodownTile />
          ) : (
            <AddPartyTile
              party={party}
              dispatch={dispatch}
              removeParty={removeParty}
              link="/sUsers/searchPartySales"
              linkBillTo="/sUsers/billToSales"
              convertedFrom={convertedFrom}
            />
          )}

          {/* Despatch details */}

          {voucherTypeFromRedux !== "stockTransfer" && (
            <DespatchDetails tab={"sales"} />
          )}

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
            title={formatVoucherType(voucherTypeFromRedux)}
            isLoading={submitLoading || isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default VoucherInitialPage;
