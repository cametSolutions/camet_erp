/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/homePage/Sidebar";
import api from "../../api/api";
import { MdModeEditOutline } from "react-icons/md";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { changeIgstAndDiscount } from "../../../slices/sales";
import { toast } from "react-toastify";
import { Button, Modal } from "flowbite-react";
import { Decimal } from "decimal.js";

function EditItemSales() {
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

  const [openModal, setOpenModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [godown, setGodown] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const ItemsFromRedux = useSelector((state) => state.sales.items);
  const selectedItem = ItemsFromRedux.filter((el) => el._id === id);
  console.log(selectedItem);
  console.log(godown);
  const selectedPriceLevel = useSelector(
    (state) => state.sales.selectedPriceLevel
  );
  const orgId = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );
  useEffect(() => {
    const fetchHsn = async () => {
      try {
        const res = await api.get(`/api/pUsers/fetchHsn/${orgId}`, {
          withCredentials: true,
        });

        setHsn(res.data.data);

        // console.log(res.data.organizationData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchHsn();
  }, [orgId]);

  useEffect(() => {
    if (selectedPriceLevel === "" || selectedPriceLevel === undefined) {
      navigate("/pUsers/addItem");
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
    const taxExclusivePrice = parseFloat(newPrice) * quantity || 0;
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
    const newItem = { ...item };

    newItem.total = totalAmount;
    newItem.count = quantity;
    newItem.newGst = igst;
    newItem.godownList = godown;
    if (type === "amount") {
      newItem.discount = discountAmount;
      newItem.discountPercentage = "";
    } else {
      newItem.discount = "";

      newItem.discountPercentage = parseFloat(discountPercentage);
    }

    console.log(newItem);
    dispatch(changeIgstAndDiscount(newItem));
    // navigate("/pUsers/addItem");
    handleBackClick();
  };

  const handleBackClick = () => {
    console.log(location.state);

    if (location.state.id && location.state.from == "addItemSales") {
      console.log("haii");
      navigate("/pUsers/addItemSales", {
        state: { from: "editSales", id: location.state.id },
      });
    } else if (location.state.from === "sales") {
      console.log("haii");

      navigate("/pUsers/sales");
    } else if (location?.state?.from === "addItemSales") {
      console.log("haii");

      navigate("/pUsers/addItemSales");
    } else if (location?.state?.from === "editSales") {
      console.log("haii");

      navigate(`/pUsers/editSales/${location.state.id}`);
    } else {
      console.log("haii");

      navigate("/pUsers/addItemSales");
    }
  };

  /////////////////////////modal popup /////////////////////////////

  function onCloseModal() {
    setOpenModal(false);
  }

  const openModalHandler = () => {
    console.log(selectedItem);
    if (selectedItem[0]?.GodownList?.length > 0) {
      setOpenModal(true);
      if (godown.length === 0) {
        setGodown(selectedItem[0]?.GodownList);
      }
    }
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

  function truncateToNDecimals(num, n) {
    const parts = num.toString().split(".");
    if (parts.length === 1) return num; // No decimal part
    parts[1] = parts[1].substring(0, n); // Truncate the decimal part
    return parseFloat(parts.join("."));
  }

  function isNumberKey(evt) {
    var charCode = evt.which ? evt.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  // Function to handle incrementing the count
  const incrementCount = (index) => {
    const newGodownItems = godown.map((item) => ({ ...item }));
    let countValue = newGodownItems[index].count
      ? parseFloat(newGodownItems[index].count)
      : 0;

    // Increment the count using Decimal library
    countValue = new Decimal(countValue).add(1).toNumber();

    newGodownItems[index].count = countValue;
    newGodownItems[index].balance_stock -= 1;
    newGodownItems[index].balance_stock = truncateToNDecimals(
      newGodownItems[index].balance_stock,
      3
    );
    setGodown(newGodownItems);
  };

  // Function to handle decrementing the count
  const decrementCount = (index) => {
    const newGodownItems = godown.map((item) => ({ ...item })); // Assuming godown is the correct state variable name
    console.log(newGodownItems);

    if (newGodownItems[index].count > 0) {
      newGodownItems[index].count = new Decimal(newGodownItems[index].count)
        .sub(1)
        .toNumber();
      // newGodownItems[index].count = newGodownItems[index].count.toNumber();
      newGodownItems[index].balance_stock += 1; // Increase balance_stock by 1
      newGodownItems[index].balance_stock = truncateToNDecimals(
        newGodownItems[index].balance_stock,
        3
      );
      setGodown(newGodownItems);
    } else {
      toast("Cannot decrement count as it is already at 0.");
    }
  };

  ///////////////////////////changeModalCount///////////////////////////////////

  const changeModalCount = (event,index, value) => {
    console.log(value);
   
    // Check if the value includes a decimal point
    if (value.includes(".")) {
      // Split the value into parts before and after the decimal point
      const parts = value.split(".");
      // Check the length of the part after the decimal point
      if (parts[1].length > 3) {
        return;
      }
    }

    const newGodownItems = godown.map((item) => ({ ...item }));
    const currentGodown = newGodownItems[index];
    currentGodown.orginalStock =
      currentGodown.orginalStock ??
      Number(currentGodown?.balance_stock) + Number(currentGodown?.count);

    currentGodown.count = value;
    console.log(value);
    console.log(newGodownItems);
    currentGodown.balance_stock = currentGodown.orginalStock - value;
    currentGodown.balance_stock = truncateToNDecimals(
      currentGodown.balance_stock,
      3
    ); // Increase balance_stock by 1
    setGodown(newGodownItems);
  };

  ///////////////////////////changeQnatity///////////////////////////////////

  // const changeQnatity=()=>{

  // }

  ///////////////////////////modalSubmit///////////////////////////////////
  console.log(godown);

  const modalSubmit = () => {
    const total = truncateToNDecimals(
      godown.reduce((acc, curr) => {
        const value = curr.count ? parseFloat(curr.count) : 0;
        return acc + value;
      }, 0),
      3 // Specify the number of decimal places you want
    );

    setQuantity(total);

    setOpenModal(false);
  };

  return (
    <div className="flex ">
      <div>
        <Sidebar />
      </div>
      <div className=" h-screen overflow-y-auto flex-1">
        <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2 sticky top-0 z-20 ">
          <IoIosArrowRoundBack
            // onClick={() => {
            //   navigate("/pUsers/addItem");
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
                        <div className="relative focus-within:text-gray-600 text-gray-400">
                          <input
                            readOnly={selectedItem[0]?.GodownList?.length > 0}
                            onClick={openModalHandler}
                            onChange={(e) => {
                              handleDirectQuantityChange(e.target.value);
                            }}
                            value={quantity}
                            type="number"
                            className=" input-number pr-4 pl-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                            placeholder=""
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

        <Modal
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "transparent transparent",
          }}
          show={openModal}
          size="md"
          onClose={onCloseModal}
          popup
          className="modal-dialog"
        >
          <Modal.Header />
          <Modal.Body>
            <div className="space-y-6">
              {/* Existing sign-in form */}
              <div>
                <div className="flex justify-between  bg-[#579BB1] p-2 rounded-sm items-center">
                  <h3 className=" text-base md:text-xl  font-medium text-gray-900 dark:text-white ">
                    Godown List
                  </h3>

                  <h3 className="font-medium  text-right  text-white ">
                    Total Count:{" "}
                    <span className="text-white font-bold">
                      {truncateToNDecimals(
                        godown.reduce((acc, curr) => {
                          const value = curr.count ? parseFloat(curr.count) : 0;
                          return acc + value;
                        }, 0),
                        3 // Specify the number of decimal places you want
                      )}
                    </span>
                  </h3>
                </div>
                <div className="table-container overflow-y-auto max-h-[250px]">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Godown Name
                        </th>
                        {/* <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Balance Stock
                        </th> */}
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Count
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {godown.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 ">
                            <div className="text-sm text-gray-900">
                              {item.godown}
                            </div>
                            <div className="text-sm text-gray-900 mt-1">
                              Stock :{" "}
                              <span className="text-green-500 font-bold">
                                {item.balance_stock}
                              </span>
                            </div>
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {item.balance_stock}
                            </div>
                          </td> */}
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {item.count}
                            </div>
                          </td> */}
                          <td className=" px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center  ">
                            <div className="flex gap-3 items-center justify-center">
                              <button
                                onClick={() => decrementCount(index)}
                                className="text-indigo-600 hover:text-indigo-900  text-lg"
                              >
                                -
                              </button>
                              {/* {item.count} */}
                              <input
                                className=" input-number p-0 w-12 bg-transparent border-0 text-gray-800 text-center focus:ring-0"
                                type="number"
                                placeholder="0"
                                value={item.count}
                                onChange={(e) => {
                                  changeModalCount(e,index, e.target.value);
                                }}
                                // onKeyDown={isNumberKey}
                              />

                              <div></div>

                              <button
                                onClick={() => incrementCount(index)}
                                className="text-indigo-600 hover:text-indigo-900 text-lg"
                              >
                                +
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="w-full">
                <Button
                  onClick={() => {
                    modalSubmit(godown[0]?._id);
                  }}
                >
                  Submit
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default EditItemSales;
