/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from "@/api/api";// Adjust the import path according to your project structure
import GraphHotelSummary from '../../Hotel/Pages/GraphHotelSummary'
import { 
  Calendar, Hotel, UtensilsCrossed, TrendingUp, DollarSign, CreditCard, 
  Banknote, Wallet, PiggyBank, Receipt, BarChart3, ArrowUpRight, 
  ArrowDownRight, Target, Clock, Users, Building2, ChefHat, Bed,
  RefreshCw, Loader2, AlertCircle, Smartphone, FileText, TrendingDown
} from 'lucide-react';
import TableSummary from './TableSummary';

const SummaryDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateRange, setDateRange] = useState('day');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Replace with actual values from your auth context or props
  const cmp_id = useSelector(
  (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
 
    const owner = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.owner
  );
 
  // Helper function to get the first day of the month for selected date
  const getMonthStartDate = (dateString) => {
    const date = new Date(dateString);
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  };

  // Helper function to get the last day of the month for selected date
  const getMonthEndDate = (dateString) => {
    const date = new Date(dateString);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch daily data (for selected date)
      const dailyParams = {
        cmp_id,
        owner,
        date: selectedDate,
        dateRange: 'day',
        ...(cmp_id,owner && { cmp_id,owner })
      };

      // Fetch monthly data (for selected date's month)
      const monthStartDate = getMonthStartDate(selectedDate);
      const monthEndDate = getMonthEndDate(selectedDate);
      
      const monthlyParams = {
        cmp_id,
        owner,
        startDate: monthStartDate,
        endDate: monthEndDate,
        dateRange: 'month',
        ...(cmp_id,owner && { cmp_id,owner })
      };

      // Make both API calls
      const [dailyResponse, monthlyResponse] = await Promise.all([
        api.get('/api/sUsers/summary', { params: dailyParams }),
        api.get('/api/sUsers/summary', { params: monthlyParams })
      ]);

      if (dailyResponse.data.success && monthlyResponse.data.success) {
           console.log(dailyResponse.data)
        setDashboardData({
            
          daily: dailyResponse.data.data?.daily,
          monthly: monthlyResponse.data.data.monthly,
       
          analytics: {
            paymentMethodBreakdown: dailyResponse.data.data.analytics?.paymentMethodBreakdown || {
              cashPercentage: 0,
              bankPercentage: 0,
              creditPercentage: 0
            },
            businessMix: dailyResponse.data.data.analytics?.businessMix || {
              hotelPercentage: 0,
              restaurantPercentage: 0
            }
            
          }
        
        });
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
      
      // Fallback to dummy data in case of error
      setDashboardData({
        daily: {
          hotel: { 
            totalSales: 0, cashReceipt: 0, bankReceipt: 0, upiAmount: 0, 
            chequeAmount: 0, creditAmount: 0, totalTax: 0, totalDiscount: 0,
            expense: 0, balance: 0, transactionCount: 0
          },
          restaurant: { 
            totalSales: 0, cashReceipt: 0, bankReceipt: 0, upiAmount: 0,
            chequeAmount: 0, creditAmount: 0, totalTax: 0, totalDiscount: 0,
            expense: 0, balance: 0, transactionCount: 0
          },
          combined: { 
            totalSales: 0, cashReceipt: 0, bankReceipt: 0, upiAmount: 0,
            chequeAmount: 0, creditAmount: 0, totalTax: 0, totalDiscount: 0,
            expense: 0, balance: 0, transactionCount: 0, averageTicketSize: 0
          }
        },
        monthly: {
          hotel: { 
            totalSales: 0, cashReceipt: 0, bankReceipt: 0, upiAmount: 0,
            chequeAmount: 0, creditAmount: 0, totalTax: 0, totalDiscount: 0,
            expense: 0, balance: 0, transactionCount: 0
          },
          restaurant: { 
            totalSales: 0, cashReceipt: 0, bankReceipt: 0, upiAmount: 0,
            chequeAmount: 0, creditAmount: 0, totalTax: 0, totalDiscount: 0,
            expense: 0, balance: 0, transactionCount: 0
          },
          combined: { 
            totalSales: 0, cashReceipt: 0, bankReceipt: 0, upiAmount: 0,
            chequeAmount: 0, creditAmount: 0, totalTax: 0, totalDiscount: 0,
            expense: 0, balance: 0, transactionCount: 0, averageTicketSize: 0
          }
        },
        analytics: {
          paymentMethodBreakdown: {
            cashPercentage: 0,
            bankPercentage: 0,
            creditPercentage: 0
          },
          businessMix: {
            hotelPercentage: 0,
            restaurantPercentage: 0
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate, cmp_id,owner]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatSelectedDate = () => {
    const date = new Date(selectedDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatSelectedMonth = () => {
    const date = new Date(selectedDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    });
  };

  console.log(dashboardData)

  const StatCard = ({ title, icon: Icon, data, gradient, mainIcon: MainIcon }) => (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group`}>
      <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 opacity-10 group-hover:opacity-20 transition-opacity">
        <MainIcon size={80} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-lg bg-white/25 backdrop-blur-sm group-hover:bg-white/35 transition-colors">
            <Icon size={18} className="text-white" />
          </div>
          <div className="text-right">
            <h3 className="text-white/85 text-xs font-semibold uppercase tracking-wide">{title}</h3>
            <p className="text-white/60 text-xs">{data?.transactionCount || 0} transactions</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className="text-white/70" />
              <span className="text-white/90 text-xs font-medium">Total Sales</span>
            </div>
            <span className="text-white font-bold text-sm">{formatCurrency(data?.totalSales)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Banknote size={12} className="text-white/70" />
              <span className="text-white/80 text-xs">Cash</span>
            </div>
            <span className="text-white/95 font-semibold text-xs">{formatCurrency(data?.cashReceipt)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <CreditCard size={12} className="text-white/70" />
              <span className="text-white/80 text-xs">Bank</span>
            </div>
            <span className="text-white/95 font-semibold text-xs">{formatCurrency(data?.bankReceipt)}</span>
          </div>
            <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <CreditCard size={12} className="text-white/70" />
              <span className="text-white/80 text-xs">Total Discount</span>
            </div>
            <span className="text-white/95 font-semibold text-xs">{formatCurrency(data?.totalDiscount)}</span>
          </div>
            <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <CreditCard size={12} className="text-white/70" />
              <span className="text-white/80 text-xs">Total Tax</span>
            </div>
            <span className="text-white/95 font-semibold text-xs">{formatCurrency(data?.totalTax)}</span>
          </div>
            {/* <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <CreditCard size={12} className="text-white/70" />
              <span className="text-white/80 text-xs">Sale Count</span>
            </div>
            <span className="text-white/95 font-semibold text-xs">{formatCurrency(data?.transactionCount)}</span>
          </div> */}
            <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <CreditCard size={12} className="text-white/70" />
              <span className="text-white/80 text-xs">Net Sales</span>
            </div>
            <span className="text-white/95 font-semibold text-xs">{formatCurrency(data?.netSales)}</span>
          </div>

          {/* <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Smartphone size={12} className="text-white/70" />
              <span className="text-white/80 text-xs">UPI</span>
            </div>
            <span className="text-white/95 font-semibold text-xs">{formatCurrency(data.upiAmount)}</span>
          </div> */}
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <ArrowDownRight size={12} className="text-white/70" />
              <span className="text-white/80 text-xs">Expenses</span>
            </div>
            <span className="text-white/95 font-semibold text-xs">{formatCurrency(data?.expense)}</span>
          </div>
          
          <div className="border-t border-white/25 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <PiggyBank size={12} className="text-white/70" />
                <span className="text-white font-semibold text-xs">Balance</span>
              </div>
              <span className="text-white font-bold text-sm">{formatCurrency(data?.balance)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-2 left-2 w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
    </div>
  );

  const CombinedCard = ({ title, icon: Icon, data, gradient, period, mainIcon: MainIcon }) => (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group`}>
      <div className="absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 opacity-10 group-hover:opacity-20 transition-opacity">
        <MainIcon size={96} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-white/25 backdrop-blur-sm group-hover:bg-white/35 transition-colors">
            <Icon size={20} className="text-white" />
          </div>
          <div className="text-right">
            <h3 className="text-white/85 text-xs font-semibold uppercase tracking-wide">{title}</h3>
            <p className="text-white/60 text-xs">{period} SUMMARY</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 group-hover:bg-white/20 transition-colors">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign size={12} className="text-white/70" />
              <span className="text-white/80 text-xs font-medium">Revenue</span>
            </div>
            <span className="text-white font-bold text-sm">{formatCurrency(data?.totalSales)}</span>
          </div>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 group-hover:bg-white/20 transition-colors">
            <div className="flex items-center gap-1 mb-1">
              <Wallet size={12} className="text-white/70" />
              <span className="text-white/80 text-xs font-medium">Balance</span>
            </div>
            <span className="text-white font-bold text-sm">{formatCurrency(data?.balance)}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Receipt size={10} className="text-white/70" />
              <span className="text-white/90 text-xs">Cash</span>
            </div>
            <span className="text-white/95 font-semibold text-xs">{formatCurrency(data?.cashReceipt)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Building2 size={10} className="text-white/70" />
              <span className="text-white/90 text-xs">Bank</span>
            </div>
            <span className="text-white/95 font-semibold text-xs">{formatCurrency(data?.bankReceipt)}</span>
          </div>
           <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <CreditCard size={12} className="text-white/70" />
              <span className="text-white/80 text-xs">Total Discount</span>
            </div>
            <span className="text-white/95 font-semibold text-xs">{formatCurrency(data?.totalDiscount)}</span>
          </div>
            <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <CreditCard size={12} className="text-white/70" />
              <span className="text-white/80 text-xs">Total Tax</span>
            </div>
            <span className="text-white/95 font-semibold text-xs">{formatCurrency(data?.totalTax)}</span>
          </div>
            {/* <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <CreditCard size={12} className="text-white/70" />
              <span className="text-white/80 text-xs">Sale Count</span>
            </div>
            <span className="text-white/95 font-semibold text-xs">{formatCurrency(data?.transactionCount)}</span>
          </div> */}
           <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <CreditCard size={12} className="text-white/70" />
              <span className="text-white/80 text-xs">Net Sales</span>
            </div>
            <span className="text-white/95 font-semibold text-xs">{formatCurrency(data?.netSales)}</span>
          </div>
          {/* <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Smartphone size={10} className="text-white/70" />
              <span className="text-white/90 text-xs">UPI</span>
            </div>
            <span className="text-white/95 font-semibold text-xs">{formatCurrency(data.upiAmount)}</span>
          </div> */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Target size={10} className="text-white/70" />
              <span className="text-white/90 text-xs">Expenses</span>
            </div>
            <span className="text-white/95 font-semibold text-xs">0</span>
          </div>
          
          <div className="border-t border-white/25 pt-1 mt-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <FileText size={10} className="text-white/70" />
                <span className="text-white/90 text-xs">Avg Ticket</span>
              </div>
              <span className="text-white/95 font-semibold text-xs">{formatCurrency(data?.averageTicketSize)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-2 left-2 flex gap-1">
        <div className="w-1 h-1 bg-white/60 rounded-full"></div>
        <div className="w-1 h-1 bg-white/40 rounded-full"></div>
        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow-lg">
              <BarChart3 className="text-indigo-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
              <p className="text-gray-600 text-sm">Hotel & Restaurant Financial Overview</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="date"
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={16} />
              Refresh
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={16} />
            <p className="text-red-700 text-sm">Error: {error}</p>
          </div>
        )}
      </div>

      {dashboardData && (
        <>
          {/* Daily Summary Row */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-800">
                Daily Summary - {formatSelectedDate()}
              </h2>
              <Clock size={16} className="text-gray-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <StatCard
                title="Hotel Daily"
                icon={Bed}
                mainIcon={Hotel}
                data={dashboardData.daily.hotel}
                gradient="from-blue-600 via-blue-500 to-indigo-600"
              />
              <StatCard
                title="Restaurant Daily"
                icon={ChefHat}
                mainIcon={UtensilsCrossed}
                data={dashboardData.daily.restaurant}
                gradient="from-green-600 via-emerald-500 to-teal-600"
              />
              <CombinedCard
                title="Combined Daily"
                icon={BarChart3}
                mainIcon={TrendingUp}
                data={dashboardData.daily.combined}
                gradient="from-purple-600 via-violet-500 to-indigo-600"
                period="DAILY"
              />
            </div>
          </div>

          {/* Monthly Summary Row */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-800">
                Monthly Summary - {formatSelectedMonth()}
              </h2>
              <Calendar size={16} className="text-gray-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <StatCard
                title="Hotel Monthly"
                icon={Building2}
                mainIcon={Hotel}
                data={dashboardData.monthly.hotel}
                gradient="from-orange-600 via-amber-500 to-yellow-600"
              />
              <StatCard
                title="Restaurant Monthly"
                icon={UtensilsCrossed}
                mainIcon={ChefHat}
                data={dashboardData.monthly.restaurant}
                gradient="from-red-600 via-rose-500 to-pink-600"
              />
              <CombinedCard
                title="Combined Monthly"
                icon={TrendingUp}
                mainIcon={BarChart3}
                data={dashboardData.monthly.combined}
                gradient="from-slate-700 via-gray-600 to-zinc-700"
                period="MONTHLY"
              />
            </div>
          </div>

 <div className="mb-6">
      <TableSummary dashboardData={dashboardData} selectedDate={selectedDate} />
    </div>
            <div className="mb-6">
            <GraphHotelSummary dashboardData={dashboardData} selectedDate={selectedDate} />
          </div>

          {/* Analytics and Quick Stats Row */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-white rounded-lg p-3 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <ArrowUpRight className="text-green-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Daily Revenue</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(dashboardData?.daily?.combined?.totalSales)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Calendar className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Monthly Revenue</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(dashboardData.monthly?.combined?.totalSales)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Hotel className="text-purple-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Hotel Share</p>
                  <p className="text-sm font-bold text-gray-900">
                    {dashboardData.analytics?.businessMix?.hotelPercentage?.toFixed(0) || 0}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <UtensilsCrossed className="text-orange-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Restaurant Share</p>
                  <p className="text-sm font-bold text-gray-900">
                    {dashboardData.analytics?.businessMix?.restaurantPercentage?.toFixed(0) || 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <Banknote className="text-indigo-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Cash %</p>
                  <p className="text-sm font-bold text-gray-900">
                    {dashboardData.analytics?.paymentMethodBreakdown?.cashPercentage?.toFixed(0) || 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                  <CreditCard className="text-teal-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Digital %</p>
                  <p className="text-sm font-bold text-gray-900">
                    {dashboardData.analytics?.paymentMethodBreakdown?.bankPercentage?.toFixed(0) || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div> */}
        </>
      )}
    </div>
  );
};

export default SummaryDashboard;