import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from "@/api/api";
import { 
  ChevronDown, ChevronUp, Search, Filter, Download, 
  TrendingUp, TrendingDown, MoreHorizontal, Store,
  DollarSign, Receipt, Percent, FileText, Loader2, AlertCircle
} from 'lucide-react';

const TableSummary = ({ dashboardData, selectedDate }) => {
  const [sortField, setSortField] = useState('sales');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [outletData, setOutletData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get company ID and owner info from Redux state
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const owner = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.owner
  );
  const organizationInfo = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  // Fetch outlet data from API
  const fetchOutletData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        cmp_id,
        date: selectedDate,
        owner,
        includeOutlets: 'true', // This tells the API to include outlet data
        groupBy: 'outlet'
      };

      const response = await api.get('/api/sUsers/summary', { params });
      
      if (response.data.success && response.data.data.outlets) {
        // Use the outlet data from the combined API response
        setOutletData(response.data.data.outlets.data || []);
        console.log('Outlet data loaded:', response.data.data.outlets.data);
      } else {
        console.log('No outlet data in response, using empty array');
        setOutletData([]);
      }
    } catch (err) {
      console.error('Outlet data fetch error:', err);
      setError(err.message);
      setOutletData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cmp_id && selectedDate && owner) {
      fetchOutletData();
    }
  }, [cmp_id, selectedDate, owner]);

  // Calculate totals from real outlet data
  const totals = useMemo(() => {
   
    return outletData.reduce((acc, outlet) => {
      acc.orders += outlet.orders || 0;
      acc.sales += outlet.sales || 0;
      acc.netSales += outlet.netSales || 0;
      acc.tax += outlet.tax || 0;
      acc.discount += outlet.discount || 0;
      acc.modified += outlet.modified || 0;
      acc.rePrinted += outlet.rePrinted || 0;
      acc.waivedOff += outlet.cashReceipt || 0;
      acc.roundOff += outlet.bankReceipt || 0;
      // acc.charges += outlet.charges || 0;
      return acc;
    }, {
      orders: 0, sales: 0, netSales: 0, tax: 0, discount: 0,
      modified: 0, rePrinted: 0, cashReceipt: 0, bankReceipt: 0
    });
  }, [outletData]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = outletData.filter(outlet =>
      outlet.outletName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      outlet.organizationName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aVal = a[sortField] || 0;
      const bVal = b[sortField] || 0;
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [outletData, searchTerm, sortField, sortDirection]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleRefresh = () => {
    fetchOutletData();
  };
  console.log(totals)
  const SortableHeader = ({ field, children, className = "" }) => (
    <th 
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
          <ChevronUp size={12} className="text-blue-600" /> : 
          <ChevronDown size={12} className="text-blue-600" />
        )}
      </div>
    </th>
  );

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Store className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Outlet Wise Statistics</h2>
                <p className="text-white/80 text-sm">Loading outlet data...</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <span className="text-gray-600">Loading outlet statistics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Store className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Outlet Wise Statistics</h2>
              <p className="text-white/80 text-sm">Performance breakdown by outlet location</p>
              {organizationInfo && (
                <p className="text-white/70 text-xs">Organization: {organizationInfo.name}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Filter className="text-white" size={16} />
            </button>
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <Download className="text-white" size={16} />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        {showFilters && (
          <div className="mt-4 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={16} />
              <input
                type="text"
                placeholder="Search outlets or organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-3 bg-red-500/20 border border-red-300/30 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="text-white" size={16} />
            <p className="text-white text-sm">Error: {error}</p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader field="outletName" className="sticky left-0 bg-gray-50 z-10 min-w-[300px]">
                Outlet Name
              </SortableHeader>
              {/* <SortableHeader field="organizationName">Organization</SortableHeader> */}
              <SortableHeader field="orders">Orders</SortableHeader>
              <SortableHeader field="sales">Sales</SortableHeader>
              <SortableHeader field="netSales">Net Sales</SortableHeader>
              <SortableHeader field="tax">Tax</SortableHeader>
              <SortableHeader field="discount">Discount</SortableHeader>
              <SortableHeader field="modified">Modified</SortableHeader>
              <SortableHeader field="rePrinted">Re-Printed</SortableHeader>
              <SortableHeader field="waivedOff">Cash Reciept</SortableHeader>
              <SortableHeader field="roundOff">Bank Reciept</SortableHeader>
              {/* <SortableHeader field="charges">Charges</SortableHeader> */}
              {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Totals Row */}
            <tr className="bg-blue-50 font-semibold text-gray-900">
              <td className="sticky left-0 bg-blue-50 px-3 py-4 whitespace-nowrap text-sm z-10">
                <div className="flex items-center gap-2">
                  <Receipt size={16} className="text-blue-600" />
                  <span className="font-bold">Total</span>
                </div>
              </td>
              {/* <td className="px-3 py-4 whitespace-nowrap text-sm">-</td> */}
              <td className="px-3 py-4 whitespace-nowrap text-sm">{totals.orders}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{formatCurrency(totals.sales)}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{formatCurrency(totals.netSales)}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{formatCurrency(totals.tax)}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{formatCurrency(totals.discount)}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{totals.modified}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{totals.rePrinted}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{formatCurrency(totals.cashReceipt)}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{formatCurrency(totals.bankReceipt)}</td>
              {/* <td className="px-3 py-4 whitespace-nowrap text-sm">{formatCurrency(totals.charges)}</td> */}
              {/* <td className="px-3 py-4 whitespace-nowrap text-sm"></td> */}
            </tr>

            {/* Data Rows */}
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((outlet, index) => (
                <tr key={outlet.id || outlet.organizationId || index} className="hover:bg-gray-50 transition-colors">
                  <td className="sticky left-0 bg-white hover:bg-gray-50 px-3 py-4 whitespace-nowrap text-sm z-10 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {outlet.organizationName?.charAt(0) || 'O'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 max-w-[250px] truncate" title={outlet.outletName}>
                          {outlet.organizationName || 'Unknown Outlet'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(outlet.orders || 0) > 0 ? `${outlet.orders} orders` : 'No orders'}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="max-w-[150px] truncate" title={outlet.organizationName}>
                      {outlet.organizationName || '-'}
                    </div>
                  </td> */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      {(outlet.orders || 0) > 0 ? (
                        <TrendingUp size={12} className="text-green-500" />
                      ) : (
                        <TrendingDown size={12} className="text-gray-400" />
                      )}
                      {outlet.orders || 0}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(outlet.sales)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(outlet.netSales)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(outlet.tax)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(outlet.discount)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                    {(outlet.modified || 0) > 0 ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        {outlet.modified}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                    {(outlet.rePrinted || 0) > 0 ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {outlet.rePrinted}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(outlet.cashReceipt)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(outlet.bankReceipt)}
                  </td>
                  {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(outlet.charges)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-400">
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <MoreHorizontal size={16} />
                    </button> */}
                  {/* </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" className="px-3 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Store size={48} className="text-gray-300" />
                    <p className="text-lg font-medium">No outlet data found</p>
                    <p className="text-sm">
                      {error 
                        ? 'There was an error loading the data. Please try refreshing.' 
                        : 'No sales data available for the selected date and criteria.'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Showing {filteredAndSortedData.length} outlets</span>
            {totals.sales > 0 && (
              <>
                <span>•</span>
                <span>Total Revenue: {formatCurrency(totals.sales)}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSummary;