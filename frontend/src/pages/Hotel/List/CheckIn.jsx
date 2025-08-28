import React, { useState } from "react";
import {
  Calendar,
  Search,
  Filter,
  UserCheck,
  Clock,
  MapPin,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TitleDiv from "@/components/common/TitleDiv";
const CheckInList = () => {
  // Sample check-in data with all required fields
  const [checkIns] = useState([
    {
      id: 1,
      date: "2024-07-10",
      voucherNo: "BK001",
      guestName: "John Smith",
      guestAddress: "123 Main St, Mumbai, Maharashtra 400001",
      priceListName: "Standard Rate",
      arrivalDate: "2024-07-15",
      arrivalTime: "14:00",
      stayDays: 3,
      checkoutDate: "2024-07-18",
      checkoutTime: "12:00",
      bookingType: "Online Booking",
      availableRoomList: "A-Block Rooms",
      slNo: 1,
      roomNo: "101",
      days: 3,
      noOfPax: 2,
      extraPaxType: "Adult",
      extraPaxRate: 0,
      extraPaxAmount: 0,
      totalExtraPax: 0,
      plan: "Room Only",
      planAmount: 0,
      tarifRate: 1667,
      roomRent: 5000,
      discPercent: 0,
      discountAmount: 0,
      amount: 5000,
      foodPlanAmount: 0,
      cgst: 450,
      sgst: 450,
      roundOff: 0,
      totalBillAmount: 5900,
      sourceType: "Website",
      bookingAdvance: 2000,
      advanceDetails: "Online Payment - UPI",
      enteredBy: "Admin User",
    },
    {
      id: 2,
      date: "2024-07-11",
      voucherNo: "BK002",
      guestName: "Sarah Johnson",
      guestAddress: "456 Oak Ave, Delhi, Delhi 110001",
      priceListName: "Premium Rate",
      arrivalDate: "2024-07-20",
      arrivalTime: "15:30",
      stayDays: 3,
      checkoutDate: "2024-07-23",
      checkoutTime: "11:00",
      bookingType: "Office Line Booking",
      availableRoomList: "B-Block Rooms",
      slNo: 2,
      roomNo: "205",
      days: 3,
      noOfPax: 4,
      extraPaxType: "Adult",
      extraPaxRate: 500,
      extraPaxAmount: 1000,
      totalExtraPax: 2,
      plan: "MAP",
      planAmount: 1500,
      tarifRate: 2500,
      roomRent: 7500,
      discPercent: 0,
      discountAmount: 0,
      amount: 8500,
      foodPlanAmount: 1500,
      cgst: 765,
      sgst: 765,
      roundOff: 0,
      totalBillAmount: 10030,
      sourceType: "Phone",
      bookingAdvance: 3000,
      advanceDetails: "Cash Payment",
      enteredBy: "Reception Staff",
    },
    {
      id: 3,
      date: "2024-07-12",
      voucherNo: "BK003",
      guestName: "Michael Brown",
      guestAddress: "789 Pine Rd, Bangalore, Karnataka 560001",
      priceListName: "Corporate Rate",
      arrivalDate: "2024-07-25",
      arrivalTime: "16:00",
      stayDays: 2,
      checkoutDate: "2024-07-27",
      checkoutTime: "10:30",
      bookingType: "Online Booking",
      availableRoomList: "C-Block Rooms",
      slNo: 3,
      roomNo: "302",
      days: 2,
      noOfPax: 2,
      extraPaxType: "N/A",
      extraPaxRate: 0,
      extraPaxAmount: 0,
      totalExtraPax: 0,
      plan: "CP",
      planAmount: 800,
      tarifRate: 2000,
      roomRent: 4000,
      discPercent: 5,
      discountAmount: 200,
      amount: 3800,
      foodPlanAmount: 800,
      cgst: 360,
      sgst: 360,
      roundOff: 0,
      totalBillAmount: 4720,
      sourceType: "App",
      bookingAdvance: 1500,
      advanceDetails: "Card Payment - Visa",
      enteredBy: "Manager",
    },
    {
      id: 4,
      date: "2024-07-13",
      voucherNo: "BK004",
      guestName: "Emily Davis",
      guestAddress: "321 Cedar St, Chennai, Tamil Nadu 600001",
      priceListName: "Weekend Rate",
      arrivalDate: "2024-08-01",
      arrivalTime: "13:45",
      stayDays: 4,
      checkoutDate: "2024-08-05",
      checkoutTime: "12:00",
      bookingType: "Online Booking",
      availableRoomList: "A-Block Rooms",
      slNo: 4,
      roomNo: "107",
      days: 4,
      noOfPax: 3,
      extraPaxType: "Child",
      extraPaxRate: 250,
      extraPaxAmount: 500,
      totalExtraPax: 1,
      plan: "AP",
      planAmount: 1200,
      tarifRate: 2000,
      roomRent: 8000,
      discPercent: 0,
      discountAmount: 0,
      amount: 8500,
      foodPlanAmount: 1200,
      cgst: 765,
      sgst: 765,
      roundOff: 0,
      totalBillAmount: 10030,
      sourceType: "Website",
      bookingAdvance: 4000,
      advanceDetails: "Online Payment - Net Banking",
      enteredBy: "Admin User",
    },
    {
      id: 5,
      date: "2024-07-14",
      voucherNo: "BK005",
      guestName: "Robert Wilson",
      guestAddress: "654 Elm St, Pune, Maharashtra 411001",
      priceListName: "Standard Rate",
      arrivalDate: "2024-08-10",
      arrivalTime: "17:30",
      stayDays: 2,
      checkoutDate: "2024-08-12",
      checkoutTime: "11:30",
      bookingType: "Office Line Booking",
      availableRoomList: "B-Block Rooms",
      slNo: 5,
      roomNo: "201",
      days: 2,
      noOfPax: 2,
      extraPaxType: "N/A",
      extraPaxRate: 0,
      extraPaxAmount: 0,
      totalExtraPax: 0,
      plan: "Room Only",
      planAmount: 0,
      tarifRate: 1750,
      roomRent: 3500,
      discPercent: 0,
      discountAmount: 0,
      amount: 3500,
      foodPlanAmount: 0,
      cgst: 315,
      sgst: 315,
      roundOff: 0,
      totalBillAmount: 4130,
      sourceType: "Walk-in",
      bookingAdvance: 1000,
      advanceDetails: "Cash Payment",
      enteredBy: "Reception Staff",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const filteredCheckIns = checkIns.filter((checkIn) => {
    const matchesSearch =
      checkIn.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkIn.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkIn.roomNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "All" || checkIn.bookingType === filterType;
    let matchesDate = true;
    if (startDate && endDate) {
      const arrivalDate = new Date(checkIn.arrivalDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Check if arrival date is between start and end date (inclusive)
      matchesDate = arrivalDate >= start && arrivalDate <= end;
    } else if (startDate) {
      const arrivalDate = new Date(checkIn.arrivalDate);
      const start = new Date(startDate);
      // Show arrivals from start date onwards
      matchesDate = arrivalDate >= start;
    } else if (endDate) {
      const arrivalDate = new Date(checkIn.arrivalDate);
      const end = new Date(endDate);
      // Show arrivals up to end date
      matchesDate = arrivalDate <= end;
    }

    return matchesSearch && matchesFilter && matchesDate;
  });

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        <TitleDiv title="Check In List" from="/sUsers/hotelDashBoard" />
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Search and Filter */}

          <div className="border-t pt-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Filter by Arrival Date:
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">From:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">To:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearDateFilter}
                  className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="All">All Types</option>
                  <option value="Online Booking">Online Booking</option>
                  <option value="Office Line Booking">
                    Office Line Booking
                  </option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(startDate || endDate) && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Active Date Filter: </span>
                <span>Showing arrivals </span>
                {startDate && <span>from {formatDate(startDate)} </span>}
                {endDate && <span>to {formatDate(endDate)}</span>}
                <span className="ml-2 text-blue-600">
                  ({filteredCheckouts.length} records found)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher No</th> */}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest Name
                  </th>
                  {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Address</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price List</th> */}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arrival Date
                  </th>
                  {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Time</th> */}
                  {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stay Days</th> */}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Checkout Date
                  </th>
                  {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checkout Time</th> */}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Type
                  </th>
                  {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Room List</th> */}
                  {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sl.No</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room No</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th> */}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. of Pax
                  </th>
                  {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extra Pax Type</th> */}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Extra Pax Rate
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Extra Pax Amount
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Extra Pax
                  </th>
                  {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th> */}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan Amount
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tariff Rate
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room Rent
                  </th>
                  {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disc %</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount Amount</th> */}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Food Plan Amount
                  </th>
                  {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGST</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SGST</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round Off</th> */}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Bill Amount
                  </th>
                  {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Type</th> */}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Advance
                  </th>
                  {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Advance Details</th> */}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entered By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCheckIns.map((checkIn, index) => (
                  <tr
                    key={checkIn.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(checkIn.date)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{checkIn.voucherNo}</td> */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {checkIn.guestName}
                    </td>
                    {/* <td className="px-3 py-4 text-sm text-gray-900 max-w-xs truncate" title={checkIn.guestAddress}>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {checkIn.guestAddress}
                      </div>
                    </td> */}
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{checkIn.priceListName}</td> */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(checkIn.arrivalDate)}
                    </td>
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        {checkIn.arrivalTime}
                      </div>
                    </td> */}
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{checkIn.stayDays}</td> */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(checkIn.checkoutDate)}
                    </td>
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        {checkIn.checkoutTime}
                      </div>
                    </td> */}
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          checkIn.bookingType === "Online Booking"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {checkIn.bookingType}
                      </span>
                    </td>
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{checkIn.availableRoomList}</td> */}
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{checkIn.slNo}</td> */}
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{checkIn.roomNo}</td> */}
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{checkIn.days}</td> */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {checkIn.noOfPax}
                    </td>
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{checkIn.extraPaxType}</td> */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(checkIn.extraPaxRate)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(checkIn.extraPaxAmount)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {checkIn.totalExtraPax}
                    </td>
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{checkIn.plan}</td> */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(checkIn.planAmount)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(checkIn.tarifRate)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatCurrency(checkIn.roomRent)}
                    </td>
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{checkIn.discPercent}%</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(checkIn.discountAmount)}</td> */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(checkIn.amount)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(checkIn.foodPlanAmount)}
                    </td>
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(checkIn.cgst)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(checkIn.sgst)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(checkIn.roundOff)}</td> */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">
                      {formatCurrency(checkIn.totalBillAmount)}
                    </td>
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{checkIn.sourceType}</td> */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(checkIn.bookingAdvance)}
                    </td>
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{checkIn.advanceDetails}</td> */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {checkIn.enteredBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredCheckIns.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center mt-6">
            <div className="text-gray-500 text-lg">
              No check-ins found matching your criteria.
            </div>
          </div>
        )}

        {/* Summary Cards */}
      </div>
    </div>
  );
};

export default CheckInList;
