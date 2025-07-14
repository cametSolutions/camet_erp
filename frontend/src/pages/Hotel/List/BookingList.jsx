import React, { useState } from 'react';
import { Calendar, Search, Filter, Download,CalendarDays } from 'lucide-react';

const BookingList = () => {
  // Sample booking data
  const [bookings] = useState([
    {
      id: 1,
      date: '2024-07-10',
      bookingNo: 'BK001',
      guestName: 'John Smith',
      arrivalDate: '2024-07-15',
      checkoutDate: '2024-07-18',
      stayDays: 3,
      roomNo: '101',
      noOfPax: 2,
      roomRent: 5000,
      extraPaxAmount: 0,
      totalBillAmount: 5900,
      bookingAdvance: 2000,
      cgst: 450,
      sgst: 450,
      discountAmount: 0,
      bookingType: 'Online Booking',
      foodPlanAmount: 0,
      sourceType: 'Website'
    },
    {
      id: 2,
      date: '2024-07-11',
      bookingNo: 'BK002',
      guestName: 'Sarah Johnson',
      arrivalDate: '2024-07-20',
      checkoutDate: '2024-07-23',
      stayDays: 3,
      roomNo: '205',
      noOfPax: 4,
      roomRent: 7500,
      extraPaxAmount: 1000,
      totalBillAmount: 10030,
      bookingAdvance: 3000,
      cgst: 765,
      sgst: 765,
      discountAmount: 0,
      bookingType: 'Office Line Booking',
      foodPlanAmount: 1500,
      sourceType: 'Phone'
    },
    {
      id: 3,
      date: '2024-07-12',
      bookingNo: 'BK003',
      guestName: 'Michael Brown',
      arrivalDate: '2024-07-25',
      checkoutDate: '2024-07-27',
      stayDays: 2,
      roomNo: '302',
      noOfPax: 2,
      roomRent: 4000,
      extraPaxAmount: 0,
      totalBillAmount: 4720,
      bookingAdvance: 1500,
      cgst: 360,
      sgst: 360,
      discountAmount: 200,
      bookingType: 'Online Booking',
      foodPlanAmount: 800,
      sourceType: 'App'
    },
    {
      id: 4,
      date: '2024-07-13',
      bookingNo: 'BK004',
      guestName: 'Emily Davis',
      arrivalDate: '2024-08-01',
      checkoutDate: '2024-08-05',
      stayDays: 4,
      roomNo: '107',
      noOfPax: 3,
      roomRent: 8000,
      extraPaxAmount: 500,
      totalBillAmount: 10030,
      bookingAdvance: 4000,
      cgst: 765,
      sgst: 765,
      discountAmount: 0,
      bookingType: 'Online Booking',
      foodPlanAmount: 1200,
      sourceType: 'Website'
    },
    {
      id: 5,
      date: '2024-07-14',
      bookingNo: 'BK005',
      guestName: 'Robert Wilson',
      arrivalDate: '2024-08-10',
      checkoutDate: '2024-08-12',
      stayDays: 2,
      roomNo: '201',
      noOfPax: 2,
      roomRent: 3500,
      extraPaxAmount: 0,
      totalBillAmount: 4130,
      bookingAdvance: 1000,
      cgst: 315,
      sgst: 315,
      discountAmount: 0,
      bookingType: 'Office Line Booking',
      foodPlanAmount: 0,
      sourceType: 'Walk-in'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.bookingNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || booking.bookingType === filterType;
  
    let matchesDate = true;
    if (startDate && endDate) {
      const arrivalDate = new Date(checkout.arrivalDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Check if arrival date is between start and end date (inclusive)
      matchesDate = arrivalDate >= start && arrivalDate <= end;
    } else if (startDate) {
      const arrivalDate = new Date(checkout.arrivalDate);
      const start = new Date(startDate);
      // Show arrivals from start date onwards
      matchesDate = arrivalDate >= start;
    } else if (endDate) {
      const arrivalDate = new Date(checkout.arrivalDate);
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
    return new Date(dateString).toLocaleDateString('en-IN');
  };


    const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };


  const setQuickDateFilter = (days) => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);
    
    setStartDate(pastDate.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-blue-600" />
              Hotel Booking Table
            </h1>
           
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by guest name or booking number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Types</option>
                <option value="Online Booking">Online Booking</option>
                <option value="Office Line Booking">Office Line Booking</option>
              </select>
            </div>
          </div>

           <div className="border-t pt-4">
                                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                    <div className="flex items-center gap-2">
                                      <CalendarDays className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm font-medium text-gray-700">Filter by Arrival Date:</span>
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
                                  </div>
                                  
                                  {/* Active Filters Display */}
                                  {(startDate || endDate) && (
                                    <div className="mt-2 text-sm text-gray-600">
                                      <span className="font-medium">Active Date Filter: </span>
                                      <span>Showing arrivals </span>
                                      {startDate && <span>from {formatDate(startDate)} </span>}
                                      {endDate && <span>to {formatDate(endDate)}</span>}
                                      <span className="ml-2 text-blue-600">({filteredCheckouts.length} records found)</span>
                                    </div>
                                  )}
                                </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checkout Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stay Days</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. of Pax</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Rent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extra Pax Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bill Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Advance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGST</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SGST</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food Plan Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking, index) => (
                  <tr key={booking.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(booking.date)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{booking.bookingNo}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{booking.guestName}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(booking.arrivalDate)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(booking.checkoutDate)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{booking.stayDays}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{booking.roomNo}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{booking.noOfPax}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(booking.roomRent)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(booking.extraPaxAmount)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">{formatCurrency(booking.totalBillAmount)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(booking.bookingAdvance)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(booking.cgst)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(booking.sgst)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(booking.discountAmount)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        booking.bookingType === 'Online Booking' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.bookingType}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(booking.foodPlanAmount)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{booking.sourceType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredBookings.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center mt-6">
            <div className="text-gray-500 text-lg">No bookings found matching your criteria.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingList;