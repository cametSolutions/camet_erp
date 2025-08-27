import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import sattvaLogo from "../../../assets/images/sattva.jpg";
import api from "@/api/api";
import { useNavigate } from "react-router-dom";
export default function SattvaInvoice() {
  // Router and Redux state
  const location = useLocation();
  const navigate = useNavigate();
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );
  console.log(organization);

  // Props from location state
  const selectedCheckOut = location.state?.selectedCheckOut;
  const selectedCustomerId = location.state?.customerId;
  const isForPreview = location.state?.isForPreview;

  // Component state
  const [outStanding, setOutStanding] = useState([]);
  const [kotData, setKotData] = useState([]);
  const [selectedCustomerData, setSelectedCustomerData] = useState({});
  const [selectedCheckOutData, setSelectedCheckOutData] = useState({});
  const [dateWiseDisplayedData, setDateWiseDisplayedData] = useState([]);
  const [taxAmountForRoom, setTaxAmountForRoom] = useState(0);
  const [taxAmountForFood, setTaxAmountForFood] = useState(0);
  const [foodPlanAmount, setFoodPlanAmount] = useState(0);


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
    return `${day}-${month}-${year}`;
  };

  // Calculate totals
  const calculateTotals = () => {
    const roomTariffTotal = dateWiseDisplayedData.reduce(
      (total, order) => total + order.baseAmount,
      0
    );

    const advanceTotal =
      outStanding?.reduce(
        (total, transaction) => total + transaction?.bill_amount,
        0
      ) || 0;

    const kotTotal =
      kotData?.reduce((total, kot) => total + kot?.total, 0) || 0;

    const balanceAmount = roomTariffTotal - advanceTotal;
    const totalTaxAmount = (taxAmountForFood + taxAmountForRoom) * 2; // CGST + SGST

    return {
      roomTariffTotal,
      advanceTotal,
      kotTotal,
      balanceAmount,
      totalTaxAmount,
    };
  };

  // Print handler
  const handlePrint = () => {
    window.print();
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

        const foodPlanAmountWithOutTax = selectedCheckOutData.reduce(
          (acc, item) => acc + Number(item.foodPlanAmountWithOutTax),
          0
        );
        setFoodPlanAmount(foodPlanAmountWithOutTax);

        const foodPlanTaxAmount = selectedCheckOutData.reduce(
          (acc, item) =>
            acc +
            Number(item.foodPlanAmountWithOutTax || 0) -
            Number(item.taxAmountForFoodPlan || 0),
          0
        );
        setTaxAmountForFood(foodPlanTaxAmount);
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Print Button */}
      {/* <div className="no-print mb-4">
        <button
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium"
        >
          🖨️ Print Invoice
        </button>
      </div> */}

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
              {[
                organization?.flat,
                organization?.road,
                organization?.landmark,
                organization?.mobile,
              ]
                .filter(Boolean)
                .join(", ")}
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

              {/* Room Tariff Entries */}
              {dateWiseDisplayedData?.map((order, index) => (
                <tr key={`room-${index}`}>
                  <td className="border-r border-black p-1">{order?.date}</td>
                  <td className="border-r border-black p-1">
                    {order?.voucherNumber}
                  </td>
                  <td className="border-r border-black p-1">
                    Room Tariff [{order?.roomName} - {order?.customerName}]
                  </td>
                  <td className="border-r border-black p-1">{order?.hsn}</td>
                  <td className="border-r border-black p-1 text-right">
                    {order?.baseAmount?.toFixed(2)}
                  </td>
                  <td className="border-r border-black p-1 text-right"></td>
                  <td className="border-r border-black p-1 text-right"></td>
                </tr>
              ))}

              {/* Room Tariff Summary */}
              <tr className="bg-gray-100">
                <td
                  colSpan="6"
                  className="text-right p-2 border-r border-black"
                >
                  Room Tariff Assessable Value
                </td>
                <td className="p-2 text-right">
                  {totals.roomTariffTotal.toFixed(2)}
                </td>
              </tr>

              {/* Food Plan */}
              {foodPlanAmount > 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-right p-2 border-r border-black"
                  >
                    Food Plan Sales @ 5%
                  </td>
                  <td className="p-2 text-right">
                    {foodPlanAmount.toFixed(2)}
                  </td>
                </tr>
              )}

              {/* Tax Entries */}
              <tr>
                <td
                  colSpan="6"
                  className="text-right p-2 border-r border-black"
                >
                  CGST
                </td>
                <td className="p-2 text-right">
                  {(taxAmountForFood + taxAmountForRoom).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan="6"
                  className="text-right p-2 border-r border-b border-black"
                >
                  SGST
                </td>
                <td className="border-b border-black p-2 text-right">
                  {(taxAmountForFood + taxAmountForRoom).toFixed(2)}
                </td>
              </tr>

              {/* Balance Summary */}
              <tr>
                <td colSpan="3" className="text-right p-2">
                  {selectedCheckOutData?.selectedRooms
                    ?.map((room) => room.roomName)
                    .join(", ")}
                </td>
                <td colSpan="2" className="text-right p-2">
                  {totals.roomTariffTotal.toFixed(2)}
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
                  ROOM SERVICE BILL DETAILS
                </td>
              </tr>

              {kotData?.map((kot, index) => (
                <tr key={`kot-${index}`}>
                  <td className="border-r border-black p-1">
                    {formatDate(kot?.createdAt)}
                  </td>
                  <td className="border-r border-black p-1">
                    {kot?.voucherNumber}
                  </td>
                  <td className="border-r border-black p-1">
                    POS [Restaurant]
                  </td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1 text-right"></td>
                  <td className="border-r border-black p-1 text-right"></td>
                  <td className="border-r border-black p-1 text-right">
                    {kot?.total?.toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* Final Totals */}
              <tr className="bg-gray-100 font-bold">
                <td colSpan="5" className="border border-black p-2">
                  Total
                </td>
                <td className="border border-black p-2 text-right">
                  {totals.advanceTotal.toFixed(2)}
                </td>
                <td className="border border-black p-2 text-right">
                  {(totals.roomTariffTotal + totals.kotTotal).toFixed(2)}
                </td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td colSpan="6" className="border border-black p-2">
                  Balance To Pay
                </td>
                
                <td className="border border-black p-2 text-right">
                  {((totals.roomTariffTotal + totals.kotTotal).toFixed(2) -totals.advanceTotal.toFixed(2)).toFixed(2)  }
                </td>
              </tr>
              {!isForPreview && (
                <>
                  {/* Invoice Summary */}
                  <tr className="bg-red-50">
                    <td
                      colSpan="6"
                      className="border border-black font-bold text-right p-2"
                    >
                      Round off
                    </td>
                    <td className="border border-black p-2 text-right">0.00</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td
                      colSpan="6"
                      className="border border-black font-bold text-right p-2"
                    >
                      TOTAL INVOICE AMOUNT
                    </td>
                    <td className="border border-black p-2 text-right font-bold">
                      {(
                        totals.roomTariffTotal +
                        totals.kotTotal +
                        totals.totalTaxAmount
                      ).toFixed(2)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
          {!isForPreview && (
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
                        {totals.roomTariffTotal.toFixed(2)}
                      </td>
                      <td className="border border-black p-1 text-center">
                        6%
                      </td>
                      <td className="border border-black p-1 text-right">
                        {taxAmountForRoom.toFixed(2)}
                      </td>
                      <td className="border border-black p-1 text-center">
                        6%
                      </td>
                      <td className="border border-black p-1 text-right">
                        {taxAmountForRoom.toFixed(2)}
                      </td>
                      <td className="border border-black p-1 text-right">
                        {(taxAmountForRoom * 2).toFixed(2)}
                      </td>
                    </tr>

                    {foodPlanAmount > 0 && (
                      <tr>
                        <td className="border border-black p-1 text-right">
                          {foodPlanAmount.toFixed(2)}
                        </td>
                        <td className="border border-black p-1 text-center">
                          2.50%
                        </td>
                        <td className="border border-black p-1 text-right">
                          {taxAmountForFood.toFixed(2)}
                        </td>
                        <td className="border border-black p-1 text-center">
                          2.50%
                        </td>
                        <td className="border border-black p-1 text-right">
                          {taxAmountForFood.toFixed(2)}
                        </td>
                        <td className="border border-black p-1 text-right">
                          {(taxAmountForFood * 2).toFixed(2)}
                        </td>
                      </tr>
                    )}

                    <tr className="bg-gray-100 font-bold">
                      <td className="border border-black p-1 text-right">
                        {(totals.roomTariffTotal + foodPlanAmount).toFixed(2)}
                      </td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1 text-right">
                        {(taxAmountForRoom + taxAmountForFood).toFixed(2)}
                      </td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1 text-right">
                        {(taxAmountForRoom + taxAmountForFood).toFixed(2)}
                      </td>
                      <td className="border border-black p-1 text-right">
                        {totals.totalTaxAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        {!isForPreview && (
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
                      <span>System</span>
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
                        )}
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
                    <span className="border-b border-dotted border-black flex-1 mx-2"></span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-bold">A/C Number:</span>
                    <span className="border-b border-dotted border-black flex-1 mx-2"></span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-bold">Branch & IFSC:</span>
                    <span className="border-b border-dotted border-black flex-1 mx-2"></span>
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
        )}
        {isForPreview && (
          <div className="no-print w-full flex justify-end">
            <button
              onClick={() => navigate("/sUsers/checkOutList", {state: {selectedCheckOut:selectedCheckOut}})}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium"
            >
              Confirm Payment
            </button>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media screen {
          .print-header, .print-footer {
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
  );
}
