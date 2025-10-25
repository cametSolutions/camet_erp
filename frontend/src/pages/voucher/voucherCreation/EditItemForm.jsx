/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from "react";
import { MdModeEditOutline } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { resetPaymentSplit, updateItem } from "../../../../slices/voucherSlices/commonVoucherSlice";
import { useDispatch } from "react-redux";
import TitleDiv from "@/components/common/TitleDiv";
import DatePicker from "react-datepicker";
import {
  getFutureDate,
  isExpiryValid,
} from "../../../../../backend/utils/dateHelpers";

function EditItemForm({ ItemsFromRedux, from, taxInclusive = false, loading }) {
  const [item, setItem] = useState([]);
  const [newPrice, setNewPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [actualQuantity, setActualQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [igst, setIgst] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState("amount");
  // const [taxExclusivePrice, setTaxExclusivePrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);
  const [description, setDescription] = useState(0);
  const [warrantyCard, setWarrantyCard] = useState(null);
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [manufactureDate, setManufactureDate] = useState(new Date());

  // const [taxAmount, setTaxAmount] = useState(0);

  // Tax related states
  const [cess, setCess] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [additionalCess, setAdditionalCess] = useState(0);
  const [cessAmount, setCessAmount] = useState(0);
  const [additionalCessAmount, setAdditionalCessAmount] = useState(0);
  const [totalCessAmount, setTotalCessAmount] = useState(0);

  // Tax calculation amounts
  const [cgstAmount, setCgstAmount] = useState(0);
  const [sgstAmount, setSgstAmount] = useState(0);
  const [igstAmount, setIgstAmount] = useState(0);
  const [taxableAmount, setTaxableAmount] = useState(0);

  // New variables to match your requirements
  const [basePrice, setBasePrice] = useState(0);
  const [cessValue, setCessValue] = useState(0);
  const [addlCessValue, setAddlCessValue] = useState(0);
  // const [discountType, setDiscountType] = useState("none");
  const [cgstValue, setCgstValue] = useState(0);
  const [sgstValue, setSgstValue] = useState(0);
  const [igstValue, setIgstValue] = useState(0);
  const [individualTotal, setIndividualTotal] = useState(0);

  const { id } = useParams();
  let { index } = useParams();
  if (
    index === undefined ||
    index === null ||
    index === "" ||
    index === "null"
  ) {
    index = 0;
  }
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedItem = ItemsFromRedux.filter((el) => el._id === id);
  const selectedGodown =
    index !== "null"
      ? selectedItem[0]?.GodownList[index]
      : selectedItem[0]?.GodownList[0];

  const { voucherType: voucherTypeFromRedux, warrantyCardsList } = useSelector(
    (state) => state.commonVoucherSlice
  );

  const { configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const configuration = configurations[0];
  const {
    enableActualAndBilledQuantity = false,
    enableNegativeStockBlockForVanInvoice = false,
    enableManufacturingDate = false,
    enableExpiryDate = false,
    showDescription,
  } = configuration || {};

  const normalizedVoucherType = {
    sales: "sale",
    saleOrder: "saleOrder",
  }[voucherTypeFromRedux];

  const calculateTotal = (item, selectedPriceLevel, situation = "normal") => {
    let priceRate = 0;
    if (situation === "priceLevelChange") {
      priceRate =
        item.Priceleveles.find((level) => level._id === selectedPriceLevel?._id)
          ?.pricerate || 0;
    }

    let subtotal = 0;
    let individualTotals = [];
    let totalCess = 0;
    let totalAdditionalCess = 0;
    let totalCgstAmt = 0;
    let totalSgstAmt = 0;
    let totalIgstAmt = 0;
    let totalTaxableAmount = 0;

    item.GodownList.forEach((godownOrBatch, index) => {
      if (situation === "normal") {
        priceRate = godownOrBatch.selectedPriceRate;
      }
      const quantity = Number(godownOrBatch.count) || 0;
      const igstValue = Math.max(item.igst || 0, 0);
      const cgstValue = Math.max(item.cgst || 0, 0);
      const sgstValue = Math.max(item.sgst || 0, 0);

      // Calculate base price based on tax inclusivity
      let basePrice = priceRate * quantity;
      let taxBasePrice = basePrice;

      // For tax inclusive prices, calculate the base price without tax
      if (item?.isTaxInclusive) {
        // Use total tax rate (IGST or CGST+SGST)
        const totalTaxRate = igstValue || 0;
        taxBasePrice = Number(
          (basePrice / (1 + totalTaxRate / 100)).toFixed(2)
        );
      }

      // Calculate discount based on discountType
      let discountedPrice = taxBasePrice;
      let discountAmount = 0;
      let discountPercentage = 0;
      let discountType = "none";

      if (
        godownOrBatch.discountType === "percentage" &&
        godownOrBatch.discountPercentage !== 0 &&
        godownOrBatch.discountPercentage !== undefined &&
        godownOrBatch.discountPercentage !== ""
      ) {
        // Percentage discount
        discountType = "percentage";
        discountPercentage = Number(godownOrBatch.discountPercentage) || 0;
        discountAmount = Number(
          ((taxBasePrice * discountPercentage) / 100).toFixed(2)
        );
        discountedPrice = taxBasePrice - discountAmount;
      } else if (
        godownOrBatch.discountAmount !== 0 &&
        godownOrBatch.discountAmount !== undefined &&
        godownOrBatch.discountAmount !== ""
      ) {
        // Fixed amount discount (default)
        discountType = "amount";
        discountAmount = Number(godownOrBatch.discountAmount) || 0;
        // Calculate the equivalent percentage
        discountPercentage =
          taxBasePrice > 0
            ? Number(((discountAmount / taxBasePrice) * 100).toFixed(2))
            : 0;
        discountedPrice = taxBasePrice - discountAmount;
      }

      // This is the taxable amount (price after discount, before tax)
      const taxableAmount = discountedPrice;

      // Calculate cess amounts
      let cessAmount = 0;
      let additionalCessAmount = 0;
      const cessValue = item.cess || 0;
      const addlCessValue = item.addl_cess || 0;

      // Standard cess calculation
      if (cessValue > 0) {
        cessAmount = Number((taxableAmount * (cessValue / 100)).toFixed(2));
      }

      // Additional cess calculation - calculated as quantity * addl_cess
      if (addlCessValue > 0) {
        additionalCessAmount = Number((quantity * addlCessValue).toFixed(2));
      }

      // Combine cess amounts
      const totalCessAmount = Number(
        (cessAmount + additionalCessAmount).toFixed(2)
      );

      // Calculate tax amounts
      let cgstAmt = 0;
      let sgstAmt = 0;
      let igstAmt = 0;

      igstAmt = Number((taxableAmount * (igstValue / 100)).toFixed(2));
      cgstAmt = Number((taxableAmount * (cgstValue / 100)).toFixed(2));
      sgstAmt = Number((taxableAmount * (sgstValue / 100)).toFixed(2));

      // Calculate total including tax and cess
      const individualTotal = Math.max(
        Number((taxableAmount + igstAmt + totalCessAmount).toFixed(2)),
        0
      );

      subtotal += individualTotal;
      totalCess += cessAmount;
      totalAdditionalCess += additionalCessAmount;
      totalCgstAmt += cgstAmt;
      totalSgstAmt += sgstAmt;
      totalIgstAmt += igstAmt;
      totalTaxableAmount += taxableAmount;

      individualTotals.push({
        index,
        basePrice: taxBasePrice, // Original price × quantity before discount
        discountAmount, // Discount amount
        discountPercentage, // Discount percentage
        discountType,
        taxableAmount, // Amount after discount, before tax (basis for tax calculation)
        cgstValue, // CGST percentage
        sgstValue, // SGST percentage
        igstValue, // IGST percentage
        cessValue, // Standard cess percentage
        addlCessValue, // Additional cess per quantity
        cgstAmt, // CGST amount
        sgstAmt, // SGST amount
        igstAmt, // IGST amount
        cessAmt: cessAmount, // Standard cess amount (percentage based)
        addlCessAmt: additionalCessAmount, // Additional cess amount (quantity based)
        individualTotal, // Final amount including taxes and cess
        quantity, // Quantity
        taxInclusive, // Tax inclusive flag
      });
    });

    subtotal = Math.max(parseFloat(subtotal.toFixed(2)), 0);
    totalCgstAmt = parseFloat(totalCgstAmt.toFixed(2));
    totalSgstAmt = parseFloat(totalSgstAmt.toFixed(2));
    totalIgstAmt = parseFloat(totalIgstAmt.toFixed(2));
    totalCess = parseFloat(totalCess.toFixed(2));
    totalAdditionalCess = parseFloat(totalAdditionalCess.toFixed(2));
    totalTaxableAmount = parseFloat(totalTaxableAmount.toFixed(2));

    return {
      individualTotals, // Detailed breakdown of each godown/batch
      total: subtotal, // Grand total including all taxes and cess
      totalTaxableAmount, // Total amount on which tax is calculated
      totalCess, // Total standard cess amount
      totalAdditionalCess, // Total additional cess amount
      totalCessAmount: totalCess + totalAdditionalCess, // Combined total cess
      totalCgstAmt, // Total CGST amount
      totalSgstAmt, // Total SGST amount
      totalIgstAmt, // Total IGST amount
      totalTaxAmount: totalIgstAmt, // Total tax amount (convenience field)
    };
  };

  useEffect(() => {
    setItem(selectedItem[0]);

    

    if (selectedItem) {
      setNewPrice(selectedGodown?.selectedPriceRate || 0);
      setQuantity(selectedGodown?.count || 1);
      setDescription(selectedGodown?.description || "");
      setWarrantyCard(selectedGodown?.warrantyCard || null);

      if (enableActualAndBilledQuantity) {
        setActualQuantity(
          selectedGodown?.actualCount || selectedGodown?.count || 1
        );
      } else {
        setActualQuantity(selectedGodown?.count || 1);
      }

      if (selectedGodown?.mfgdt) {
        setManufactureDate(
          selectedGodown?.mfgdt ? new Date(selectedGodown?.mfgdt) : new Date()
        );
      }

      if (selectedGodown?.expdt) {
        setExpirationDate(
          selectedGodown?.expdt ? new Date(selectedGodown?.expdt) : new Date()
        );
      }

      // Set discount information
      if (selectedGodown?.discountType === "amount") {
        // setDiscount(selectedGodown?.discount);
        setType("amount");
        // setDiscountType("amount");
        setDiscountPercentage(selectedGodown?.discountPercentage);
        setDiscountAmount(selectedGodown?.discount);
        setDiscount(selectedGodown?.discountAmount);
      } else if (selectedGodown?.discountType === "percentage") {
        // setDiscount(selectedGodown?.discountPercentage);
        setDiscountAmount(selectedGodown?.discount);
        setType("percentage");
        // setDiscountType("percentage");
        setDiscountPercentage(selectedGodown?.discountPercentage);
        setDiscount(selectedGodown?.discountPercentage);
      } else {
        // setDiscountType("none");
        setType("percentage");
      }
    }

    setUnit(selectedItem[0]?.unit);
    setIgst(selectedItem[0]?.igst);
    setIgstValue(selectedItem[0]?.igst || 0);
    // Set tax-related values
    setCess(selectedItem[0]?.cess || 0);
    setCessValue(selectedItem[0]?.cess || 0);
    setCgst(selectedItem[0]?.cgst || 0);
    setCgstValue(selectedItem[0]?.cgst || 0);
    setSgst(selectedItem[0]?.sgst || 0);
    setSgstValue(selectedItem[0]?.sgst || 0);
    setAdditionalCess(selectedItem[0]?.addl_cess || 0);
    setAddlCessValue(selectedItem[0]?.addl_cess || 0);

    // log

    if (taxInclusive) {
      setIsTaxInclusive(
        selectedGodown?.isTaxInclusive || selectedItem[0]?.taxInclusive
      );
    }
  }, [selectedItem[0], enableActualAndBilledQuantity]);

  useEffect(() => {
    // Create a mock item object with structure needed for calculateTotal
    const mockItem = {
      Priceleveles: [],
      GodownList: [
        {
          count: quantity,
          selectedPriceRate: parseFloat(newPrice) || 0,
          discountType: type,
          discountAmount: type === "amount" ? discount : "",
          discountPercentage: type === "percentage" ? discount : "",
        },
      ],
      igst: parseFloat(igst) || 0,
      cgst: parseFloat(cgst) || 0,
      sgst: parseFloat(sgst) || 0,
      cess: parseFloat(cess) || 0,
      addl_cess: parseFloat(additionalCess) || 0,
      isTaxInclusive: isTaxInclusive,
    };

    // Get result from calculateTotal function
    const result = calculateTotal(mockItem, null, "normal");
    const totals = result.individualTotals[0];

    // Update all state values from the calculated result
    setTotalAmount(result.total);
    setBasePrice(totals.basePrice);
    setDiscountAmount(totals.discountAmount);
    setDiscountPercentage(totals.discountPercentage);
    // setDiscountType(totals.discountType);
    // setTaxExclusivePrice(totals.basePrice);
    setTaxableAmount(totals.taxableAmount);
    // setTaxAmount(result.totalTaxAmount);

    // Tax specific values
    setCgstValue(totals.cgstValue);
    setSgstValue(totals.sgstValue);
    setIgstValue(totals.igstValue);
    setCessValue(totals.cessValue);
    setAddlCessValue(totals.addlCessValue);

    // Tax amounts
    setCessAmount(result.totalCess);
    setAdditionalCessAmount(result.totalAdditionalCess);
    setTotalCessAmount(result.totalCessAmount);
    setCgstAmount(result.totalCgstAmt);
    setSgstAmount(result.totalSgstAmt);
    setIgstAmount(result.totalIgstAmt);
    setIndividualTotal(totals.individualTotal);
  }, [
    newPrice,
    quantity,
    discount,
    type,
    igst,
    cgst,
    sgst,
    isTaxInclusive,
    cess,
    additionalCess,
  ]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDirectQuantityChange = (value) => {
    if (
      enableActualAndBilledQuantity &&
      Number(value) > Number(actualQuantity)
    ) {
      return;
    }
    if (value.includes(".")) {
      const parts = value.split(".");
      if (parts[1].length > 3) {
        return;
      }
    }

    if (
      Number(value) > selectedGodown?.balance_stock &&
      enableNegativeStockBlockForVanInvoice &&
      voucherTypeFromRedux === "vanSale"
    ) {
      return;
    }

    setQuantity(value);

    if (!enableActualAndBilledQuantity) {
      setActualQuantity(value);
    }
  };

  const handleActualQuantityChange = (value) => {
    if (value.includes(".")) {
      const parts = value.split(".");
      if (parts[1].length > 3) {
        return;
      }
    }

    if (
      Number(value) > selectedGodown?.balance_stock &&
      enableNegativeStockBlockForVanInvoice &&
      voucherTypeFromRedux === "vanSale"
    ) {
      return;
    }

    setActualQuantity(value);
    setQuantity(value);
  };

  const handleWarrantyCardChange = (value) => {
    const selectedWarrantyCard = warrantyCardsList.find(
      (card) => card._id === value
    );
    /// here we need to manipulate expiry date according to the date in waranty card;
    const { warrantyYears = 0, warrantyMonths = 0 } = selectedWarrantyCard;
    /// get a future date according to the date in waranty card;
    const futureDate = getFutureDate({
      years: warrantyYears,
      months: warrantyMonths,
    });
    const valid = isExpiryValid(manufactureDate, futureDate);
    if (!valid) {
      return;
    }
    setExpirationDate(futureDate);
    setWarrantyCard(selectedWarrantyCard?._id);
  };

  const handleExpiryDateChange = (value) => {
    const valid = isExpiryValid(manufactureDate, value);
    if (!valid) {
      return;
    }
    setExpirationDate(value);
  };

  const submitFormData = () => {
    // Create a copy of the current item
    const updatedItem = { ...item };

    // Check if we need to update all godowns
    const shouldUpdateAllGodowns =
      updatedItem.gdnEnabled === true &&
      updatedItem.hasGodownOrBatch === true &&
      updatedItem.batchEnabled !== true;
    updatedItem.isTaxInclusive = isTaxInclusive;

    if (shouldUpdateAllGodowns) {
      // Get the new rate and discount settings
      const newRate = parseFloat(newPrice);
      const newDiscountType = type;
      const newDiscountValue = discount;

      // Create a temporary mock item with the updated values for calculation
      const mockItem = {
        Priceleveles: [],
        GodownList: updatedItem.GodownList.map((godown, godownIndex) => {
          // If this is the current godown index, use the new quantity values
          const godownQty =
            godownIndex === parseInt(index) ? quantity : godown.count || 0;
          const godownActualQty =
            godownIndex === parseInt(index)
              ? actualQuantity
              : godown.actualCount || godown.count || 0;

          return {
            ...godown,
            count: godownQty,
            actualCount: godownActualQty,
            selectedPriceRate: newRate,
            discountType: newDiscountType,
            description: description,
            warrantyCard: warrantyCard || null,
            mfgdt: item?.batchEnabled ? manufactureDate : null,
            expdt: item?.batchEnabled ? expirationDate : null,

            discountAmount:
              newDiscountType === "amount" ? newDiscountValue : "",
            discountPercentage:
              newDiscountType === "percentage" ? newDiscountValue : "",
          };
        }),
        igst: parseFloat(igst) || 0,
        cgst: parseFloat(cgst) || 0,
        sgst: parseFloat(sgst) || 0,
        cess: parseFloat(cess) || 0,
        addl_cess: parseFloat(additionalCess) || 0,
        isTaxInclusive: isTaxInclusive,
      };

      // Calculate totals for all godowns
      const result = calculateTotal(mockItem, null, "normal");

      // Update each godown with the calculated values
      updatedItem.GodownList = updatedItem.GodownList.map(
        (godown, godownIndex) => {
          // Preserve specific fields that should not be changed
          const preservedFields = {
            godown: godown.godown,
            balance_stock: godown.balance_stock,
            _id: godown._id,
            godown_id: godown.godown_id,
            defaultGodown: godown.defaultGodown,
            added: godown.added,
          };

          // Get calculated values from the result
          const calculatedValues = result.individualTotals[godownIndex];

          // If this is the current godown index, use the new quantity values
          const godownQty =
            godownIndex === parseInt(index) ? quantity : godown.count || 0;
          const godownActualQty =
            godownIndex === parseInt(index)
              ? actualQuantity
              : godown.actualCount || godown.count || 0;

          // Return the updated godown
          return {
            ...godown,
            // Quantities
            count: godownQty,
            actualCount: godownActualQty,

            // Update with new common values
            selectedPriceRate: newRate,
            discountType: newDiscountType,
            discountAmount: calculatedValues.discountAmount,
            discountPercentage: calculatedValues.discountPercentage,
            isTaxInclusive: isTaxInclusive,
            description: description,
            warrantyCard: warrantyCard || null,

            mfgdt: item?.batchEnabled ? manufactureDate : null,
            expdt: item?.batchEnabled ? expirationDate : null,

            // Values from calculation
            basePrice: calculatedValues.basePrice,
            taxableAmount: calculatedValues.taxableAmount,
            individualTotal: calculatedValues.individualTotal,

            // Tax related fields (percentages)
            igstValue: calculatedValues.igstValue,
            cgstValue: calculatedValues.cgstValue,
            sgstValue: calculatedValues.sgstValue,
            cessValue: calculatedValues.cessValue,
            addlCessValue: calculatedValues.addlCessValue,

            // Tax related fields (amounts)
            igstAmount: calculatedValues.igstAmt,
            cgstAmount: calculatedValues.cgstAmt,
            sgstAmount: calculatedValues.sgstAmt,
            cessAmount: calculatedValues.cessAmt,
            additionalCessAmount: calculatedValues.addlCessAmt,
            totalCessAmount:
              calculatedValues.cessAmt + calculatedValues.addlCessAmt,

            // Preserve the specific fields
            ...preservedFields,
          };
        }
      );
    } else {
      // Just update the godown at the specified index
      const godownToUpdate = { ...updatedItem.GodownList[index] };

      // Preserve specific fields that should not be changed
      const preservedFields = {
        godown: godownToUpdate.godown,
        balance_stock: godownToUpdate.balance_stock,
        _id: godownToUpdate._id,
        godown_id: godownToUpdate.godown_id,
        defaultGodown: godownToUpdate.defaultGodown,
        added: godownToUpdate.added,
      };

      // Update with new values while preserving specified fields
      const updatedGodown = {
        ...godownToUpdate,
        // Update with new values
        count: Number(quantity || 0),

        actualCount: Number(actualQuantity || 0),
        selectedPriceRate: parseFloat(newPrice),
        discountAmount: discountAmount,
        discountPercentage: discountPercentage,
        discountType: type,
        isTaxInclusive: isTaxInclusive,
        basePrice: basePrice,
        taxableAmount: taxableAmount,
        individualTotal: individualTotal,
        description: description,
        warrantyCard: warrantyCard || null,

        mfgdt: item?.batchEnabled ? manufactureDate : null,
        expdt: item?.batchEnabled ? expirationDate : null,

        // Tax related fields
        igstValue: igstValue,
        cgstValue: cgstValue,
        sgstValue: sgstValue,
        cessValue: cessValue,
        addlCessValue: addlCessValue,

        igstAmount: igstAmount,
        cgstAmount: cgstAmount,
        sgstAmount: sgstAmount,
        cessAmount: cessAmount,
        additionalCessAmount: additionalCessAmount,
        totalCessAmount: totalCessAmount,

        // Preserve the specific fields
        ...preservedFields,
      };

      // Update the godown at the specified index immutably
      updatedItem.GodownList = updatedItem.GodownList.map((godown, i) =>
        i === parseInt(index) ? updatedGodown : godown
      );
    }

    const godownList = updatedItem.GodownList;
    updatedItem.taxInclusive = isTaxInclusive;
    updatedItem.totalCgstAmt = godownList.reduce(
      (acc, item) => acc + (item.cgstAmount || 0),
      0
    );
    updatedItem.totalSgstAmt = godownList.reduce(
      (acc, item) => acc + (item.sgstAmount || 0),
      0
    );
    updatedItem.totalIgstAmt = godownList.reduce(
      (acc, item) => acc + (item.igstAmount || 0),
      0
    );
    updatedItem.totalCessAmt = godownList.reduce(
      (acc, item) => acc + (item.cessAmount || 0),
      0
    );
    updatedItem.totalAddlCessAmt = godownList.reduce(
      (acc, item) => acc + (item.additionalCessAmount || 0),
      0
    );
    updatedItem.totalCount = godownList.reduce(
      (acc, item) => acc + (item.count || 0),
      0
    );
    updatedItem.totalActualCount = godownList.reduce(
      (acc, item) => acc + (item.actualCount || 0),
      0
    );
    updatedItem.total = updatedItem?.GodownList?.reduce(
      (acc, item) => acc + (item.individualTotal || 0),
      0
    );

    // console.log("Updated Item:", updatedItem);

    // Uncomment these lines when ready to dispatch the action
    dispatch(updateItem({ item: updatedItem, moveToTop: false }));
    dispatch(resetPaymentSplit());
    navigate(-1, { replace: true });
  };

  return (
    <div>
      <div className=" flex-1">
        <TitleDiv title="Edit Item" loading={loading} />
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
          <div className="relative md:py-4 sm:max-w-xl sm:mx-auto">
            <div className="relative px-4 py-10 bg-white mx-5 md:mx-0 shadow sm:p-10">
              <div className="max-w-md mx-auto">
                <div className="flex items-center space-x-5">
                  <div className="h-14 w-14 bg-yellow-200 rounded-full flex flex-shrink-0 justify-center items-center text-yellow-500 text-2xl font-mono">
                    <MdModeEditOutline />
                  </div>
                  <div className="block pl-2 font-semibold text-xl self-start text-gray-700">
                    <h2 className="leading-relaxed">{item?.product_name}</h2>
                    <p className="text-sm text-gray-500 font-normal leading-relaxed">
                      Prices and Discount
                    </p>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-md sm:leading-7">
                    <div className="flex flex-col">
                      <label className="leading-loose">Price</label>
                      <input
                        onChange={(e) => {
                          setNewPrice(e.target.value);
                        }}
                        value={newPrice}
                        type="number"
                        className={`${
                          from === "stockTransfer"
                            ? "pointer-events-none"
                            : "pointer-events-auto"
                        } input-number px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600`}
                        placeholder="0"
                      />
                    </div>

                    {taxInclusive &&
                      isTaxInclusive !== null &&
                      isTaxInclusive !== undefined && (
                        <div className="flex items-center gap-3 ml-1">
                          <input
                            type="checkbox"
                            id="valueCheckbox"
                            className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                            checked={isTaxInclusive === true}
                            onChange={() => {
                              setIsTaxInclusive(!isTaxInclusive);
                            }}
                          />
                          <label
                            className="block uppercase text-blueGray-600 text-xs font-bold"
                            htmlFor="valueCheckbox"
                          >
                            Tax Inclusive
                          </label>
                        </div>
                      )}
                    <div
                      className={`grid grid-cols-1 ${
                        enableActualAndBilledQuantity
                          ? "sm:grid-cols-1"
                          : "sm:grid-cols-2"
                      } gap-4`}
                    >
                      <div className="flex flex-row-reverse gap-8">
                        <div className="flex flex-col">
                          <label className="leading-loose">
                            {enableActualAndBilledQuantity
                              ? "Billed Quantity"
                              : "Quantity"}
                          </label>
                          <div className="relative focus-within:text-gray-600 text-gray-400">
                            <input
                              onChange={(e) =>
                                handleDirectQuantityChange(e.target.value)
                              }
                              value={quantity}
                              type="number"
                              className="input-number px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {enableActualAndBilledQuantity && (
                          <div className="flex flex-col">
                            <label className="leading-loose">
                              Actual Quantity
                            </label>
                            <div className="relative focus-within:text-gray-600 text-gray-400">
                              <input
                                onChange={(e) =>
                                  handleActualQuantityChange(e.target.value)
                                }
                                value={actualQuantity}
                                type="number"
                                className="input-number px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <label className="leading-loose">Unit</label>
                        <div className="relative focus-within:text-gray-600 text-gray-400">
                          <input
                            value={unit}
                            disabled
                            type="text"
                            className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600 bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <label className="leading-loose">Discount</label>
                        <div className="relative focus-within:text-gray-600 text-gray-400">
                          {type === "amount" ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                              ₹
                            </span>
                          ) : (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                              %
                            </span>
                          )}
                          <input
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            type="text"
                            className={`${
                              from === "stockTransfer"
                                ? "pointer-events-none"
                                : "pointer-events-auto"
                            } pr-4 pl-10 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600`}
                            placeholder=""
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setType("percentage");
                          // setDiscountType("percentage");
                        }}
                        className={`${
                          type === "percentage"
                            ? "bg-violet-200 border-2 border-violet-500 font-semibold"
                            : ""
                        } p-1 bg-gray-300 md:rounded-xl mt-8 md:px-3 text-sm md:text-md px-2 rounded-lg py-2`}
                      >
                        Percentage
                      </button>
                      <button
                        onClick={() => {
                          setType("amount");
                          // setDiscountType("amount");
                        }}
                        className={`${
                          type === "amount"
                            ? "bg-violet-200 border-2 border-violet-500 font-semibold"
                            : ""
                        } p-1 bg-gray-300 md:rounded-xl mt-8 md:px-3 text-sm md:text-md px-2 rounded-lg py-2`}
                      >
                        Amount
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      {enableManufacturingDate &&
                        item?.batchEnabled &&
                        selectedGodown?.mfgdt &&
                        voucherTypeFromRedux !== "saleOrder" && (
                          <div className="flex flex-col flex-1">
                            <label className="leading-loose">
                              Manufacture Date
                            </label>
                            <DatePicker
                              selected={manufactureDate}
                              onChange={(date) => setManufactureDate(date)}
                              dateFormat="yyyy-MM-dd"
                              className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                              placeholderText="Select a date"
                            />
                          </div>
                        )}

                      {enableExpiryDate &&
                        item?.batchEnabled &&
                        selectedGodown?.expdt &&
                        voucherTypeFromRedux !== "saleOrder" && (
                          <div className="flex flex-col flex-1">
                            <label className="leading-loose">
                              Expiration Date
                            </label>
                            <DatePicker
                              selected={expirationDate}
                              onChange={(date) => handleExpiryDateChange(date)}
                              dateFormat="yyyy-MM-dd"
                              className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                              placeholderText="Select a date"
                            />
                          </div>
                        )}
                    </div>

                    {showDescription[normalizedVoucherType] && (
                      <div className="flex flex-col">
                        <label className="leading-loose">Description</label>
                        <input
                          value={description || ""}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Description of the item"
                          type="text"
                          className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                        />
                      </div>
                    )}

                    {warrantyCardsList?.length > 0 &&
                      voucherTypeFromRedux === "sales" && (
                        <div className="flex flex-col">
                          <label className="leading-loose">Warranty Card</label>
                          <select
                            value={warrantyCard || ""}
                            onChange={(e) =>
                              handleWarrantyCardChange(e.target.value)
                            }
                            className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                          >
                            <option value="" disabled>
                              Select a warranty card
                            </option>
                            <option value="">None</option>
                            {warrantyCardsList?.map((card) => (
                              <option key={card?._id} value={card?._id}>
                                {card?.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                    <div className="flex flex-col">
                      <label className="leading-loose">Tax Rate</label>
                      <input
                        disabled
                        value={`Tax @ ${igst} %`}
                        type="text"
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                      />
                    </div>

                    <div className="bg-slate-200 p-3 font-semibold flex flex-col gap-2 text-gray-500">
                      <div className="flex justify-between">
                        <p className="text-xs">Base Price</p>
                        <p className="text-xs">₹ {basePrice?.toFixed(2)}</p>
                      </div>

                      {/* <div className="flex justify-between">
                        <p className="text-xs">Tax Exclusive Price</p>
                        <p className="text-xs">₹ {taxExclusivePrice?.toFixed(2)}</p>
                      </div> */}

                      {type === "amount" ? (
                        <div className="flex justify-between">
                          <p className="text-xs">Discount</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs">{`(${parseFloat(
                              discountPercentage
                            )?.toFixed(2)} %)`}</p>
                            <p className="text-xs">{`₹ ${discountAmount?.toFixed(
                              2
                            )}`}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <p className="text-xs">Discount</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs">{`(${discountPercentage} %)`}</p>
                            <p className="text-xs">{`₹ ${
                              discountAmount
                                ? Number(discountAmount).toFixed(2)
                                : "0.00"
                            }`}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <p className="text-xs">Taxable Amount</p>
                        <p className="text-xs">₹ {taxableAmount?.toFixed(2)}</p>
                      </div>

                      {/* IGST */}
                      {igstValue > 0 && (
                        <div className="flex justify-between">
                          <p className="text-xs">Tax </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs">{`(${igstValue} %)`}</p>
                            <p className="text-xs">{`₹ ${igstAmount?.toFixed(
                              2
                            )}`}</p>
                          </div>
                        </div>
                      )}

                      {/* New sections for Cess */}
                      {(cess > 0 || additionalCess > 0) && (
                        <>
                          {cess > 0 && (
                            <div className="flex justify-between">
                              <p className="text-xs">Cess</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs">{`( ${cess} % )`}</p>
                                <p className="text-xs">{`₹ ${cessAmount?.toFixed(
                                  2
                                )}`}</p>
                              </div>
                            </div>
                          )}
                          {additionalCess > 0 && (
                            <div className="flex justify-between">
                              <p className="text-xs">Additional Cess</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs">{`₹ ${additionalCessAmount?.toFixed(
                                  2
                                )}`}</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      <div className="flex justify-between font-bold text-black">
                        <p className="text-sm">Total amount</p>
                        <p className="text-xs">{totalAmount?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center space-x-4">
                    <button
                      onClick={handleBackClick}
                      className="flex justify-center items-center w-full text-gray-900 px-4 py-3 rounded-md focus:outline-none"
                    >
                      <svg
                        className="w-6 h-6 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>{" "}
                      Cancel
                    </button>
                    <button
                      onClick={submitFormData}
                      className="bg-violet-500 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditItemForm;
