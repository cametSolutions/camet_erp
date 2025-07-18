import React, { useState } from 'react';
import { Calendar, Search, Filter, UserX, Clock, MapPin, CreditCard, History, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TitleDiv from '@/components/common/TitleDiv';
const CheckoutList = () => {
  const navigate=useNavigate()
  // Sample checkout data with all required fields
  const [checkouts] = useState([
    {
      id: 1,
      date: '2024-07-18',
      checkoutNo: 'CO001',
      guestName: 'John Smith',
      guestAddress: '123 Main St, Mumbai, Maharashtra 400001',
      priceListName: 'Standard Rate',
      arrivalDate: '2024-07-15',
      arrivalTime: '14:00',
      stayDays: 3,
      checkoutDate: '2024-07-18',
      checkoutTime: '12:00',
      bookingType: 'Online Booking',
      slNo: 1,
      roomNo: '101',
      days: 3,
      noOfPax: 2,
      extraPaxType: 'N/A',
      extraPaxRate: 0,
      extraPaxAmount: 0,
      totalExtraPax: 0,
      plan: 'Room Only',
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
      sourceType: 'Website',
      checkoutAmount: 5900,
      checkoutDetails: 'Card Payment - Visa ****1234',
      guestHistory: '2nd Visit - Previous stay: Jan 2024',
      balanceSettlement: 0,
      enteredBy: 'Reception Staff'
    },
    {
      id: 2,
      date: '2024-07-23',
      checkoutNo: 'CO002',
      guestName: 'Sarah Johnson',
      guestAddress: '456 Oak Ave, Delhi, Delhi 110001',
      priceListName: 'Premium Rate',
      arrivalDate: '2024-07-20',
      arrivalTime: '15:30',
      stayDays: 3,
      checkoutDate: '2024-07-23',
      checkoutTime: '11:00',
      bookingType: 'Office Line Booking',
      slNo: 2,
      roomNo: '205',
      days: 3,
      noOfPax: 4,
      extraPaxType: 'Adult',
      extraPaxRate: 500,
      extraPaxAmount: 1000,
      totalExtraPax: 2,
      plan: 'MAP',
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
      sourceType: 'Phone',
      checkoutAmount: 7030,
      checkoutDetails: 'Cash Payment + Room Service ₹500',
      guestHistory: 'Regular Customer - 5 previous stays',
      balanceSettlement: 0,
      enteredBy: 'Manager'
    },
    {
      id: 3,
      date: '2024-07-27',
      checkoutNo: 'CO003',
      guestName: 'Michael Brown',
      guestAddress: '789 Pine Rd, Bangalore, Karnataka 560001',
      priceListName: 'Corporate Rate',
      arrivalDate: '2024-07-25',
      arrivalTime: '16:00',
      stayDays: 2,
      checkoutDate: '2024-07-27',
      checkoutTime: '10:30',
      bookingType: 'Online Booking',
      slNo: 3,
      roomNo: '302',
      days: 2,
      noOfPax: 2,
      extraPaxType: 'N/A',
      extraPaxRate: 0,
      extraPaxAmount: 0,
      totalExtraPax: 0,
      plan: 'CP',
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
      sourceType: 'App',
      checkoutAmount: 3220,
      checkoutDetails: 'UPI Payment - GPay',
      guestHistory: 'New Customer - First visit',
      balanceSettlement: 0,
      enteredBy: 'Reception Staff'
    },
    {
      id: 4,
      date: '2024-08-05',
      checkoutNo: 'CO004',
      guestName: 'Emily Davis',
      guestAddress: '321 Cedar St, Chennai, Tamil Nadu 600001',
      priceListName: 'Weekend Rate',
      arrivalDate: '2024-08-01',
      arrivalTime: '13:45',
      stayDays: 4,
      checkoutDate: '2024-08-05',
      checkoutTime: '12:00',
      bookingType: 'Online Booking',
      slNo: 4,
      roomNo: '107',
      days: 4,
      noOfPax: 3,
      extraPaxType: 'Child',
      extraPaxRate: 250,
      extraPaxAmount: 500,
      totalExtraPax: 1,
      plan: 'AP',
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
      sourceType: 'Website',
      checkoutAmount: 6030,
      checkoutDetails: 'Net Banking + Mini Bar ₹800',
      guestHistory: 'VIP Customer - 3 previous stays',
      balanceSettlement: 0,
      enteredBy: 'Admin User'
    },
    {
      id: 5,
      date: '2024-08-12',
      checkoutNo: 'CO005',
      guestName: 'Robert Wilson',
      guestAddress: '654 Elm St, Pune, Maharashtra 411001',
      priceListName: 'Standard Rate',
      arrivalDate: '2024-08-10',
      arrivalTime: '17:30',
      stayDays: 2,
      checkoutDate: '2024-08-12',
      checkoutTime: '11:30',
      bookingType: 'Office Line Booking',
      slNo: 5,
      roomNo: '201',
      days: 2,
      noOfPax: 2,
      extraPaxType: 'N/A',
      extraPaxRate: 0,
      extraPaxAmount: 0,
      totalExtraPax: 0,
      plan: 'Room Only',
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
      sourceType: 'Walk-in',
      checkoutAmount: 3130,
      checkoutDetails: 'Cash Payment',
      guestHistory: 'Business Traveler - 2 previous stays',
      balanceSettlement: 0,
      enteredBy: 'Reception Staff'
    },
    {
      id: 6,
      date: '2024-08-15',
      checkoutNo: 'CO006',
      guestName: 'Lisa Anderson',
      guestAddress: '987 Maple Ave, Kolkata, West Bengal 700001',
      priceListName: 'Deluxe Rate',
      arrivalDate: '2024-08-12',
      arrivalTime: '14:30',
      stayDays: 3,
      checkoutDate: '2024-08-15',
      checkoutTime: '11:45',
      bookingType: 'Online Booking',
      slNo: 6,
      roomNo: '304',
      days: 3,
      noOfPax: 2,
      extraPaxType: 'N/A',
      extraPaxRate: 0,
      extraPaxAmount: 0,
      totalExtraPax: 0,
      plan: 'MAP',
      planAmount: 1200,
      tarifRate: 2200,
      roomRent: 6600,
      discPercent: 10,
      discountAmount: 660,
      amount: 5940,
      foodPlanAmount: 1200,
      cgst: 643,
      sgst: 643,
      roundOff: 26,
      totalBillAmount: 8452,
      sourceType: 'Website',
      checkoutAmount: 8452,
      checkoutDetails: 'Card Payment - Amex ****5678',
      guestHistory: 'Loyalty Member - 8 previous stays',
      balanceSettlement: 0,
      enteredBy: 'Manager'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredCheckouts = checkouts.filter(checkout => {
    const matchesSearch = checkout.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checkout.checkoutNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checkout.roomNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'All' || checkout.bookingType === filterType;
    
    // Date filtering: Show checkouts where arrival date is between from date and to date
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

  const getStatusColor = (balanceSettlement) => {
    if (balanceSettlement === 0) return 'bg-green-100 text-green-800';
    if (balanceSettlement > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (balanceSettlement) => {
    if (balanceSettlement === 0) return 'Settled';
    if (balanceSettlement > 0) return 'Refund Due';
    return 'Balance Due';
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };

 

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        {/* Header */}

        <TitleDiv
          title="Check Out List"
          from="/sUsers/hotelDashBoard"
                            />
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
         

          {/* Search and Filter */}
          
          
            
            {/* Date Filter Section */}
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
                 <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="All">All Types</option>
                  <option value="Online Booking">Online Booking</option>
                  <option value="Office Line Booking">Office Line Booking</option>
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
                  <span className="ml-2 text-blue-600">({filteredCheckouts.length} records found)</span>
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
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checkout Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Type</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. of Pax</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extra Pax Rate</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extra Pax Amount</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Extra Pax</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Amount</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Rent</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bill Amount</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checkout Amount</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Settlement</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entered By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCheckouts.map((checkout, index) => (
                  <tr key={checkout.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{checkout.guestName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(checkout.arrivalDate)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(checkout.checkoutDate)}</td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        checkout.bookingType === 'Online Booking' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {checkout.bookingType}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{checkout.noOfPax}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(checkout.extraPaxRate)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(checkout.extraPaxAmount)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{checkout.totalExtraPax}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(checkout.planAmount)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(checkout.roomRent)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatCurrency(checkout.amount)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">{formatCurrency(checkout.totalBillAmount)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {formatCurrency(checkout.checkoutAmount)}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(checkout.balanceSettlement)}`}>
                        {getStatusText(checkout.balanceSettlement)}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{checkout.enteredBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredCheckouts.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center mt-6">
            <div className="text-gray-500 text-lg">No checkouts found matching your criteria.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutList;