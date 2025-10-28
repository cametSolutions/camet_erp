import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "@/api/api";
import { useNavigate } from "react-router-dom";
import TitleDiv from "@/components/common/TitleDiv";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  handlePrintInvoice,
  handleDownloadPDF,
} from "../PrintSide/generateHotelInvoicePDF ";

export default function SattvaInvoice() {
  // Router and Redux state
  const location = useLocation();
  const navigate = useNavigate();
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );
  const secondaryUser = JSON.parse(localStorage.getItem("sUserData"));

  console.log(organization?.configurations[0]?.bank);
  // Props from location state
  const selectedCheckOut = location.state?.selectedCheckOut;
  const selectedCustomerId = location.state?.customerId;
  const isForPreview = location.state?.isForPreview;

  console.log(selectedCheckOut);
  // const isForPreview = location.state?.isForPreview;

  // Component state
  const [outStanding, setOutStanding] = useState([]);
  const [kotData, setKotData] = useState([]);
  const [selectedCustomerData, setSelectedCustomerData] = useState({});
  const [selectedCheckOutData, setSelectedCheckOutData] = useState({});
  const [dateWiseDisplayedData, setDateWiseDisplayedData] = useState([]);
  const [taxAmountForRoom, setTaxAmountForRoom] = useState(0);
  const [taxAmountForFood, setTaxAmountForFood] = useState(0);
  const [taxAmountForAdditionalPax, setTaxAmountForAdditionalPax] = useState(0);
  const [foodPlanAmount, setFoodPlanAmount] = useState(0);
  const [additionalPaxAmount, setAdditionalPaxAmount] = useState(0);
  const [showSplitPopUp, setShowSplitPopUp] = useState(false);
  const printReference = useRef(null);
  const [selected, setSelected] = useState(0);

  // Utility function to transform checkout data
  const transformCheckOutData = (selectedCheckOut) => {
    let result = [];

    selectedCheckOut.forEach((item) => {
      item.selectedRooms.forEach((room) => {
        const stayDays = room.stayDays || 1;

        
        const perDayAmount = room.baseAmountWithTax / stayDays;
        const baseAmount = room.baseAmount / stayDays;
        const taxAmount = room.taxAmount / stayDays;
        const foodPlanAmountWithTax = room.foodPlanAmountWithTax / stayDays;
        const foodPlanAmountWithOutTax =
          room.foodPlanAmountWithOutTax / stayDays;

        const additionalPaxDataWithTax =
          room.additionalPaxAmountWithTax / stayDays;
        const additionalPaxDataWithOutTax =
          room.additionalPaxAmountWithOutTax / stayDays;

        // Calculate date range
        const startDate = new Date(item.arrivalDate);
        const endDate = new Date(item.checkOutDate);

        // Create entry for each day
        for (
          let d = new Date(startDate);
          d < endDate;
          d.setDate(d.getDate() + 1)
        ) {
          const formattedDate = d
            .toLocaleDateString("en-GB")
            .replace(/\//g, "-");

          result.push({
            date: formattedDate,
            baseAmountWithTax: perDayAmount,
            baseAmount: baseAmount,
            taxAmount,
            voucherNumber: item.voucherNumber,
            roomName: room.roomName,
            hsn: room?.hsnDetails?.hsn,
            customerName: item.customerId?.partyName,
            foodPlanAmountWithTax,
            foodPlanAmountWithOutTax,
            additionalPaxDataWithTax,
            additionalPaxDataWithOutTax,
          });
        }
      });
    });

    return result;
  };

  // API call to fetch debit data
  const fetchDebitData = async (data) => {
    // let updatedData = data?.map((item) => ({ ...item, checkInId: item.checkInId._id,bookingId }));
    // console.log(updatedData);
    try {
      const res = await api.post(
        `/api/sUsers/fetchOutStandingAndFoodData`,
        { data: data, isForPreview: isForPreview },
        { withCredentials: true }
      );
      console.log(res);

      if (res.data.success) {
        setOutStanding(res.data.data);
        setKotData(res.data.kotData);
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Error fetching debit data:", error);
    }
  };

  // Utility function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Calculate totals
  const calculateTotals = () => {
    const roomTariffTotal = dateWiseDisplayedData.reduce(
      (total, order) => total + order.baseAmount,
      0
    );

    let taxData = dateWiseDisplayedData.reduce(
      (total, order) =>
        total +
        (order.taxAmount +
          (order?.foodPlanAmountWithTax - order?.foodPlanAmountWithOutTax)),
      0
    );

    const planAmount = dateWiseDisplayedData.reduce(
      (total, order) => total + order?.foodPlanAmountWithOutTax,
      0
    );

    const additionalPaxAmount = dateWiseDisplayedData.reduce(
      (total, order) => total + order?.additionalPaxDataWithOutTax,
      0
    );

    const totalAmountIncludeAllTax =
      taxData + planAmount + additionalPaxAmount + roomTariffTotal;

    const advanceTotal =
      outStanding?.reduce(
        (total, transaction) => total + transaction?.bill_amount,
        0
      ) || 0;
    console.log(advanceTotal);

    const kotTotal =
      kotData?.reduce((total, kot) => total + kot?.finalAmount, 0) || 0;
    const taxableAmount = roomTariffTotal + additionalPaxAmount;
    // const taxRate = taxableAmount / tax
    console.log(dateWiseDisplayedData);
    const taxAmount = dateWiseDisplayedData.reduce(
      (total, order) => total + order.taxAmount,
      0
    );
    const taxRate = (taxAmount / taxableAmount) * 100;
    const taxAmountFoodPlan = dateWiseDisplayedData.reduce(
      (total, order) =>
        total +
        (order?.foodPlanAmountWithTax - order?.foodPlanAmountWithOutTax),
      0
    );

    const taxRateFoodPlan = (taxAmountFoodPlan / planAmount) * 100;

    const sumOfRestaurantAndRoom = totalAmountIncludeAllTax + kotTotal;
    const balanceAmount = totalAmountIncludeAllTax - advanceTotal;
    const totalTaxAmount = (taxAmountForFood + taxAmountForRoom) * 2; // CGST + SGST
    const balanceAmountToPay = sumOfRestaurantAndRoom - advanceTotal;

    return {
      roomTariffTotal,
      advanceTotal,
      kotTotal,
      balanceAmount,
      totalTaxAmount,
      balanceAmountToPay,
      taxData,
      totalAmountIncludeAllTax,
      sumOfRestaurantAndRoom,
      taxableAmount,
      taxRate,
      taxRateFoodPlan,
      taxAmount,
      taxAmountFoodPlan,
      planAmount,
    };
  };


  // Main effect to process checkout data
  useEffect(() => {
    if (selectedCustomerId && selectedCheckOut?.length > 0) {
      // Find customer data
      const findCustomerFullData = selectedCheckOut.find(
        (item) => item.customerId?._id === selectedCustomerId
      );

      if (findCustomerFullData) {
        setSelectedCustomerData(findCustomerFullData.customerId);
        setSelectedCheckOutData(findCustomerFullData);

        // Transform and calculate data
        const selectedCheckOutData = transformCheckOutData(selectedCheckOut);
        setDateWiseDisplayedData(selectedCheckOutData);

        // Calculate tax amounts
        const taxAmountBasedOnRoom = selectedCheckOutData.reduce(
          (acc, item) => acc + Number(item.taxAmount),
          0
        );
        setTaxAmountForRoom(taxAmountBasedOnRoom);
        console.log([selectedCheckOutData]);
        const foodPlanAmountWithOutTax = selectedCheckOutData.reduce(
          (acc, item) => acc + Number(item.foodPlanAmountWithOutTax),
          0
        );
        const paxAmount = selectedCheckOutData.reduce(
          (acc, item) => acc + Number(item.additionalPaxDataWithOutTax),
          0
        );
        setFoodPlanAmount(foodPlanAmountWithOutTax);
        setAdditionalPaxAmount(paxAmount);
        console.log(selectedCheckOut[0]);

        const foodPlanTaxAmount = selectedCheckOutData.reduce(
          (acc, item) =>
            acc +
            Number(item.foodPlanAmountWithOutTax || 0) -
            Number(item.taxAmountForFoodPlan || 0),
          0
        );
        const additionalPlanTaxAmount = selectedCheckOutData.reduce(
          (acc, item) =>
            acc +
            Number(item.paxA || 0) -
            Number(item.taxAmountForFoodPlan || 0),
          0
        );

        setTaxAmountForFood(foodPlanTaxAmount - foodPlanAmountWithOutTax);
        setTaxAmountForAdditionalPax(additionalPlanTaxAmount - paxAmount);
      }
    }
  }, [selectedCustomerId, selectedCheckOut, selected]);

  // Effect to fetch debit data
  useEffect(() => {
    if (selectedCheckOut?.length > 0) {
      fetchDebitData(selectedCheckOut);
    }
  }, [selectedCheckOut, selected]);

  const totals = calculateTotals();
  // console.log(sale);

  const handleSplitPayment = () => {
    setShowSplitPopUp(true);
  };
  const handleChange = (value) => {
    setSelected(value);
  };
  console.log(selected);
  const handleSplit = () => {
    setShowSplitPopUp(false);
    console.log(selected);
    if (selected === "room") {
      setKotData([]);
    } else if (selected === "restaurant") {
      setOutStanding([]);
      setDateWiseDisplayedData([]);
      setTaxAmountForAdditionalPax(0);
      setTaxAmountForFood(0);
      setTaxAmountForRoom(0);
      setFoodPlanAmount(0);
      setAdditionalPaxAmount(0);
    }
  };
  // Updated handlePrint function in your React component
  const handlePrint = (isPrint) => {
    // Calculate totals first
    const totals = calculateTotals();

    // Prepare comprehensive invoice data with all dynamic values
    const invoiceData = {
      // Organization details (dynamic)
      organization: {
        name: organization?.name || "",
        address: organization?.address || "",
        flat: organization?.flat || "",
        landmark: organization?.landmark || "",
        road: organization?.road || "",
        gstNum: organization?.gstNum || "",
        email: organization?.email || "",
        logo: organization?.logo || "",
        state: organization?.state || "",
        pin: organization?.pin || "",
        mobile: organization?.mobile || "",
        configurations: organization?.configurations || [],
      },

      // Checkout data (dynamic)
      selectedCheckOutData: selectedCheckOutData,

      // Customer and booking info (dynamic)
      customerName: selectedCheckOutData?.customerName || "",
      totalPax:
        selectedCheckOutData?.selectedRooms?.reduce(
          (acc, curr) => acc + Number(curr.pax || 0),
          0
        ) || 0,

      // Transaction data (dynamic)
      outStanding: outStanding || [],
      kotData: kotData || [],
      dateWiseDisplayedData: dateWiseDisplayedData || [],

      // Calculated amounts (dynamic)
      totals: {
        roomTariffTotal: totals.roomTariffTotal,
        advanceTotal: totals.advanceTotal,
        kotTotal: totals.kotTotal,
        balanceAmount: totals.balanceAmount,
        totalTaxAmount: totals.totalTaxAmount,
        balanceAmountToPay: totals.balanceAmountToPay,
        taxData: totals.taxData,
        totalAmountIncludeAllTax: totals.totalAmountIncludeAllTax,
        sumOfRestaurantAndRoom: totals.sumOfRestaurantAndRoom,
        taxableAmount: totals.taxableAmount,
        taxRate: totals.taxRate,
        taxRateFoodPlan: totals.taxRateFoodPlan,
        taxAmount: totals.taxAmount,
        taxAmountFoodPlan: totals.taxAmountFoodPlan,
        planAmount: totals.planAmount,
      },

      // Tax amounts (dynamic)
      taxAmountForRoom: taxAmountForRoom,
      taxAmountForFood: taxAmountForFood,
      taxAmountForAdditionalPax: taxAmountForAdditionalPax,

      // Food and additional charges (dynamic)
      foodPlanAmount: foodPlanAmount,
      additionalPaxAmount: additionalPaxAmount,

      // User info (dynamic)
      secondaryUser: secondaryUser,

      // Additional data for comprehensive invoice
      voucherNumber: selectedCheckOutData?.voucherNumber || "",
      arrivalDate: selectedCheckOutData?.arrivalDate || "",
      arrivalTime: selectedCheckOutData?.arrivalTime || "",
      roomNumbers:
        selectedCheckOutData?.selectedRooms
          ?.map((room) => room.roomName)
          .join(", ") || "",
      roomType: selectedCheckOutData?.selectedRooms?.[0]?.roomType?.brand || "",
      tariff: selectedCheckOutData?.selectedRooms?.[0]?.priceLevelRate || "",
      agentName: selectedCheckOutData?.agentId?.name || "Walk-In Customer",
      foodPlan: selectedCheckOutData?.foodPlan?.[0]?.foodPlan || "",
    };

    console.log("Complete Invoice Data:", invoiceData); // For debugging

    // Call the PDF generation function with all dynamic data
    if (!isPrint) {
      handleDownloadPDF(invoiceData);
    } else {
      handlePrintInvoice(invoiceData);
    }
  };

  return (
    <>
      <TitleDiv title="Check out print" dropdownContents={[]} />
      {showSplitPopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Select Option
            </h2>

            {/* Default Print */}
            <div className="flex items-center mb-3">
              <input
                id="opt-default"
                type="radio"
                name="split-option"
                value="default"
                checked={selected === "default"}
                onChange={() => handleChange("default")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-full focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="opt-default"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Default Print
              </label>
            </div>

            {/* Room Based */}
            <div className="flex items-center mb-3">
              <input
                id="opt-room"
                type="radio"
                name="split-option"
                value="room"
                checked={selected === "room"}
                onChange={() => handleChange("room")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-full focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="opt-room"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Room based
              </label>
            </div>

            {/* Restaurant Based */}
            <div className="flex items-center mb-5">
              <input
                id="opt-restaurant"
                type="radio"
                name="split-option"
                value="restaurant"
                checked={selected === "restaurant"}
                onChange={() => handleChange("restaurant")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-full focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="opt-restaurant"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Restaurant based
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSplitPopUp(false)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSplit}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                disabled={!selected}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gray-50 p-4 " ref={printReference}>
        <div className="max-w-4xl mx-auto bg-white border-2 border-black p-2 text-sm">
          {/* Header Section */}
          <div className="flex items-center justify-between border-black pb-4">
            {/* Logo */}
            <div className="w-24 h-24 flex-shrink-0">
              <img
                src={organization?.logo}
                alt="Sattva Logo"
                className="object-contain h-full w-full"
              />
            </div>

            {/* Organization Details */}
            <div className="text-right flex-1 ml-4">
              <div className="text-xl font-bold mb-2 uppercase">
                {organization?.name}
              </div>
              <div className="mb-2 uppercase">
                {[organization?.flat, organization?.landmark]
                  .filter(Boolean)
                  .join(", ")}
              </div>
              <div className="text-xs mb-1">
                {organization?.road && `${organization.road}`}
              </div>
              <div className="text-xs mb-1">
                {organization?.gstNum && `GSTIN: ${organization.gstNum}`}
              </div>
              <div className="text-xs mb-1">
                {organization?.state && `State Name: ${organization.state}`}
                {organization?.pin && `, Pin: ${organization.pin}`}
              </div>
              <div className="text-xs">
                {organization?.email && `E-Mail: ${organization.email}`}
              </div>
            </div>
          </div>

          {/* Invoice Details Grid */}
          <div className="grid grid-cols-3 p-2 text-xs border border-black">
            <div className="space-y-1">
              <div className="flex">
                <span className="w-20 font-bold">GRC No:</span>
                <span>{selectedCheckOutData?.voucherNumber}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-bold">Pax:</span>
                <span>
                  {selectedCheckOutData?.selectedRooms?.reduce(
                    (acc, curr) => acc + Number(curr.pax || 0),
                    0
                  )}
                </span>
              </div>
              <div className="flex">
                <span className="w-20 font-bold">Guest:</span>
                <span>{selectedCheckOutData?.customerName}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-bold">Agent:</span>
                <span>
                  {selectedCheckOutData?.agentId?.name || "Walk-In Customer"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex">
                <span className="w-20 font-bold">Bill No:</span>
                <span>{selectedCheckOutData?.voucherNumber}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-bold">Arrival:</span>
                <span>
                  {selectedCheckOutData?.arrivalDate} /{" "}
                  {selectedCheckOutData?.arrivalTime}
                </span>
              </div>
              {selectedCheckOutData?.selectedRooms &&
                selectedCheckOutData?.selectedRooms?.length == 1 && (
                  <div className="flex">
                    <span className="w-20 font-bold">Room No:</span>
                    <span>
                      {selectedCheckOutData?.selectedRooms[0]?.roomName}
                    </span>
                  </div>
                )}

              {selectedCheckOutData?.foodPlan &&
                selectedCheckOutData?.foodPlan?.length > 0 && (
                  <div className="flex">
                    <span className="w-20 font-bold">Plan:</span>
                    <span>{selectedCheckOutData?.foodPlan[0]?.foodPlan}</span>
                  </div>
                )}
            </div>

            <div className="space-y-1">
              <div className="flex">
                <span className="w-20 font-bold">Bill Date:</span>
                <span>{formatDate(new Date())}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-bold">Departure:</span>
                <span>
                  {formatDate(new Date())} / {new Date().toLocaleTimeString()}
                </span>
              </div>
              {selectedCheckOutData?.selectedRooms &&
                selectedCheckOutData?.selectedRooms?.length > 0 && (
                  <div className="flex">
                    <span className="w-20 font-bold">Room Type:</span>
                    <span>
                      {selectedCheckOutData?.selectedRooms[0]?.roomType?.brand}
                    </span>
                  </div>
                )}

              {selectedCheckOutData?.selectedRooms &&
                selectedCheckOutData?.selectedRooms?.length > 0 && (
                  <div className="flex">
                    <span className="w-20 font-bold">Thariff:</span>
                    <span>
                      {selectedCheckOutData?.selectedRooms[0]?.priceLevelRate}
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Main Transaction Table */}
          <div className="mb-3">
            <table className="w-full border border-black">
              <thead>
                <tr className="bg-gray-100 text-xs">
                  <th className="border border-black p-2 text-center font-bold">
                    DATE
                  </th>
                  <th className="border border-black p-2 text-center font-bold">
                    VOUCHER
                  </th>
                  <th className="border border-black p-2 text-center font-bold">
                    DESCRIPTION
                  </th>
                  <th className="border border-black p-2 text-center font-bold">
                    HSN
                  </th>
                  <th className="border border-black p-2 text-center font-bold">
                    DEBIT
                  </th>
                  <th className="border border-black p-2 text-center font-bold">
                    CREDIT
                  </th>
                  <th className="border border-black p-2 text-center font-bold">
                    AMOUNT
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Outstanding Transactions */}
                {outStanding?.map((transaction, index) => (
                  <tr key={`outstanding-${index}`}>
                    <td className="border-r border-black p-1">
                      {formatDate(transaction?.bill_date)}
                    </td>
                    <td className="border-r border-black p-1">
                      {transaction?.bill_no}
                    </td>
                    <td className="border-r border-black p-1">Advance</td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1 text-right"></td>
                    <td className="border-r border-black p-1 text-right">
                      {transaction?.bill_amount?.toFixed(2)}
                    </td>
                    <td className="border-r border-black p-1 text-right"></td>
                  </tr>
                ))}
                {dateWiseDisplayedData?.length > 0 && (
                  <>
                    {/* Room Tariff Entries */}
                    {dateWiseDisplayedData?.map((order, index) => (
                      <tr key={`room-${index}`}>
                        <td className="border-r border-black p-1">
                          {order?.date}
                        </td>
                        <td className="border-r border-black p-1">
                          {order?.voucherNumber}
                        </td>
                        <td className="border-r border-black p-1">
                          Room Tariff [{order?.roomName} - {order?.customerName}
                          ]
                        </td>
                        <td className="border-r border-black p-1">
                          {order?.hsn}
                        </td>
                        <td className="border-r border-black p-1 text-right">
                          {order?.baseAmount?.toFixed(2)}
                        </td>
                        <td className="border-r border-black p-1 text-right"></td>
                        <td className="border-r border-black p-1 text-right"></td>
                      </tr>
                    ))}

                    {/* Room Tariff Summary */}
                    <tr className="bg-gray-100 ">
                      <td
                        colSpan="3"
                        className="text-right p-2 border-r border-black"
                      >
                        Room Tariff Assessable Value
                      </td>

                      <td className="p-2 border-l border-black text-right"></td>
                      <td className="p-1 border-l border-black text-right">
                        {totals.roomTariffTotal.toFixed(2)}
                      </td>
                      <td
                        // colSpan="2"
                        className="p-2 border-l border-black text-right"
                      ></td>
                      <td
                        // colSpan="2"
                        className="p-2 border-l border-black text-right"
                      ></td>
                    </tr>

                    {/* Food Plan */}
                    {foodPlanAmount > 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="text-right p-2 border-r border-black"
                        >
                          Food Plan Sales
                        </td>
                        <td className="p-2 border-l border-black text-right"></td>
                        <td className="p-2 text-right border-l border-black">
                          {foodPlanAmount.toFixed(2)}
                        </td>
                        <td className="p-2 border-l border-black text-right"></td>
                        <td className="p-2 border-l border-black text-right"></td>
                      </tr>
                    )}
                    {additionalPaxAmount > 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="text-right p-2 border-r border-black"
                        >
                          Additional Pax Amount
                        </td>
                        <td className="p-2 border-l border-black text-right"></td>
                        <td className="p-2 text-right border-l border-black">
                          {additionalPaxAmount.toFixed(2)}
                        </td>
                        <td className="p-2 border-l border-black text-right"></td>
                        <td className="p-2 border-l border-black text-right"></td>
                      </tr>
                    )}

                    {/* Tax Entries */}
                    <tr>
                      <td
                        colSpan="3"
                        className="text-right p-2 border-r border-black"
                      >
                        CGST
                      </td>
                      <td className="p-2 border-l border-black text-right"></td>
                      <td className="p-2 text-right border-l border-black">
                        {(totals?.taxData / 2).toFixed(2) || 0}
                      </td>
                      <td className="p-2 border-l border-black text-right"></td>
                      <td className="p-2 border-l border-black text-right"></td>
                    </tr>
                    <tr>
                      <td
                        colSpan="3"
                        className="text-right p-2 border-r border-b border-black"
                      >
                        SGST
                      </td>
                      <td className="p-2 border-l border-b border-black text-right"></td>
                      <td className="border-b border-l border-black p-2 text-right">
                        {(totals?.taxData / 2).toFixed(2) || 0}
                      </td>
                      <td className="p-2 border-l border-b border-black text-right"></td>
                      <td className="p-2 border-l border-b border-black text-right"></td>
                    </tr>
                    {/* Balance Summary */}
                    <tr>
                      <td colSpan="2" className="text-right p-2">
                        <span>ROOM NO : </span>
                        {selectedCheckOutData?.selectedRooms
                          ?.map((room) => room.roomName)
                          .join(", ")}
                      </td>
                      <td colSpan="3" className="text-right p-2">
                        {totals.totalAmountIncludeAllTax.toFixed(2)}
                      </td>
                      <td className="border-b text-right p-2">
                        {totals.advanceTotal.toFixed(2)}
                      </td>
                      <td className="border-b text-right p-2">
                        {totals.balanceAmount.toFixed(2)}
                      </td>
                    </tr>
                    {/* Room Service Section */}
                    <tr className="bg-green-50 border-black">
                      <td
                        colSpan="7"
                        className="border-b-2 p-2 font-bold text-center"
                      >
                        RESTAURANT BILL DETAILS
                      </td>
                    </tr>
                  </>
                )}

                {kotData?.map((kot, index) => (
                  <tr key={`kot-${index}`}>
                    <td className="border-r border-black p-1">
                      {formatDate(kot?.createdAt)}
                    </td>
                    <td className="border-r border-black p-1">
                      {kot?.salesNumber}
                    </td>
                    <td className="border-r border-black p-1">
                      POS [Restaurant]
                    </td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1 text-right">
                      {kot?.finalAmount?.toFixed(2)}
                    </td>
                    <td className="border-r border-black p-1 text-right"></td>
                    <td className="border-r border-black p-1 text-right"></td>
                  </tr>
                ))}

                {/* Final Totals */}
                <tr className="bg-gray-100 font-bold">
                  <td colSpan="4" className="border border-black p-2">
                    Total
                  </td>
                  <td className="border border-black p-2 text-right">
                    {totals.kotTotal.toFixed(2)}
                  </td>
                  <td className="border border-black p-2 text-right">
                    {/* {totals.advanceTotal.toFixed(2)} */}
                  </td>
                  <td className="border border-black p-2 text-right">
                    {totals.sumOfRestaurantAndRoom.toFixed(2)}
                  </td>
                </tr>
                {isForPreview && (
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan="6" className="border border-black p-2">
                      Balance To Pay
                    </td>

                    <td className="border border-black p-2 text-right">
                      {totals.balanceAmountToPay.toFixed(2)}
                    </td>
                  </tr>
                )}

                {/* {!isForPreview && ( */}
                <>
                  {/* Invoice Summary */}
                  {/* <tr className="bg-red-50">
                      <td
                        colSpan="6"
                        className="border border-black font-bold text-right p-2"
                      >
                        Round off
                      </td>
                      <td className="border border-black p-2 text-right">
                        0.00
                      </td>
                    </tr> */}
                  <tr className="bg-red-50">
                    <td
                      colSpan="6"
                      className="border border-black font-bold text-right p-2"
                    >
                      TOTAL INVOICE AMOUNT
                    </td>
                    <td className="border border-black p-2 text-right font-bold">
                      {totals.sumOfRestaurantAndRoom.toFixed(2)}
                    </td>
                  </tr>
                </>
                {/* )} */}
              </tbody>
            </table>
            {/* {!isForPreview && ( */}
            <>
              {/* Tax Breakdown Table */}
              <div className="flex justify-end border-b border-l border-black">
                <table className="w-1/2 border border-black text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-1 text-center">
                        Taxable Amount
                      </th>
                      <th className="border border-black p-1 text-center">
                        CGST Rate
                      </th>
                      <th className="border border-black p-1 text-center">
                        CGST Amount
                      </th>
                      <th className="border border-black p-1 text-center">
                        SGST Rate
                      </th>
                      <th className="border border-black p-1 text-center">
                        SGST Amount
                      </th>
                      <th className="border border-black p-1 text-center">
                        Total Tax
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-1 text-right">
                        {totals.taxableAmount.toFixed(2)}
                      </td>
                      <td className="border border-black p-1 text-center">
                        {(totals.taxRate / 2).toFixed(2)}
                      </td>
                      <td className="border border-black p-1 text-right">
                        {(totals.taxAmount / 2).toFixed(2)}
                      </td>
                      <td className="border border-black p-1 text-center">
                        {(totals.taxRate / 2).toFixed(2)}
                      </td>
                      <td className="border border-black p-1 text-right">
                        {(totals.taxAmount / 2).toFixed(2)}
                      </td>
                      <td className="border border-black p-1 text-right">
                        {totals.taxAmount.toFixed(2)}
                      </td>
                    </tr>

                    {totals?.planAmount > 0 && (
                      <tr>
                        <td className="border border-black p-1 text-right">
                          {totals?.planAmount.toFixed(2)}
                        </td>
                        <td className="border border-black p-1 text-center">
                          {(totals?.taxRateFoodPlan / 2).toFixed(2)}
                        </td>
                        <td className="border border-black p-1 text-right">
                          {(totals?.taxAmountFoodPlan / 2).toFixed(2)}
                        </td>
                        <td className="border border-black p-1 text-center">
                          {(totals?.taxRateFoodPlan / 2).toFixed(2)}
                        </td>
                        <td className="border border-black p-1 text-right">
                          {(totals?.taxAmountFoodPlan / 2).toFixed(2)}
                        </td>
                        <td className="border border-black p-1 text-right">
                          {totals?.taxAmountFoodPlan.toFixed(2)}
                        </td>
                      </tr>
                    )}

                    <tr className="bg-gray-100 font-bold">
                      <td className="border border-black p-1 text-right">
                        {(totals.taxableAmount + totals?.planAmount).toFixed(2)}
                      </td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1 text-right">
                        {(
                          totals.taxAmount / 2 +
                          totals?.taxAmountFoodPlan / 2
                        ).toFixed(2)}
                      </td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1 text-right">
                        {(
                          totals.taxAmount / 2 +
                          totals?.taxAmountFoodPlan / 2
                        ).toFixed(2)}
                      </td>
                      <td className="border border-black p-1 text-right">
                        {(totals.taxAmount + totals?.taxAmountFoodPlan).toFixed(
                          2
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
            {/* )} */}
          </div>
          {/* {!isForPreview && ( */}
          <>
            {/* Footer Section */}
            <div className="grid grid-cols-2 gap-4">
              {/* Footer Details */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="w-32 font-bold">Settlement:</span>
                      <span>Cash</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-bold">Prepared By:</span>
                      <span>{secondaryUser?.name}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-bold">Billed By:</span>
                      <span>Reception</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-bold">Rooms:</span>
                      <span>
                        {selectedCheckOutData?.selectedRooms
                          ?.map((room) => room.roomName)
                          .join(", ")}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="w-32 font-bold">Total Rooms:</span>
                      <span>
                        {selectedCheckOutData?.selectedRooms?.length || 0}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-bold">Total Pax:</span>
                      <span>
                        {selectedCheckOutData?.selectedRooms?.reduce(
                          (acc, curr) => acc + Number(curr.pax || 0),
                          0
                        ) +
                          selectedCheckOutData?.additionalPaxDetails?.length ||
                          0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="p-4 mb-6">
                <h4 className="font-bold mb-3 text-center border-b border-black">
                  Bank Details
                </h4>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-32 font-bold">Bank Name:</span>
                    <span className="border-b border-dotted border-black flex-1 mx-2">
                      {organization?.configurations[0]?.bank?.acholder_name ||
                        ""}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-bold">A/C Number:</span>
                    <span className="border-b border-dotted border-black flex-1 mx-2">
                      {organization?.configurations[0]?.bank?.ac_no || ""}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-bold">Branch & IFSC:</span>
                    <span className="border-b border-dotted border-black flex-1 mx-2">
                      {organization?.configurations[0]?.bank?.branch || ""}{" "}
                      {organization?.configurations[0]?.bank?.branch && ","}
                      {organization?.configurations[0]?.bank?.ifsc || ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 mt-8">
              <div className="text-center">
                <div className="border-t border-black mt-16 pt-2">
                  Cashier Signature
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-black mt-16 pt-2">
                  Guest Signature
                </div>
              </div>
            </div>
          </>
          {/* )} */}

          {/* Action Buttons */}
          <div className="no-print w-full flex justify-end">
            {/* Container for the action buttons */}
            <div className="no-print flex flex-wrap gap-3 mb-4 p-4">
              {/* Download PDF */}
              <button
                onClick={() => handlePrint(false)}
                className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
              >
                📄 Download PDF
              </button>

              {/* Split Payment */}
              <button
                onClick={handleSplitPayment} // create a handler for this
                className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
              >
                💳 Split Payment
              </button>

              {/* Confirm – only if preview */}
              {isForPreview && (
                <button
                  onClick={() =>
                    navigate("/sUsers/checkInList", {
                      state: {
                        selectedCheckOut,
                        selectedCustomer: selectedCustomerData,
                        balanceToPay: totals?.balanceAmountToPay,
                        kotData,
                      },
                    })
                  }
                  className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
                >
                  ✅ Confirm
                </button>
              )}
              {/* Print */}
              <button
                onClick={() => handlePrint(true)}
                className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
              >
                🖨️ Print Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx>{`
          @media screen {
            .print-header,
            .print-footer {
              position: static;
            }
          }
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              margin: 0;
              background: white;
            }
            .min-h-screen {
              min-height: auto;
            }
            .bg-gray-50 {
              background: white;
            }
            .border-2 {
              border-width: 1px;
            }
          }
        `}</style>
      </div>
    </>
  );
}
