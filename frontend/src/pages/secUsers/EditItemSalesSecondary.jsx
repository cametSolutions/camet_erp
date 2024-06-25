/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SidebarSec from "../../components/secUsers/SidebarSec";
import api from "../../api/api";
import { MdModeEditOutline } from "react-icons/md";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateItem } from "../../../slices/salesSecondary";

function EditItemSalesSecondary() {
  const [item, setItem] = useState([]);
  const [newPrice, setNewPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  // const [hsn, setHsn] = useState([]);
  const [igst, setIgst] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState("amount");
  const [taxExclusivePrice, setTaxExclusivePrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0); // State for discount amount
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const { id, index } = useParams();
  console.log(index);
  const navigate = useNavigate();
  const location = useLocation();

  const ItemsFromRedux = useSelector((state) => state.salesSecondary.items);
  const selectedItem = ItemsFromRedux.filter((el) => el._id === id);

  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const selectedGodown = selectedItem[0]?.GodownList[index];

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
    // if (selectedPriceLevel === "" || selectedPriceLevel === undefined) {
    //   navigate("/sUsers/addItemSales");
    // } else {
    setItem(selectedItem[0]);
    // const price = selectedItem[0].Priceleveles.find(
    //   (item) => item.pricelevel === selectedPriceLevel
    // )?.pricerate;

    if (selectedItem[0]?.hasGodownOrBatch) {
      setNewPrice(selectedGodown?.selectedPriceRate || 0);

      console.log("haii");
      setQuantity(selectedGodown?.count || 1);
      if (selectedGodown?.discountPercentage > 0) {
        setDiscount(selectedGodown?.discountPercentage);
        setType("percentage");
      } else if (selectedGodown?.discount > 0) {
        setDiscount(selectedGodown?.discount);
        setType("amount");
      } else if (
        selectedGodown?.discountPercentage == 0 &&
        selectedGodown?.discount == 0
      ) {
        setDiscount("");
      }
    } else {
      setNewPrice(selectedItem[0]?.GodownList[0]?.selectedPriceRate || 0);

      setQuantity(selectedItem[0]?.count || 1);
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
    setUnit(selectedItem[0]?.unit);
    setIgst(selectedItem[0]?.igst);
    // }
  }, []);

  useEffect(() => {
    const taxExclusivePrice = parseFloat(newPrice) * Number(quantity) || 0;
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
  }, [selectedItem, quantity, discount]);

  const dispatch = useDispatch();

  const submitHandler = () => {
    console.log(item);
    const newItem = structuredClone(item);

    console.log(newPrice); // Deep copy to avoid mutation

    if (selectedItem[0]?.hasGodownOrBatch) {
      console.log("haii");
      const newGodownList = newItem.GodownList.map((godown, idx) => {
        if (idx == index) {
          console.log(godown);
          return {
            ...godown,
            count: Number(quantity) || 0,
            selectedPriceRate: Number(newPrice) || 0,
            discount: type === "amount" ? discountAmount : "",
            discountPercentage:
              type === "amount" ? "" : parseFloat(discountPercentage),
            individualTotal: Number(totalAmount.toFixed(2)),
          };
        } else {
          return godown;
        }
      });

      console.log(newGodownList);

      newItem.GodownList = newGodownList;
      newItem.count = Number(
        newGodownList
          ?.reduce((acc, curr) => (acc += curr?.count || 0), 0)
          .toFixed(2)
      );

      newItem.count = Number(
        newGodownList?.reduce((acc, curr) => {
          if (curr.added === true) {
            return acc + curr.count;
          } else {
            return acc;
          }
        },0)
      );
      newItem.total = Number(
        newGodownList
          .reduce((acc, curr) => acc + (curr?.added?curr.individualTotal:0 || 0), 0)
          .toFixed(2)
      );
      console.log(newItem.total);
      console.log(newItem);
    } else {
      // newItem.total = Number(totalAmount.toFixed(2));
      newItem.GodownList[0].individualTotal = Number(totalAmount.toFixed(2));
      newItem.total = Number(totalAmount.toFixed(2));
      newItem.count = quantity || 0;
      const godownList = [...newItem.GodownList];
      console.log(godownList);
      godownList[0].selectedPriceRate = Number(newPrice) || 0;

      newItem.GodownList = godownList;
      newItem.newGst = igst;
      if (type === "amount") {
        newItem.discount = discountAmount;
        newItem.discountPercentage = "";
      } else {
        newItem.discount = "";
        newItem.discountPercentage = parseFloat(discountPercentage);
      }
    }

    console.log(newItem);

    dispatch(updateItem(newItem));
    navigate(-1);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDirectQuantityChange = (value) => {
    if (value.includes(".")) {
      // Split the value into parts before and after the decimal point
      const parts = value.split(".");
      // Check the length of the part after the decimal point
      if (parts[1].length > 3) {
        return;
      }
    }

    setQuantity(value);
  };

  return (
    <div className="flex ">
      <div>
        <SidebarSec />
      </div>
      <div className=" h-screen overflow-y-auto flex-1">
        <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2 sticky top-0 z-20 ">
          <IoIosArrowRoundBack
            // onClick={() => {
            //   navigate("/sUsers/addItem");
            // }}
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
                      <label className="leading-loose">Price</label>
                      <input
                        onChange={(e) => {
                          setNewPrice(e.target.value);
                        }}
                        // disabled
                        value={newPrice}
                        type="number"
                        className=" input-number px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                        placeholder="0"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <label className="leading-loose">Quantity</label>
                        <div className="relative focus-within:text-gray-600 text-gray-400">
                          <input
                            // readOnly={selectedItem[0]?.GodownList?.length > 0 && godownName=="nil"}
                            // onClick={openModalHandler}
                            onChange={(e) => {
                              handleDirectQuantityChange(e.target.value);
                            }}
                            value={quantity}
                            type="number"
                            className=" input-number pr-4 pl-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
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
                          <p className="text-xs">{`₹ ${(
                            ((taxExclusivePrice - discountAmount) *
                              parseFloat(igst)) /
                            100
                          ).toFixed(2)}`}</p>
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

export default EditItemSalesSecondary;
