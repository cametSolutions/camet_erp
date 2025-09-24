import { useState, useEffect } from 'react';
import api from "@/api/api";// Adjust the path according to your project structure
import { useSelector } from 'react-redux';
const billSummary = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [reportPeriod, setReportPeriod] = useState('');
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalDiscount: 0,
    totalCgst: 0,
    totalSgst: 0,
    totalIgst: 0,
    totalCash: 0,
    totalCredit: 0,
    totalFinalAmount: 0,
    totalRoundOff: 0
  });

  // Replace with your actual company ID
const cmp_id = useSelector(
  (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const owner = useSelector(
  (state) => state.secSelectedOrganization.secSelectedOrg
  );
  // Replace with actual company ID

  // Assuming you have an api instance imported like: import api from '../services/api';
  // If you don't have it, create it or import axios directly

  const updateDateTime = () => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-GB') + ' ' + 
                    now.toTimeString().split(' ')[0];
    setCurrentDateTime(formatted);
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchSalesData = async (start = startDate, end = endDate) => {
    if (!start || !end) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(start) > new Date(end)) {
      setError('Start date cannot be later than end date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const salesParams = {
        startDate: start,
        endDate: end,
        
        owner,
      };

      // Using your API pattern: api.get('/api/endpoint', { params: paramsObject })
      const response = await api.get(`/api/sUsers/hotel/${cmp_id}`, { 
        params: salesParams 
      });
      
      // Assuming response structure: response.data contains the actual data
      const result = response.data;
      
      if (result.success) {
        setSalesData(result.data.sales || []);
        setSummary(result.data.summary || {});
        
        const formattedStart = formatDateForDisplay(start);
        const formattedEnd = formatDateForDisplay(end);
        setReportPeriod(`${formattedStart} To ${formattedEnd}`);
        updateDateTime();
      } else {
        setError(result.message || 'Failed to fetch sales data');
      }
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError(
        err.response?.data?.message || 
        'Failed to fetch sales data. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    await fetchSalesData();
  };

  // Calculate totals from the current salesData for display consistency
  const totals = salesData.reduce((acc, item) => ({
    amount: acc.amount + (item.amount || 0),
    disc: acc.disc + (item.disc || 0),
    roundOff: acc.roundOff + (item.roundOff || 0),
    total: acc.total + (item.total || 0),
    cgst: acc.cgst + (item.cgst || 0),
    sgst: acc.sgst + (item.sgst || 0),
    igst: acc.igst + (item.igst || 0),
    totalWithTax: acc.totalWithTax + (item.totalWithTax || 0),
    cash: acc.cash + (item.cash || 0),
    credit: acc.credit + (item.credit || 0)
  }), { amount: 0, disc: 0, roundOff: 0, total: 0, cgst: 0, sgst: 0, igst: 0, totalWithTax: 0, cash: 0, credit: 0 });

  useEffect(() => {
    // Initialize with current date and fetch initial data
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    
    // Fetch data for today on component mount
    const initializeData = async () => {
      await fetchSalesData(today, today);
    };
    
    initializeData();
  }, []);

  // Auto-fetch data when dates change (optional - remove if you want manual control)
  useEffect(() => {
    if (startDate && endDate && startDate !== '' && endDate !== '') {
      const timeoutId = setTimeout(() => {
        fetchSalesData();
      }, 500); // Debounce API calls
      
      return () => clearTimeout(timeoutId);
    }
  }, [startDate, endDate]);

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-4xl mx-auto bg-white p-5 rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-3 mb-5">
          <div className="text-lg font-bold mb-1">KGEES - HILLTOWN HOTEL</div>
          <div className="text-xs text-gray-600">Erattayar Road, Kattappana</div>
          <div className="text-sm mt-2">Sales Register of the Outlet Room Service</div>
        </div>

        {/* Date Controls */}
        <div className="bg-gray-50 p-4 rounded-md mb-5 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="font-bold text-sm">From Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded text-sm"
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-bold text-sm">To Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded text-sm"
              disabled={loading}
            />
          </div>
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded font-bold text-sm transition-colors"
          >
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading sales data...</p>
          </div>
        )}

        {/* Report Info */}
        <div className="flex justify-between mb-4 text-xs">
          <div>For the Period <span className="font-medium">{reportPeriod}</span></div>
          <div>Print Date & Time: <span className="font-bold text-blue-600">{currentDateTime}</span></div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto mb-5">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-t border-l border-black p-2 text-center font-bold">Bill No</th>
                <th className="border-t border-black p-2 text-center font-bold">Amount</th>
                <th className="border-t border-black p-2 text-center font-bold">Disc</th>
                <th className="border-t border-black p-2 text-center font-bold">Round off</th>
                <th className="border-t border-black p-2 text-center font-bold">Total</th>
                <th className="border-t border-black p-2 text-center font-bold">CGST</th>
                <th className="border-t border-black p-2 text-center font-bold">SGST</th>
                <th className="border-t border-black p-2 text-center font-bold">IGST</th>
                <th className="border-t border-black p-2 text-center font-bold">Total</th>
                <th className="border-t border-black p-2 text-center font-bold">Cash</th>
                <th className="border-t border-black p-2 text-center font-bold">Credit</th>
                <th className="border-t border-r border-black p-2 text-center font-bold">Credit Description</th>
              </tr>
            </thead>
            <tbody>
              {!loading && salesData.length === 0 ? (
                <tr>
                  <td colSpan="12" className="border border-black p-4 text-center text-gray-500">
                    No sales data found for the selected period
                  </td>
                </tr>
              ) : (
                salesData.map((row, index) => (
                  <tr key={index}>
                    <td className="border border-black p-2 text-left pl-3">{row.billNo}</td>
                    <td className="border border-black p-2 text-right pr-3">{(row.amount || 0).toFixed(2)}</td>
                    <td className="border border-black p-2 text-center">{(row.disc || 0).toFixed(2)}</td>
                    <td className="border border-black p-2 text-center">{row.roundOff || 0}</td>
                    <td className="border border-black p-2 text-center">{(row.total || 0).toFixed(2)}</td>
                    <td className="border border-black p-2 text-center">{(row.cgst || 0).toFixed(2)}</td>
                    <td className="border border-black p-2 text-center">{(row.sgst || 0).toFixed(2)}</td>
                    <td className="border border-black p-2 text-center">{(row.igst || 0).toFixed(2)}</td>
                    <td className="border border-black p-2 text-center">{(row.totalWithTax || 0).toFixed(2)}</td>
                    <td className="border border-black p-2 text-center">{row.cash > 0 ? (row.cash || 0).toFixed(2) : '-'}</td>
                    <td className="border border-black p-2 text-center">{row.credit > 0 ? (row.credit || 0) : '-'}</td>
                    <td className="border border-black p-2 text-center">{row.creditDescription || '-'}</td>
                  </tr>
                ))
              )}
              {/* Totals Row */}
              {salesData.length > 0 && (
                <tr className="border-t-2 border-black font-bold">
                  <td className="border border-black p-2 text-left pl-3">Total</td>
                  <td className="border border-black p-2 text-right pr-3">{totals.amount.toFixed(2)}</td>
                  <td className="border border-black p-2 text-center">{totals.disc.toFixed(2)}</td>
                  <td className="border border-black p-2 text-center">{totals.roundOff}</td>
                  <td className="border border-black p-2 text-center">{totals.total.toFixed(2)}</td>
                  <td className="border border-black p-2 text-center">{totals.cgst.toFixed(2)}</td>
                  <td className="border border-black p-2 text-center">{totals.sgst.toFixed(2)}</td>
                  <td className="border border-black p-2 text-center">{totals.igst.toFixed(2)}</td>
                  <td className="border border-black p-2 text-center">{totals.totalWithTax.toFixed(2)}</td>
                  <td className="border border-black p-2 text-center">{totals.cash.toFixed(2)}</td>
                  <td className="border border-black p-2 text-center">{totals.credit.toFixed(2)}</td>
                  <td className="border border-black p-2 text-center">-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        {salesData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <div className="text-xs">
              <table className="w-full">
                <tbody>
                  <tr><td className="font-bold py-1">Gross Amount</td><td className="text-right py-1">{totals.amount.toFixed(2)}</td></tr>
                  <tr><td className="font-bold py-1">Discount</td><td className="text-right py-1">{totals.disc.toFixed(2)}</td></tr>
                  <tr><td className="font-bold py-1">CGST</td><td className="text-right py-1">{totals.cgst.toFixed(2)}</td></tr>
                  <tr><td className="font-bold py-1">SGST</td><td className="text-right py-1">{totals.sgst.toFixed(2)}</td></tr>
                  <tr><td className="font-bold py-1">IGST</td><td className="text-right py-1">{totals.igst.toFixed(2)}</td></tr>
                  <tr><td className="font-bold py-1">Total</td><td className="text-right py-1">{totals.totalWithTax.toFixed(2)}</td></tr>
                  <tr><td className="font-bold py-1">Net Cash</td><td className="text-right py-1">{totals.cash.toFixed(2)}</td></tr>
                  <tr><td className="font-bold py-1">Round off</td><td className="text-right py-1">{totals.roundOff}</td></tr>
                  <tr><td className="font-bold py-1">Credit Amount</td><td className="text-right py-1">{totals.credit.toFixed(2)}</td></tr>
                  <tr><td className="font-bold py-1">Credit Card</td><td className="text-right py-1">0</td></tr>
                  <tr><td className="font-bold py-1">RoomCredit</td><td className="text-right py-1">{totals.credit.toFixed(2)}</td></tr>
                  <tr className="border-t-2 border-black">
                    <td className="font-bold py-1 text-sm">Net Sale</td>
                    <td className="text-right py-1 font-bold text-sm">{totals.totalWithTax.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Note */}
        <div className="text-xs italic text-gray-600 mt-3">
          * Complimentary Sales not included in Total Sales
        </div>
      </div>
    </div>
  );
};

export default billSummary;