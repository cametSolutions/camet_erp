import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, ChevronUp, Search, Filter, Download, 
  TrendingUp, TrendingDown, MoreHorizontal, Store,
  DollarSign, Receipt, Percent, FileText
} from 'lucide-react';

const TableSummary = ({ dashboardData, selectedDate }) => {
  const [sortField, setSortField] = useState('sales');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with actual outlet data from your API
  const mockOutletData = [
    {
      id: 1,
      outletName: "Zaatar Multicuisine Restaurant -Huskur Village",
      orders: 0,
      sales: 0.00,
      netSales: 0.00,
      tax: 0.00,
      discount: 0.00,
      modified: 0,
      rePrinted: 0,
      waivedOff: 0.00,
      roundOff: 0.00,
      charges: 0.00
    },
    {
      id: 2,
      outletName: "ZAATAR MULTICUISINE RESTAURANT- Bellandur",
      orders: 91,
      sales: 118313.00,
      netSales: 111785.82,
      tax: 5589.36,
      discount: 1770.18,
      modified: 0,
      rePrinted: 3,
      waivedOff: 0.00,
      roundOff: 10.03,
      charges: 927.79
    },
    {
      id: 3,
      outletName: "ZAATAR MULTICUISINE RESTAURANT- HEGDE NAGAR",
      orders: 56,
      sales: 88250.00,
      netSales: 82202.08,
      tax: 4201.80,
      discount: 799.92,
      modified: 0,
      rePrinted: 0,
      waivedOff: 0.00,
      roundOff: 3.92,
      charges: 1842.20
    },
    {
      id: 4,
      outletName: "ZAATAR MULTICUISINE RESTAURANT- KR PURAM",
      orders: 201,
      sales: 292564.00,
      netSales: 279640.15,
      tax: 10834.04,
      discount: 1140.85,
      modified: 0,
      rePrinted: 1,
      waivedOff: 0.00,
      roundOff: 0.00,
      charges: 2088.70
    }
  ];

  // Calculate totals
  const totals = useMemo(() => {
    return mockOutletData.reduce((acc, outlet) => {
      acc.orders += outlet.orders;
      acc.sales += outlet.sales;
      acc.netSales += outlet.netSales;
      acc.tax += outlet.tax;
      acc.discount += outlet.discount;
      acc.modified += outlet.modified;
      acc.rePrinted += outlet.rePrinted;
      acc.waivedOff += outlet.waivedOff;
      acc.roundOff += outlet.roundOff;
      acc.charges += outlet.charges;
      return acc;
    }, {
      orders: 0, sales: 0, netSales: 0, tax: 0, discount: 0,
      modified: 0, rePrinted: 0, waivedOff: 0, roundOff: 0, charges: 0
    });
  }, [mockOutletData]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = mockOutletData.filter(outlet =>
      outlet.outletName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [mockOutletData, searchTerm, sortField, sortDirection]);

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
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Filter className="text-white" size={16} />
            </button>
            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
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
                placeholder="Search outlets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
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
              <SortableHeader field="orders">Orders</SortableHeader>
              <SortableHeader field="sales">Sales</SortableHeader>
              <SortableHeader field="netSales">Net Sales</SortableHeader>
              <SortableHeader field="tax">Tax</SortableHeader>
              <SortableHeader field="discount">Discount</SortableHeader>
              <SortableHeader field="modified">Modified</SortableHeader>
              <SortableHeader field="rePrinted">Re-Printed</SortableHeader>
              <SortableHeader field="waivedOff">Waived Off</SortableHeader>
              <SortableHeader field="roundOff">Round Off</SortableHeader>
              <SortableHeader field="charges">Charges</SortableHeader>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
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
              <td className="px-3 py-4 whitespace-nowrap text-sm">{totals.orders}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{formatCurrency(totals.sales)}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{formatCurrency(totals.netSales)}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{formatCurrency(totals.tax)}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{formatCurrency(totals.discount)}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{totals.modified}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{totals.rePrinted}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{formatCurrency(totals.waivedOff)}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{formatCurrency(totals.roundOff)}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{formatCurrency(totals.charges)}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm"></td>
            </tr>

            {/* Data Rows */}
            {filteredAndSortedData.map((outlet) => (
              <tr key={outlet.id} className="hover:bg-gray-50 transition-colors">
                <td className="sticky left-0 bg-white hover:bg-gray-50 px-3 py-4 whitespace-nowrap text-sm z-10 border-r border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {outlet.outletName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 max-w-[250px] truncate">
                        {outlet.outletName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {outlet.orders > 0 ? `${outlet.orders} orders` : 'No orders'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-1">
                    {outlet.orders > 0 ? (
                      <TrendingUp size={12} className="text-green-500" />
                    ) : (
                      <TrendingDown size={12} className="text-gray-400" />
                    )}
                    {outlet.orders}
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
                  {outlet.modified > 0 ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      {outlet.modified}
                    </span>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                  {outlet.rePrinted > 0 ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {outlet.rePrinted}
                    </span>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(outlet.waivedOff)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(outlet.roundOff)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(outlet.charges)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-400">
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Showing {filteredAndSortedData.length} outlets</span>
            <span>•</span>
            <span>Total Revenue: {formatCurrency(totals.sales)}</span>
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