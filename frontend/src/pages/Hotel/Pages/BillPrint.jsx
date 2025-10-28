import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import api from "@/api/api";
import Logo from "../../../assets/images/hill.png";
import TitleDiv from "@/components/common/TitleDiv";
import { Title } from "@radix-ui/react-dialog";
const HotelBillPrint = () => {
  // Router and Redux state
  const location = useLocation();
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );

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
            description: `Room Rent - Room ${room.roomName}`,
            docNo: item.voucherNumber,
            amount: baseAmount,
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

    charges: [
      // Room charges from dateWiseDisplayedData
      ...dateWiseDisplayedData.map((item) => ({
        date: item.date,
        description: item.description,
        docNo: item.docNo || "-",
        amount:
          (item.baseAmount || 0) +
          (item.additionalPaxDataWithOutTax || 0) +
          (item.foodPlanAmountWithOutTax || 0),
        taxes: selectedCheckOutData?.selectedRooms
          ?.map((room) => room.taxAmount)
          .join(", "),
        Advance: selectedCheckOutData?.advanceAmount,
        balance: selectedCheckOutData?.balanceToPay,
      })),
      // Advance entries from outStanding
      ...outStanding.map((transaction) => ({
        date: formatDate(transaction.bill_date),
        description: "Advance",
        docNo: transaction.bill_no,
        amount: -Math.abs(transaction.bill_amount || 0), // Negative for advance
        taxes: transaction.tax,
        Advance: transaction.advanceAmount,
        balance: transaction.balance,
      })),
      // Tax charges
      ...(totals.cgstAmount > 0
        ? [
            {
              date: formatDate(new Date()),
              description: "CGST on Rent@6%",
              docNo: "-",
              amount: totals.cgstAmount,
            },
          ]
        : []),
      ...(totals.sgstAmount > 0
        ? [
            {
              date: formatDate(new Date()),
              description: "SGST on Rent @6%",
              docNo: "-",
              amount: totals.sgstAmount,
            },
          ]
        : []),
      // Restaurant charges from kotData
      ...kotData.map((kot) => ({
        date: formatDate(kot.createdAt),
        description: kot.description,
        docNo: kot.voucherNumber,
        amount: kot.total || 0,
      })),
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
    ],
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

  // Function to convert number to words (simplified version)
  function convertNumberToWords(amount) {
    // This is a simplified version - you might want to use a proper number-to-words library
    return `${Math.round(amount)} Rupees Only`;
  }

  console.log(billData);

  return (
    <>
    <TitleDiv title="Bill Print"/>
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
          <div
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
          </div>

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
                      {charge.tax}
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
        <div className=" bg-gray-100 flex justify-center m-4 print:hidden ">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-black to-gray-800 hover:from-blue-600 hover:to-blue-500 text-white font-medium py-2 px-2 rounded-xl shadow-lg transform transition duration-200 hover:scale-105 active:scale-95"
          >
            <span className="text-lg">🖨️</span>
            <span>Print Bill</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default HotelBillPrint;
