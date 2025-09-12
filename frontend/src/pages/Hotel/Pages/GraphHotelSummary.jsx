/* eslint-disable react/prop-types */
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,  PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, TrendingDown, Hotel, UtensilsCrossed, Calendar, 
  BarChart3, DollarSign, Activity, Target, ArrowUp, ArrowDown,
  RefreshCw, Maximize2, Minimize2
} from 'lucide-react';

const PerformanceGraphs = ({ dashboardData, selectedDate }) => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [viewMode, setViewMode] = useState('comparison'); // 'comparison', 'trend', 'breakdown'
  const [isExpanded, setIsExpanded] = useState(false);

  // Process data for charts
  const chartData = useMemo(() => {
    if (!dashboardData) return null;

    const { daily, monthly } = dashboardData;
    
    // Revenue comparison data
    const revenueData = [
      {
        name: 'Daily',
        Hotel: daily?.hotel?.totalSales || 0,
        Restaurant: daily?.restaurant?.totalSales || 0,
        Combined: daily?.combined?.totalSales || 0,
      },
      {
        name: 'Monthly',
        Hotel: monthly?.hotel?.totalSales || 0,
        Restaurant: monthly?.restaurant?.totalSales || 0,
        Combined: monthly?.combined?.totalSales || 0,
      }
    ];

    // Expense vs Revenue data
    const profitData = [
      {
        name: 'Hotel Daily',
        Revenue: daily?.hotel?.totalSales || 0,
        Expenses: daily?.hotel?.expense || 0,
        Profit: (daily?.hotel?.totalSales || 0) - (daily?.hotel?.expense || 0),
      },
      {
        name: 'Restaurant Daily',
        Revenue: daily?.restaurant?.totalSales || 0,
        Expenses: daily?.restaurant?.expense || 0,
        Profit: (daily?.restaurant?.totalSales || 0) - (daily?.restaurant?.expense || 0),
      },
      {
        name: 'Hotel Monthly',
        Revenue: monthly?.hotel?.totalSales || 0,
        Expenses: monthly?.hotel?.expense || 0,
        Profit: (monthly?.hotel?.totalSales || 0) - (monthly?.hotel?.expense || 0),
      },
      {
        name: 'Restaurant Monthly',
        Revenue: monthly?.restaurant?.totalSales || 0,
        Expenses: monthly?.restaurant?.expense || 0,
        Profit: (monthly?.restaurant?.totalSales || 0) - (monthly?.restaurant?.expense || 0),
      }
    ];

    // Payment methods data
    const paymentData = [
      {
        name: 'Hotel Daily',
        Cash: daily?.hotel?.cashReceipt || 0,
        Bank: daily?.hotel?.bankReceipt || 0,
        Credit: daily?.hotel?.creditAmount || 0,
      },
      {
        name: 'Restaurant Daily',
        Cash: daily?.restaurant?.cashReceipt || 0,
        Bank: daily?.restaurant?.bankReceipt || 0,
        Credit: daily?.restaurant?.creditAmount || 0,
      },
      {
        name: 'Hotel Monthly',
        Cash: monthly?.hotel?.cashReceipt || 0,
        Bank: monthly?.hotel?.bankReceipt || 0,
        Credit: monthly?.hotel?.creditAmount || 0,
      },
      {
        name: 'Restaurant Monthly',
        Cash: monthly?.restaurant?.cashReceipt || 0,
        Bank: monthly?.restaurant?.bankReceipt || 0,
        Credit: monthly?.restaurant?.creditAmount || 0,
      }
    ];

    // Business mix pie chart data
    const businessMixData = [
      {
        name: 'Hotel',
        value: daily?.hotel?.totalSales || 0,
        color: '#3B82F6'
      },
      {
        name: 'Restaurant',
        value: daily?.restaurant?.totalSales || 0,
        color: '#10B981'
      }
    ];

    return {
      revenue: revenueData,
      profit: profitData,
      payment: paymentData,
      businessMix: businessMixData
    };
  }, [dashboardData]);

  // Calculate growth metrics
  const growthMetrics = useMemo(() => {
    if (!dashboardData) return null;

    const { daily, monthly } = dashboardData;
    
    // Calculate average daily revenue from monthly data
    const avgDailyFromMonthly = {
      hotel: (monthly?.hotel?.totalSales || 0) / 30,
      restaurant: (monthly?.restaurant?.totalSales || 0) / 30,
    };

    const hotelGrowth = avgDailyFromMonthly.hotel !== 0 
      ? ((daily?.hotel?.totalSales || 0) - avgDailyFromMonthly.hotel) / avgDailyFromMonthly.hotel * 100
      : 0;

    const restaurantGrowth = avgDailyFromMonthly.restaurant !== 0
      ? ((daily?.restaurant?.totalSales || 0) - avgDailyFromMonthly.restaurant) / avgDailyFromMonthly.restaurant * 100
      : 0;

    return {
      hotel: hotelGrowth,
      restaurant: restaurantGrowth,
    };
  }, [dashboardData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const tabs = [
    { id: 'revenue', label: 'Revenue Analysis', icon: DollarSign },
    { id: 'profit', label: 'Profit Analysis', icon: TrendingUp },
    { id: 'payment', label: 'Payment Methods', icon: BarChart3 },
    { id: 'mix', label: 'Business Mix', icon: Activity },
  ];

  const renderChart = () => {
    if (!chartData) return null;

    switch (activeTab) {
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.revenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Hotel" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Restaurant" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Combined" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'profit':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.profit} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6B7280', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Revenue" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Expenses" fill="#EF4444" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Profit" fill="#10B981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'payment':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.payment} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6B7280', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Cash" fill="#F59E0B" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Bank" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Credit" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'mix':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Revenue Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.businessMix}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.businessMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Performance Metrics</h3>
              
              {/* Hotel Performance */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Hotel className="text-blue-600" size={20} />
                    <span className="font-semibold text-blue-800">Hotel Performance</span>
                  </div>
                  <div className={`flex items-center gap-1 ${growthMetrics?.hotel >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {growthMetrics?.hotel >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    <span className="text-sm font-semibold">
                      {Math.abs(growthMetrics?.hotel || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Daily: {formatCurrency(dashboardData?.daily?.hotel?.totalSales || 0)}</p>
                  <p>Monthly: {formatCurrency(dashboardData?.monthly?.hotel?.totalSales || 0)}</p>
                </div>
              </div>

              {/* Restaurant Performance */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="text-green-600" size={20} />
                    <span className="font-semibold text-green-800">Restaurant Performance</span>
                  </div>
                  <div className={`flex items-center gap-1 ${growthMetrics?.restaurant >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {growthMetrics?.restaurant >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    <span className="text-sm font-semibold">
                      {Math.abs(growthMetrics?.restaurant || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Daily: {formatCurrency(dashboardData?.daily?.restaurant?.totalSales || 0)}</p>
                  <p>Monthly: {formatCurrency(dashboardData?.monthly?.restaurant?.totalSales || 0)}</p>
                </div>
              </div>

              {/* Key Insights */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">Key Insights</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Best Performer: {(dashboardData?.daily?.hotel?.totalSales || 0) > (dashboardData?.daily?.restaurant?.totalSales || 0) ? 'Hotel' : 'Restaurant'}</p>
                  <p>• Total Daily Revenue: {formatCurrency(dashboardData?.daily?.combined?.totalSales || 0)}</p>
                  <p>• Total Monthly Revenue: {formatCurrency(dashboardData?.monthly?.combined?.totalSales || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!dashboardData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-500">No data available for charts</p>
          </div>
        </div>
      </div>
    );
  }
console.log(dashboardData)
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <BarChart3 className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Performance Analytics</h2>
              <p className="text-white/80 text-sm">Hotel & Restaurant Growth Analysis</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            {isExpanded ? <Minimize2 className="text-white" size={16} /> : <Maximize2 className="text-white" size={16} />}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Content */}
      <div className={`p-6 ${isExpanded ? 'min-h-[600px]' : ''}`}>
        {renderChart()}
      </div>

      {/* Footer with summary stats */}
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Hotel Daily</p>
            <p className="text-sm font-bold text-gray-900">{formatCurrency(dashboardData?.daily?.hotel?.totalSales || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Restaurant Daily</p>
            <p className="text-sm font-bold text-gray-900">{formatCurrency(dashboardData?.daily?.restaurant?.totalSales || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Daily</p>
            <p className="text-sm font-bold text-indigo-600">{formatCurrency(dashboardData?.daily?.combined?.totalSales || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Monthly</p>
            <p className="text-sm font-bold text-purple-600">{formatCurrency(dashboardData?.monthly?.combined?.totalSales || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceGraphs;





















































































