import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import api from "@/api/api";
import Logo from "../../../assets/images/hill.png";
import TitleDiv from "@/components/common/TitleDiv";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  handlePrintInvoice,
  handleDownloadPDF,
} from "../PrintSide/generateHotelInvoicePDF ";

import { Title } from "@radix-ui/react-dialog";
const HotelBillPrint = () => {
  // Router and Redux state
  const location = useLocation();
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );
 const navigate = useNavigate();
  // Props from location state
  const selectedCheckOut = location.state?.selectedCheckOut;
  const selectedCustomerId = location.state?.customerId;
  // const isForPreview = location.state?.isForPreview;

  // Component state
  const [outStanding, setOutStanding] = useState([]);
  const [kotData, setKotData] = useState([]);
  const [selectedCustomerData, setSelectedCustomerData] = useState({});
  const [selectedCheckOutData, setSelectedCheckOutData] = useState({});
  const [dateWiseDisplayedData, setDateWiseDisplayedData] = useState([]);
  const [taxAmountForRoom, setTaxAmountForRoom] = useState(0);
  const [taxAmountForFood, setTaxAmountForFood] = useState(0);
  const [foodPlanAmount, setFoodPlanAmount] = useState(0);
  const [additionalPaxAmount, setAdditionalPaxAmount] = useState(0);
  const printReference = useRef(null);

const [showSplitPopUp, setShowSplitPopUp] = useState(false);
const [selected, setSelected] = useState("default");
const isForPreview = location.state?.isForPreview;


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

        const startDate = new Date(item.arrivalDate);
        const endDate = new Date(item.checkOutDate);

         const fullDays = Math.floor(stayDays);
      const fractionalDay = stayDays - fullDays;

        for (let i = 0; i < fullDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const formattedDate = currentDate.toLocaleDateString("en-GB").replace(/\//g, "-");

        result.push({
          date: formattedDate,
          description: `Room Rent - Room ${room.roomName}`,
          docNo: item.voucherNumber,
          amount: baseAmount,
          baseAmountWithTax: perDayAmount,
          baseAmount: baseAmount,
          taxAmount: taxAmount,
          voucherNumber: item.voucherNumber,
          roomName: room.roomName,
          hsn: room?.hsnDetails?.hsn,
          customerName: item.customerId?.partyName,
          foodPlanAmountWithTax: foodPlanAmountWithTax,
          foodPlanAmountWithOutTax: foodPlanAmountWithOutTax,
          additionalPaxDataWithTax: additionalPaxDataWithTax,
          additionalPaxDataWithOutTax: additionalPaxDataWithOutTax,
        });
      }
       if (fractionalDay > 0) {
        const fractionalDate = new Date(startDate);
        fractionalDate.setDate(startDate.getDate() + fullDays);
        const formattedFractionalDate = fractionalDate
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-");

        result.push({
          date: formattedFractionalDate,
          description: `Room Rent - Room ${room.roomName} (${fractionalDay} day)`,
          docNo: item.voucherNumber,
          amount: baseAmount * fractionalDay,
          baseAmountWithTax: perDayAmount * fractionalDay,
          baseAmount: baseAmount * fractionalDay,
          taxAmount: taxAmount * fractionalDay,
          voucherNumber: item.voucherNumber,
          roomName: room.roomName,
          hsn: room?.hsnDetails?.hsn,
          customerName: item.customerId?.partyName,
          foodPlanAmountWithTax: foodPlanAmountWithTax * fractionalDay,
          foodPlanAmountWithOutTax: foodPlanAmountWithOutTax * fractionalDay,
          additionalPaxDataWithTax: additionalPaxDataWithTax * fractionalDay,
          additionalPaxDataWithOutTax: additionalPaxDataWithOutTax * fractionalDay,
        });
      }
      });
    });

    return result;
  };

const handleSplitPayment = () => {
  setShowSplitPopUp(true);
};

const handleChange = (value) => {
  setSelected(value);
};


const handleSplit = () => {
  setShowSplitPopUp(false);
  console.log(selected);
  if (selected === "room") {
    setKotData([]);
  } else if (selected === "restaurant") {
    setOutStanding([]);
    setDateWiseDisplayedData([]);
    setTaxAmountForFood(0);
    setTaxAmountForRoom(0);
    setFoodPlanAmount(0);
    setAdditionalPaxAmount(0);
  }
};

const handlePrintPDF = (isPrint) => {
  const totals = calculateTotals();
  const secondaryUser = JSON.parse(localStorage.getItem("sUserData"));

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
      sgstAmount: totals.sgstAmount,
      cgstAmount: totals.cgstAmount,
      totalTaxAmount: totals.totalTaxAmount,
      grandTotal: totals.grandTotal,
      netPay: totals.netPay,
      planAmount: totals.planAmount,
      additionalPaxAmount: totals.additionalPaxAmount,
    },

    // Tax amounts (dynamic)
    taxAmountForRoom: taxAmountForRoom,
    taxAmountForFood: taxAmountForFood,

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

  console.log("Complete Invoice Data:", invoiceData);

  // Call the PDF generation function with all dynamic data
  if (!isPrint) {
    handleDownloadPDF(invoiceData);
  } else {
    handlePrintInvoice(invoiceData);
  }
};


  // API call to fetch debit data
  const fetchDebitData = async (data) => {
    try {
      const res = await api.post(
        `/api/sUsers/fetchOutStandingAndFoodData`,
        { data: data },
        { withCredentials: true }
      );

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
    return `${day}/${month}/${year}`;
  };





  // Calculate totals - FIXED VERSION
  const calculateTotals = () => {
    const roomTariffTotal = dateWiseDisplayedData.reduce(
      (total, order) => total + (order.baseAmount || 0),
      0
    );

    const planAmount = dateWiseDisplayedData.reduce(
      (total, order) => total + (order?.foodPlanAmountWithOutTax || 0),
      0
    );

    const additionalPaxAmount = dateWiseDisplayedData.reduce(
      (total, order) => total + (order?.additionalPaxDataWithOutTax || 0),
      0
    );

    const advanceTotal =
      outStanding?.reduce(
        (total, transaction) => total + (transaction?.bill_amount || 0),
        0
      ) || 0;

    const kotTotal =
      kotData?.reduce((total, kot) => total + (kot?.total || 0), 0) || 0;

    const sgstAmount = taxAmountForRoom;
    const cgstAmount = taxAmountForRoom;
    const totalTaxAmount = sgstAmount + cgstAmount;

    const grandTotal =
      roomTariffTotal +
      planAmount +
      additionalPaxAmount +
      totalTaxAmount +
      kotTotal;
    const netPay = grandTotal - advanceTotal;

    return {
      roomTariffTotal,
      advanceTotal,
      kotTotal,
      sgstAmount,
      cgstAmount,
      totalTaxAmount,
      grandTotal,
      netPay,
      planAmount,
      additionalPaxAmount,
    };
  };

  // Add keyboard shortcut for printing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        window.print();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Print handler
  const handlePrint = useReactToPrint({
    content: () => printReference.current,
    documentTitle: "Hotel Bill",
    removeAfterPrint: true,
  });

const calculateCumulativeBalances = (charges, totals) => {
  let cumulativeBalance = 0;
  const dailyRoomCount = dateWiseDisplayedData.length;
  const taxPerDay = dailyRoomCount > 0 ? totals.totalTaxAmount / dailyRoomCount : 0;
  
  return charges.map((charge) => {
    let currentAmount = charge.amount || 0;
    let currentTax = 0;
    
    // For room charges, add the daily tax portion
    if (charge.description.includes('Room Rent')) {
      currentTax = taxPerDay;
      cumulativeBalance += currentAmount + currentTax;
    }
    // For advance (negative amount)
    else if (charge.description === 'Advance') {
      cumulativeBalance += currentAmount; // already negative
    }
    // For separate tax entries (CGST/SGST) - don't add to balance as already included
    else if (charge.description.includes('CGST') || charge.description.includes('SGST')) {
      // Don't change balance, tax already counted in room charges
    }
    // For other charges (Restaurant, Food Plan, Additional Pax)
    else {
      cumulativeBalance += currentAmount;
    }
    
    return {
      ...charge,
      balance: cumulativeBalance.toFixed(2)
    };
  });
};


  // Main effect to process checkout data - FIXED VERSION
  useEffect(() => {
    if (selectedCustomerId && selectedCheckOut?.length > 0) {
      const findCustomerFullData = selectedCheckOut.find(
        (item) => item.customerId?._id === selectedCustomerId
      );

      if (findCustomerFullData) {
        setSelectedCustomerData(findCustomerFullData.customerId);
        setSelectedCheckOutData(findCustomerFullData);

        const selectedCheckOutData = transformCheckOutData(selectedCheckOut);
        setDateWiseDisplayedData(selectedCheckOutData);

        const taxAmountBasedOnRoom = selectedCheckOutData.reduce(
          (acc, item) => acc + Number(item.taxAmount || 0),
          0
        );
        setTaxAmountForRoom(taxAmountBasedOnRoom);

        const foodPlanAmountWithOutTax = selectedCheckOutData.reduce(
          (acc, item) => acc + Number(item.foodPlanAmountWithOutTax || 0),
          0
        );
        const paxAmount = selectedCheckOutData.reduce(
          (acc, item) => acc + Number(item.additionalPaxDataWithTax || 0),
          0
        );
        setFoodPlanAmount(foodPlanAmountWithOutTax);
        setAdditionalPaxAmount(paxAmount);

        const foodPlanTaxAmount = selectedCheckOutData.reduce(
          (acc, item) =>
            acc +
            Number(item.foodPlanAmountWithOutTax || 0) -
            Number(item.taxAmountForFoodPlan || 0),
          0
        );

        setTaxAmountForFood(foodPlanTaxAmount - foodPlanAmountWithOutTax);
      }
    }
  }, [selectedCustomerId, selectedCheckOut]);

  // Effect to fetch debit data
  useEffect(() => {
    if (selectedCheckOut?.length > 0) {
      fetchDebitData(selectedCheckOut);
    }
  }, [selectedCheckOut]);

  const totals = calculateTotals();

  console.log(location.state);
  console.log(outStanding);
  console.log(selectedCheckOutData);
  console.log(organization?.gstNum);
  // Dynamic bill data based on fetched information - FIXED VERSION
  const billData = {
    hotel: {
      name: organization?.name,
      address:
        `${organization?.flat || ""} ${organization?.road || ""} ${
          organization?.landmark || ""
        }`.trim() || "Erattayar road, Kattapana, Kerala India",
      phone: organization?.mobile,
      email: organization?.email,
      website: organization?.website,
      pan: organization?.pan,
      gstin: organization?.gstNum,
      sacCode: "996311",
    },
    guest: {
      name: selectedCustomerData?.partyName,
      roomNo: selectedCheckOutData?.selectedRooms
        ?.map((room) => room.roomName)
        .join(", "),
      billNo: selectedCheckOutData?.voucherNumber,
      travelAgent: selectedCheckOutData?.agentId?.name,
      address: selectedCustomerData?.billingAddress || "",
      phone: selectedCustomerData?.mobileNumber || "",
      gstNo: selectedCustomerData?.gstNo || "",
    },
    stay: {
      billDate: formatDate(new Date()),
      arrival: `${formatDate(selectedCheckOutData?.arrivalDate)} ${
        selectedCheckOutData?.arrivalTime || ""
      }`,
      departure: `${formatDate(new Date())} ${new Date().toLocaleTimeString()}`,
      days: selectedCheckOutData?.selectedRooms?.[0]?.stayDays,
      plan: selectedCheckOutData?.foodPlanAmount,
      pax:
        selectedCheckOutData?.selectedRooms?.reduce(
          (acc, curr) => acc + Number(curr.pax || 0),
          0
        ) || 1,
      tariff: selectedCheckOutData?.selectedRooms?.[0]?.baseAmount || 0,
    },

     charges: calculateCumulativeBalances([
    // Room charges from dateWiseDisplayedData
    ...dateWiseDisplayedData.map((item) => ({
      date: item.date,
      description: item.description,
      docNo: item.docNo || "-",
      amount:
        (item.baseAmount || 0) +
        (item.additionalPaxDataWithOutTax || 0) +
        (item.foodPlanAmountWithOutTax || 0),
      taxes: (item.taxAmount || 0).toFixed(2),
      advance: "",
    })),
    // Advance entries from outStanding
    ...outStanding.map((transaction) => ({
      date: formatDate(transaction.bill_date),
      description: "Advance",
      docNo: transaction.bill_no,
      amount: -Math.abs(transaction.bill_amount || 0),
      taxes: "",
      advance: Math.abs(transaction.bill_amount || 0).toFixed(2),
    })),
      // Tax charges
       ...(totals.cgstAmount > 0
      ? [
          {
            date: formatDate(new Date()),
            description: "CGST on Rent@6%",
            docNo: "-",
            amount: 0,
            taxes: totals.cgstAmount.toFixed(2),
            advance: "",
          },
        ]
      : []),
         ...(totals.sgstAmount > 0
      ? [
          {
            date: formatDate(new Date()),
            description: "SGST on Rent @6%",
            docNo: "-",
            amount: 0,
            taxes: totals.sgstAmount.toFixed(2),
            advance: "",
          },
        ]
      : []),

      // Restaurant charges from kotData
        // Restaurant charges from kotData
    ...kotData.map((kot) => ({
      date: formatDate(kot.createdAt),
      description: kot.description || "Restaurant",
      docNo: kot.voucherNumber,
      amount: kot.total || 0,
      taxes: "",
      advance: "",
    })),
      ], totals),
      // Food plan charges if any
      ...(totals.planAmount > 0
        ? [
            {
              date: formatDate(new Date()),
              description: "Food Plan",
              docNo: "-",
              amount: totals.planAmount,
            },
          ]
        : []),
      // Additional pax charges if any
      ...(totals.additionalPaxAmount > 0
        ? [
            {
              date: formatDate(new Date()),
              description: "Additional Pax",
              docNo: "-",
              amount: totals.additionalPaxAmount,
            },
          ]
        : []),
    
    summary: {
      roomRent: totals.roomTariffTotal,
      sgst: totals.sgstAmount,
      cgst: totals.cgstAmount,
      restaurant: totals.kotTotal,
      roomService: 0,
      foodPlan: totals.planAmount,
      additionalPax: totals.additionalPaxAmount,
      total: totals.grandTotal,
      totalWords: convertNumberToWords(totals.grandTotal),
    },
    payment: {
      mode: "Credit",
      total: totals.grandTotal,
      advance: totals.advanceTotal,
      netPay: totals.netPay,
    },
  };

// Add this helper function before creating billData object


  // Function to convert number to words (simplified version)
  function convertNumberToWords(amount) {
    // This is a simplified version - you might want to use a proper number-to-words library
    return `${Math.round(amount)} Rupees Only`;
  }

  console.log(billData);

  return (
    <>
    <TitleDiv title="Bill Print"/>


      {/* Split Payment Modal */}
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

    <div className="font-sans bg-gray-100 p-5 min-h-screen" ref={printReference}></div>
      <div
        className="font-sans bg-gray-100 p-5 min-h-screen"
        ref={printReference}
      >
        <div
          style={{
            maxWidth: "21cm",
            margin: "0 auto",
            padding: "0.5cm",
            backgroundColor: "white",
            fontFamily: "Arial, sans-serif",
            fontSize: "11px",
            lineHeight: "1.1",
            color: "#000",
          }}
        >
          {/* Header Section - Repeats on every page */}
          <div
            className="page-header flex"
            style={{
              textAlign: "center",
              borderBottom: "1px solid #000",
              paddingBottom: "8px",
              marginBottom: "10px",
            }}
          >
            <div style={{ flex: "0 0 120px" }}>
              {Logo && (
                <img
                  src={Logo}
                  alt="Logo"
                  style={{ width: "120px", height: "auto" }}
                />
              )}
            </div>
            <div className="ml-auto">
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                }}
              >
                {billData?.hotel?.name}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  marginBottom: "2px",
                  lineHeight: "1.2",
                }}
              >
                {billData?.hotel?.address}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  marginBottom: "2px",
                  lineHeight: "1.2",
                }}
              >
                Phone: {billData?.hotel?.phone}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  marginBottom: "3px",
                  lineHeight: "1.2",
                }}
              >
                E-mail: {billData?.hotel?.email} | Website:{" "}
                {billData?.hotel?.website}
              </div>
              <div
                style={{
                  fontSize: "9px",
                  lineHeight: "1.1",
                }}
              >
                PAN NO: {billData?.hotel?.pan} | GSTIN: {billData?.hotel?.gstin}
              </div>
              <div
                style={{
                  fontSize: "9px",
                  lineHeight: "1.1",
                }}
              >
                SAC CODE-{billData?.hotel?.sacCode}
              </div>
            </div>
          </div>

          {/* Guest Information Section */}
          <div style={{ marginBottom: "10px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "10px",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      width: "15%",
                      padding: "2px 0",
                      fontWeight: "bold",
                    }}
                  >
                    GRC No
                  </td>
                  <td style={{ width: "15%", padding: "2px 0" }}>
                    {billData?.guest?.billNo}
                  </td>
                  <td
                    style={{
                      width: "15%",
                      padding: "2px 0",
                      fontWeight: "bold",
                    }}
                  >
                    Bill No
                  </td>
                  <td style={{ width: "15%", padding: "2px 0" }}>
                    {billData?.guest?.billNo}
                  </td>
                  <td
                    style={{
                      width: "10%",
                      padding: "2px 0",
                      fontWeight: "bold",
                    }}
                  >
                    Date
                  </td>
                  <td style={{ width: "30%", padding: "2px 0" }}>
                    {billData?.stay?.billDate}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                    GUEST
                  </td>
                  <td style={{ padding: "2px 0" }}>{billData?.guest?.name}</td>
                  <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                    Arrival
                  </td>
                  <td style={{ padding: "2px 0" }}>
                    {billData?.stay?.arrival}
                  </td>
                  <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                    Departure
                  </td>
                  <td style={{ padding: "2px 0" }}>
                    {billData?.stay?.departure}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                    Address
                  </td>
                  <td colSpan="3" style={{ padding: "2px 0" }}>
                    {billData?.guest?.address}
                  </td>
                  <td style={{ padding: "2px 0", fontWeight: "bold" }}>Plan</td>
                  <td style={{ padding: "2px 0" }}>
                    {billData?.stay?.plan} Pax {billData?.stay?.pax}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                    Phone
                  </td>
                  <td style={{ padding: "2px 0" }}>{billData?.guest?.phone}</td>
                  <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                    Tariff
                  </td>
                  <td style={{ padding: "2px 0" }}>{billData?.stay?.tariff}</td>
                  <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                    No. of Days
                  </td>
                  <td style={{ padding: "2px 0" }}>{billData?.stay?.days}</td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                    Travel Agent
                  </td>
                  <td style={{ padding: "2px 0" }}>
                    {billData?.guest?.travelAgent}
                  </td>
                  <td colSpan="4"></td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                    GST No
                  </td>
                  <td style={{ padding: "2px 0" }}>{billData?.hotel?.gstin}</td>
                  <td colSpan="4"></td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                    Company
                  </td>
                  <td style={{ padding: "2px 0" }}>
                   {billData?.hotel?.name}
                  </td>
                  <td colSpan="4"></td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                    Room No
                  </td>
                  <td style={{ padding: "2px 0" }}>
                    {billData?.guest?.roomNo}
                  </td>
                  <td colSpan="4"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bill Title */}
          {/* <div
            style={{
              textAlign: "center",
              fontSize: "14px",
              fontWeight: "bold",
              margin: "10px 0",
              border: "1px solid #000",
              padding: "5px",
              backgroundColor: "#f5f5f5",
            }}
          >
            &lt;&lt; BILL &gt;&gt;
          </div> */}

          {/* Charges Table */}
          <div style={{ marginBottom: "10px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #000",
                fontSize: "10px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px",
                      textAlign: "left",
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px",
                      textAlign: "left",
                    }}
                  >
                    Doc No
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px",
                      textAlign: "left",
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px",
                      textAlign: "right",
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px",
                      textAlign: "right",
                    }}
                  >
                    Taxes
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px",
                      textAlign: "right",
                    }}
                  >
                    Advance
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px",
                      textAlign: "right",
                    }}
                  >
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {billData?.charges?.map((charge, index) => (
                  <tr key={index}>
                    <td style={{ border: "1px solid #000", padding: "3px" }}>
                      {charge.date}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px",
                        textAlign: "center",
                      }}
                    >
                      {charge.docNo}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "3px" }}>
                      {charge.description}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px",
                        textAlign: "right",
                      }}
                    >
                      {charge.amount?.toFixed(2)}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px",
                        textAlign: "right",
                      }}
                    >
                      {charge.taxes}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px",
                        textAlign: "right",
                      }}
                    >
                      {charge.advance}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px",
                        textAlign: "right",
                      }}
                    >
                      {charge.balance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary and Payment in two columns */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
            {/* Summary Section */}
            <div style={{ flex: "1" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #000",
                  fontSize: "11px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "6px",
                        textAlign: "left",
                        fontWeight: "bold",
                      }}
                    >
                      Summary
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "6px",
                        textAlign: "right",
                        fontWeight: "bold",
                      }}
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: "1px solid #000", padding: "4px" }}>
                      Room Rent
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right",
                      }}
                    >
                      {billData?.summary?.roomRent?.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>

                  {billData?.summary?.foodPlan > 0 && (
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                        Food Plan
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                        }}
                      >
                        {billData?.summary?.foodPlan?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  )}

                  <tr>
                    <td style={{ border: "1px solid #000", padding: "4px" }}>
                      SGST on Rent
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right",
                      }}
                    >
                      {billData?.summary?.sgst?.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>

                  <tr>
                    <td style={{ border: "1px solid #000", padding: "4px" }}>
                      CGST on Rent
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right",
                      }}
                    >
                      {billData?.summary?.cgst?.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>

                  <tr>
                    <td style={{ border: "1px solid #000", padding: "4px" }}>
                      Ac Restaurant
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right",
                      }}
                    >
                      {billData?.summary?.restaurant?.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>

                  <tr>
                    <td style={{ border: "1px solid #000", padding: "4px" }}>
                      Room Service
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right",
                      }}
                    >
                      {billData?.summary?.roomService?.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>

                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        fontWeight: "bold",
                      }}
                    >
                      Total
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right",
                        fontWeight: "bold",
                      }}
                    >
                      {billData?.summary?.total?.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Details Section */}
            <div style={{ flex: "1" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #000",
                  fontSize: "11px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th
                      colSpan="2"
                      style={{
                        border: "1px solid #000",
                        padding: "6px",
                        textAlign: "left",
                        fontWeight: "bold",
                      }}
                    >
                      Payment Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        fontWeight: "bold",
                      }}
                    >
                      PAYMODE
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      AMOUNT
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid #000", padding: "4px" }}>
                      {billData?.payment?.mode}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right",
                      }}
                    >
                      {billData?.payment?.total?.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                      colSpan="2"
                    >
                      {billData?.guest?.name}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ border: "1px solid #000", padding: "4px" }}
                      colSpan="2"
                    >
                      <div style={{ fontSize: "10px", fontWeight: "bold" }}>
                        {billData?.summary?.totalWords}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid #000", padding: "4px" }}>
                      <div>Total :</div>
                      <div>Less Advance:</div>
                      <div style={{ fontWeight: "bold" }}>Net Pay :</div>
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right",
                      }}
                    >
                      <div>{billData?.payment?.total?.toFixed(2)}</div>
                      <div>{billData?.payment?.advance?.toFixed(2)}</div>
                      <div style={{ fontWeight: "bold" }}>
                        {billData?.payment?.netPay?.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Section */}
          <div style={{ border: "1px solid #000" }}>
            <div style={{ display: "flex", borderBottom: "1px solid #000" }}>
              <div
                style={{
                  flex: "1",
                  padding: "8px",
                  borderRight: "1px solid #000",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                Please Deposit Your Room and Locker Keys
              </div>
              <div style={{ flex: "1", padding: "8px", fontSize: "10px" }}>
                Regardless of charge instructions, I agree to be held personally
                liable for the payment of total amount of bill. Please collect
                receipt if you have paid cash.
              </div>
            </div>

            <div style={{ display: "flex", borderBottom: "1px solid #000" }}>
              <div
                style={{
                  flex: "1",
                  padding: "12px",
                  borderRight: "1px solid #000",
                  textAlign: "left",
                  fontSize: "10px",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "15px" }}>
                  Prepared By
                </div>
                <div>FO</div>
              </div>
              <div
                style={{
                  flex: "1",
                  padding: "12px",
                  borderRight: "1px solid #000",
                  textAlign: "left",
                  fontSize: "10px",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "15px" }}>
                  Manager
                </div>
                <div
                  style={{
                    height: "15px",
                    borderBottom: "1px solid #000",
                    margin: "10px 0",
                  }}
                ></div>
              </div>
              <div
                style={{
                  flex: "1",
                  padding: "12px",
                  textAlign: "left",
                  fontSize: "10px",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "15px" }}>
                  Guest Signature & Date
                </div>
                <div
                  style={{
                    height: "15px",
                    borderBottom: "1px solid #000",
                    margin: "10px 0",
                  }}
                ></div>
              </div>
            </div>

            <div style={{ display: "flex" }}>
              <div
                style={{
                  flex: "1",
                  padding: "8px",
                  borderRight: "1px solid #000",
                  fontStyle: "italic",
                  fontSize: "10px",
                }}
              >
                We hope you enjoyed your stay and would like to welcome you
                back...
              </div>
              <div
                style={{
                  padding: "8px",
                  fontSize: "10px",
                  textAlign: "center",
                  minWidth: "120px",
                }}
              >
                Original Bill
                <br />
                Page 1
              </div>
            </div>
          </div>

          {/* Print Styles */}
          <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          @page {
            margin: 0.5cm;
            size: A4;
          }
          
          .page-header {
            position: running(header);
          }
          
          @page {
            @top {
              content: element(header);
            }
          }
          
          /* Ensure header repeats on every page */
          .page-header {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Page break controls */
          .charges-table,
          .summary-section,
          .payment-section {
            page-break-inside: avoid;
          }
        }
      `}</style>
        </div>
          <div className="no-print w-full flex justify-center">
        <div className="no-print flex flex-wrap gap-3 mb-4 p-4">
          {/* Download PDF */}
          <button
            onClick={() => handlePrintPDF(false)}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
          >
            📄 Download PDF
          </button>

          {/* Split Payment */}
          <button
            onClick={handleSplitPayment}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
          >
            💳 Split Payment
          </button>

          {/* Confirm – only if preview */}
          {isForPreview && (
            <button
              onClick={() => {
                const totals = calculateTotals();
                navigate("/sUsers/checkInList", {
                  state: {
                    selectedCheckOut,
                    selectedCustomer: selectedCustomerData,
                    balanceToPay: totals?.netPay,
                    kotData,
                  },
                });
              }}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
            >
              ✅ Confirm
            </button>
          )}

          {/* Print Invoice */}
          <button
            onClick={() => handlePrintPDF(true)}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
          >
            🖨️ Print Invoice
          </button>

          {/* Regular Print (Browser Print) */}
          {/* <button
            onClick={handlePrint}
            className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-blue-600 hover:to-blue-500 text-white font-medium py-2 px-6 rounded-lg shadow-lg transform transition duration-200 hover:scale-105 active:scale-95"
          >
            🖨️ Browser Print
          </button> */}
        </div>
      </div>
      </div>
    </>
  );
};

export default HotelBillPrint;
