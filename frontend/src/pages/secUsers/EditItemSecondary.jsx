/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { MdModeEditOutline } from "react-icons/md";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  addPriceRate,
  changeIgstAndDiscount,
} from "../../../slices/invoiceSecondary";

function EditItemSecondary() {
  const [item, setItem] = useState([]);
  const [newPrice, setNewPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [igst, setIgst] = useState("");
  const [cess, setCess] = useState("");
  const [addlCess, setAddlCess] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState("amount");
  const [taxExclusivePrice, setTaxExclusivePrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [cessAmount, setCessAmount] = useState(0);
  const [addlCessAmount, setAddlCessAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);
  const [actualQuantity, setActualQuantity] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();

  const ItemsFromRedux = useSelector((state) => state.invoiceSecondary.items);
  const selectedItem = ItemsFromRedux.filter((el) => el._id === id);
  const { configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const configuration = configurations[0];
  const enableActualAndBilledQuantity =
    configuration?.enableActualAndBilledQuantity || false;

  useEffect(() => {
    if (selectedItem[0]) {
      setItem(selectedItem[0]);
      setNewPrice(selectedItem[0]?.selectedPriceRate || 0);
      setQuantity(selectedItem[0]?.count || 1);
      if (enableActualAndBilledQuantity) {
        setActualQuantity(selectedItem[0]?.actualCount || 1);
      } else {
        setActualQuantity(selectedItem[0]?.count || 1);
      }
      setUnit(selectedItem[0]?.unit);
      setIgst(selectedItem[0]?.igst);
      setCess(selectedItem[0]?.cess || 0);
      setAddlCess(selectedItem[0]?.addl_cess || 0);
      setIsTaxInclusive(selectedItem[0]?.isTaxInclusive || false);

      if (selectedItem[0]?.discountType === "amount") {
        setDiscount(selectedItem[0]?.discount);
        setType("amount");
        setDiscountPercentage(selectedItem[0]?.discountPercentage);
        setDiscountAmount(selectedItem[0]?.discount);
      } else {
        setDiscount(selectedItem[0]?.discountPercentage);
        setDiscountAmount(selectedItem[0]?.discount);

        setType("percentage");
        setDiscountPercentage(selectedItem[0]?.discountPercentage);
      }
    }
  }, [selectedItem[0]]);

  useEffect(() => {
    // Ensure all inputs are properly parsed
    const newPriceValue = parseFloat(newPrice) || 0;
    const quantityValue = parseFloat(quantity) || 1;
    const discountValue = parseFloat(discount) || 0;
    const igstValue = parseFloat(igst) || 0;
    const cessValue = parseFloat(cess) || 0;
    const addlCessValue = parseFloat(addlCess) || 0;

    ///////////////// for tax inclusive and exclusive //////////////

    if (isTaxInclusive) {
      const taxInclusivePrice = newPriceValue * quantityValue;
      // Calculate base price excluding all taxes
      const totalTaxRate = igstValue + cessValue;
      const taxBasePrice = Number(
        (taxInclusivePrice / (1 + totalTaxRate / 100)).toFixed(2)
      );

      /// Discount calculation
      let calculatedDiscountAmount = 0;
      let calculatedDiscountPercentage = 0;

      if (type === "amount") {
        calculatedDiscountAmount = discountValue; // Given discount value is treated as amount
        calculatedDiscountPercentage =
          Number(
            ((discountValue / taxBasePrice) * 100).toFixed(2) // Calculate percentage
          ) || 0;
      } else if (type === "percentage") {
        calculatedDiscountPercentage = discountValue; // Given discount value is treated as percentage
        calculatedDiscountAmount = Number(
          ((discountValue / 100) * taxBasePrice).toFixed(2) // Calculate amount
        );
      }

      const discountedPrice = Number(
        (taxBasePrice - calculatedDiscountAmount).toFixed(2)
      );

      ////final calculation
      const igstAmount = discountedPrice * (igstValue / 100);
      const calculatedCessAmount = discountedPrice * (cessValue / 100);
      const calculatedAddlCessAmount = quantityValue * addlCessValue;

      const totalPayableAmount = Number(
        (
          discountedPrice +
          igstAmount +
          calculatedCessAmount +
          calculatedAddlCessAmount
        ).toFixed(2)
      );

      setTotalAmount(totalPayableAmount);
      setDiscountAmount(calculatedDiscountAmount);
      setDiscountPercentage(calculatedDiscountPercentage);
      setTaxExclusivePrice(taxBasePrice);
      setTaxAmount(igstAmount);
      setCessAmount(calculatedCessAmount);
      setAddlCessAmount(calculatedAddlCessAmount);
    } else {
      const taxExclusivePrice = newPriceValue * quantityValue;

      /// Discount calculation
      let calculatedDiscountAmount = 0;
      let calculatedDiscountPercentage = 0;

      if (type === "amount") {
        calculatedDiscountAmount = discountValue; // Given discount value is treated as amount
        calculatedDiscountPercentage =
          Number(
            ((discountValue / taxExclusivePrice) * 100).toFixed(2) // Calculate percentage
          ) || 0;
      } else if (type === "percentage") {
        calculatedDiscountPercentage = discountValue; // Given discount value is treated as percentage
        calculatedDiscountAmount = Number(
          ((discountValue / 100) * taxExclusivePrice).toFixed(2) // Calculate amount
        );
      }

      const discountedPrice = Number(
        (taxExclusivePrice - calculatedDiscountAmount).toFixed(2)
      );

      ////final calculation
      const igstAmount = discountedPrice * (igstValue / 100);
      const calculatedCessAmount = discountedPrice * (cessValue / 100);
      const calculatedAddlCessAmount = quantityValue * addlCessValue;

      const totalPayableAmount = Number(
        (
          discountedPrice +
          igstAmount +
          calculatedCessAmount +
          calculatedAddlCessAmount
        ).toFixed(2)
      );

      setTotalAmount(totalPayableAmount);
      setDiscountAmount(calculatedDiscountAmount);
      setDiscountPercentage(calculatedDiscountPercentage);
      setTaxExclusivePrice(taxExclusivePrice);
      setTaxAmount(igstAmount);
      setCessAmount(calculatedCessAmount);
      setAddlCessAmount(calculatedAddlCessAmount);
    }
  }, [
    newPrice,
    quantity,
    discount,
    type,
    igst,
    cess,
    addlCess,
    isTaxInclusive,
    discountAmount,
    discountPercentage,
  ]);

  const dispatch = useDispatch();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDirectQuantityChange = (value) => {
    if (
      enableActualAndBilledQuantity &&
      actualQuantity &&
      Number(value) > actualQuantity
    ) {
      return;
    }
    if (value.includes(".")) {
      // Split the value into parts before and after the decimal point
      const parts = value.split(".");
      // Check the length of the part after the decimal point
      if (parts[1].length > 3) {
        return;
      }
    }

    setQuantity(value);

    if (!enableActualAndBilledQuantity) {
      setActualQuantity(value);
    }
  };

  const handleActualQuantityChange = (value) => {
    if (value.includes(".")) {
      // Split the value into parts before and after the decimal point
      const parts = value.split(".");
      // Check the length of the part after the decimal point
      if (parts[1].length > 3) {
        return;
      }
    }

    setActualQuantity(value);
    setQuantity(value);
  };

  const changePrice = (price) => {
    setNewPrice(price);
  };

  const submitHandler = () => {
    const newItem = { ...item };

    newItem.total = totalAmount;
    newItem.count = Number(quantity) || 0;
    newItem.isTaxInclusive = isTaxInclusive;
    newItem.discount = discountAmount;
    newItem.discountPercentage = discountPercentage;
    newItem.newGst = igst;
    newItem.discountType = type;
    newItem.actualCount = Number(actualQuantity) || 0;
    newItem.cess = Number(cess) || 0;
    newItem.addl_cess = Number(addlCess) || 0;
    newItem.cessAmount = cessAmount;
    newItem.addlCessAmount = addlCessAmount;

    dispatch(changeIgstAndDiscount(newItem));
    dispatch(addPriceRate({ selectedPriceRate: Number(newPrice), _id: id }));
    handleBackClick();
  };

  return (
    <div className="   ">
      <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2 sticky top-0 z-20 ">
        <IoIosArrowRoundBack
          onClick={handleBackClick}
          className="text-3xl text-white cursor-pointer"
        />
        <p className="text-white text-lg   font-bold ">Edit Item</p>
      </div>
      <div className="min-h-screen bg-gray-100  flex flex-col justify-center ">
        <div className="relative  md:py-4  sm:max-w-xl sm:mx-auto">
          <div className="relative px-4 py-10 bg-white mx-5 md:mx-0 shadow  sm:p-10">
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
                    <label className="leading-loose">New Price</label>
                    <input
                      onChange={(e) => {
                        changePrice(e.target.value);
                      }}
                      value={newPrice}
                      type="number"
                      className=" input-number px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                      placeholder="0"
                    />
                  </div>

                  {isTaxInclusive !== null &&
                    isTaxInclusive !== undefined &&
                    isTaxInclusive && (
                      <div className="flex items-center gap-3 ml-1 ">
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
                    } gap-4 `}
                  >
                    {/* Quantity Input */}
                    <div className="flex flex-row-reverse gap-8 ">
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

                      {/* Billed Quantity (Only shows when enableActualAndBilledQuantity is false) */}
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

                    {/* Unit Input */}
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
                          className="pr-4 pl-10 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                          placeholder=""
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setType("percentage");
                      }}
                      className={` ${
                        type === "percentage"
                          ? "bg-violet-200 border-2 border-violet-500 font-semibold"
                          : ""
                      } p-1 bg-gray-300 md:rounded-xl mt-8 md:px-3 text-sm md:text-md px-2 rounded-lg py-2`}
                    >
                      {" "}
                      Percentage
                    </button>
                    <button
                      onClick={() => {
                        setType("amount");
                      }}
                      className={` ${
                        type === "amount"
                          ? "bg-violet-200 border-2 border-violet-500 font-semibold"
                          : ""
                      } p-1 bg-gray-300 md:rounded-xl mt-8 md:px-3 text-sm md:text-md px-2 rounded-lg py-2`}
                    >
                      Amount
                    </button>
                  </div>

                  <div className="flex flex-col">
                    <label className="leading-loose">Tax Rate</label>
                    <input
                      disabled
                      value={` Tax @ ${igst} %`}
                      type="text"
                      className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                      placeholder="Event title"
                    />
                  </div>

                  <div className="bg-slate-200 p-3 font-semibold flex flex-col gap-2 text-gray-500">
                    <div className="flex justify-between">
                      <p className="text-xs">Tax Exclusive Price</p>
                      <p className="text-xs"> {taxExclusivePrice.toFixed(2)}</p>
                    </div>
                    {type === "amount" ? (
                      <div className="flex justify-between">
                        <p className="text-xs">Discount</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs">{`(${parseFloat(
                            discountPercentage
                          ).toFixed(2)} % ) `}</p>
                          <p className="text-xs">{`₹ ${discountAmount.toFixed(
                            2
                          )}`}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <p className="text-xs">Discount</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs">{`(${discountPercentage}) %`}</p>
                          <p className="text-xs">{`₹ ${discountAmount.toFixed(
                            2
                          )} `}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <p className="text-xs">Tax Rate</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs">{`( ${igst} % )`}</p>
                        <p className="text-xs">{`₹ ${taxAmount.toFixed(2)}`}</p>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <p className="text-xs">Cess</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs">{`( ${cess} % )`}</p>
                        <p className="text-xs">{`₹ ${cessAmount.toFixed(
                          2
                        )}`}</p>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <p className="text-xs">Additional Cess</p>
                      <p className="text-xs">{`₹ ${addlCessAmount.toFixed(
                        2
                      )}`}</p>
                    </div>

                    <div className="flex justify-between font-bold text-black">
                      <p className="text-sm">Total amount</p>
                      <p className="text-xs">{totalAmount.toFixed(2)}</p>
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
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>{" "}
                    Cancel
                  </button>
                  <button
                    onClick={submitHandler}
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
  );
}

export default EditItemSecondary;
