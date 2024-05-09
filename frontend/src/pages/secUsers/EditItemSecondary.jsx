/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { MdModeEditOutline } from "react-icons/md";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { changeIgstAndDiscount } from "../../../slices/invoiceSecondary";
import SidebarSec from "../../components/secUsers/SidebarSec";

function EditItemSecondary() {
  const [item, setItem] = useState([]);
  const [newPrice, setNewPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [hsn, setHsn] = useState([]);
  const [igst, setIgst] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState("amount");
  const [taxExclusivePrice, setTaxExclusivePrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0); // State for discount amount
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();


  const ItemsFromRedux = useSelector((state) => state.invoiceSecondary.items);
  const selectedItem = ItemsFromRedux.filter((el) => el._id === id);
  console.log(selectedItem);
  const selectedPriceLevel = useSelector(
    (state) => state.invoiceSecondary.selectedPriceLevel
  );
  console.log(selectedPriceLevel);
  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  // useEffect(() => {
  //   const fetchHsn = async () => {
  //     try {
  //       const res = await api.get(`/api/sUsers/fetchHsn/${orgId}`, {
  //         withCredentials: true,
  //       });

  //       setHsn(res.data.data);

  //       // console.log(res.data.organizationData);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   fetchHsn();
  // }, [orgId]);

  useEffect(() => {
    if (selectedPriceLevel === "" || selectedPriceLevel === undefined) {
      navigate("/sUsers/addItem");
    } else {
      setItem(selectedItem[0]);
      const price = selectedItem[0].Priceleveles.find(
        (item) => item.pricelevel === selectedPriceLevel
      )?.pricerate;

      setNewPrice(price);
      setQuantity(selectedItem[0]?.count || 1);
      setUnit(selectedItem[0]?.unit);
      setIgst(selectedItem[0]?.igst);

      if (selectedItem[0].discountPercentage > 0) {
        setDiscount(selectedItem[0].discountPercentage);
        setType("percentage");
      } else if (selectedItem[0].discount > 0) {
        setDiscount(selectedItem[0].discount);
        setType("amount");
      } else if (
        selectedItem[0].discountPercentage == 0 &&
        selectedItem[0].discount == 0
      ) {
        setDiscount("");
      }
    }
  }, []);

  useEffect(() => {
    console.log(parseFloat(newPrice));
    const taxExclusivePrice = parseFloat(newPrice) *quantity || 0;
    console.log(taxExclusivePrice);
    setTaxExclusivePrice(taxExclusivePrice);
    // Calculate the discount amount and percentage
    let calculatedDiscountAmount = 0;
    let calculatedDiscountPercentage = 0;

    if (discount !== "") {
      if (type === "amount") {
        calculatedDiscountAmount = parseFloat(discount);
        calculatedDiscountPercentage =
          (parseFloat(discount) / taxExclusivePrice) * 100;
      } else if (type === "percentage") {
        calculatedDiscountPercentage = parseFloat(discount).toFixed(2);
        calculatedDiscountAmount =
          (parseFloat(discount) / 100) * taxExclusivePrice;
      }
    }

    setDiscountAmount(calculatedDiscountAmount);
    setDiscountPercentage(calculatedDiscountPercentage);

    // Calculate the total amount
    let totalAmount = taxExclusivePrice - calculatedDiscountAmount;

    // Apply tax if present
    if (igst !== "") {
      const taxAmount = (parseFloat(igst) / 100) * totalAmount;
      totalAmount += taxAmount;
    }

    setTotalAmount(totalAmount);
  }, [selectedItem, selectedPriceLevel, quantity, discount, type, igst]);

  const dispatch = useDispatch();

  const submitHandler = () => {
    console.log(item);
    const newItem = { ...item };

    newItem.total = totalAmount;
    newItem.count = Number(quantity) ||0;

    newItem.newGst = igst;
    if (type === "amount") {
      newItem.discount = discountAmount;
      newItem.discountPercentage = "";
    } else {
      newItem.discount = "";

      newItem.discountPercentage = parseFloat(discountPercentage);
    }

    console.log(newItem);
    dispatch(changeIgstAndDiscount(newItem));
    navigate("/sUsers/addItem");
    handleBackClick()
  };

  const handleBackClick = () => {
    console.log(location.state);

    if (location?.state?.id && location?.state?.from =="addItem") {
      console.log("haii");
      navigate("/sUsers/addItem", {
        state: { from: "editInvoice", id: location.state.id },
      });
    } else if (location.state.from === "invoice") {
      console.log("haii");

      navigate("/sUsers/invoice");
    } else if (location?.state?.from === "addItem") {
      console.log("haii");

      navigate("/sUsers/addItem");
    } else if (location?.state?.from === "editInvoice") {
      console.log("haii");

      navigate(`/sUsers/editInvoice/${location.state.id}`);
    } else {
      console.log("haii");

      navigate("/sUsers/addItem");
    }
  };


  const changeQuantity = (quantity) => {
    // Check if the quantity includes a dot (decimal point)
    if (quantity.includes(".")) {
      // Split the quantity into parts before and after the decimal point
      const parts = quantity.split('.');
      // Check the length of the part after the decimal point
      if (parts[1].length > 3) {
        // Display a toast notification if the length exceeds two characters
        // toast('You cannot enter more than two decimal places.');
        return; // Prevent further execution
      }
      // If the length is valid, update the state with the formatted value
      setQuantity(quantity);
    } else {
      // If there's no decimal point, just update the state with the current value
      setQuantity(quantity);
    }
  };



  

  return (
    <div className="flex ">
      <div>
        <SidebarSec />
      </div>
      <div className=" h-screen overflow-y-auto flex-1">
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
                      <label className="leading-loose">
                        New Price (With Tax)
                      </label>
                      <input
                        disabled
                        value={newPrice || 0}
                        type="text"
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                        placeholder="Price"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <label className="leading-loose">Quantity</label>
                        <div className=" relative focus-within:text-gray-600 text-gray-400">
                          <input
                            // onChange={(e) => setQuantity(e.target.value)}
                            onChange={(e)=>{changeQuantity(e.target.value)}}

                            value={quantity }
                            type="number"
                            className="input-number  pr-4 pl-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                            placeholder="0"
                          />
                          <div className="absolute left-3 top-2"></div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className="leading-loose">Unit</label>
                        <div className="relative focus-within:text-gray-600 text-gray-400">
                          <input
                            value={unit}
                            disabled
                            type="text"
                            className="pr-4 pl-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                          />
                          <div className="absolute left-3 top-2"></div>
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
                        value={` GST @ ${igst} %`}
                        type="text"
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                        placeholder="Event title"
                      />
                    </div>

                    <div className="bg-slate-200 p-3 font-semibold flex flex-col gap-2 text-gray-500">
                      <div className="flex justify-between">
                        <p className="text-xs">Tax Exclusive Price * Qty</p>
                        <p className="text-xs">
                          {" "}
                          {taxExclusivePrice.toFixed(2)}
                        </p>
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
                          <p className="text-xs">{`₹ ${
                            (((taxExclusivePrice - discountAmount) *
                              parseFloat(igst)) /
                            (100)).toFixed(2)
                          } `}</p>
                        </div>
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
    </div>
  );
}

export default EditItemSecondary;
