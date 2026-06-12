import TitleDiv from "@/components/common/TitleDiv";
import SummaryCards from "../Components/SummaryDashboard/SummaryCards";
import SummaryCardsSkeleton from "../Components/SummaryDashboard/SummaryCardsSkeleton";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const fmt = (n) => "₹" + Number(n ?? 0).toLocaleString("en-IN");

const SummaryDashboard = () => {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const company = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const cmp_id = company._id;
  const primaryUserId = company.owner;

  const fetchDashboardConsolidatedTotals = async () => {
    const response = await api.get(
      `/api/sUsers/fetchDashboardConsolidatedTotals/${cmp_id}/${primaryUserId}`,
      { withCredentials: true }
    );
    return response.data;
  };

  const fetchDashboardCompanyRevenueBreakdown = async () => {
    const response = await api.get(
      `/api/sUsers/fetchDashboardCompanyRevenueBreakdown/${cmp_id}/${primaryUserId}`,
      { withCredentials: true }
    );
    return response.data;
  };

  const fetchDashboardCompanyDailyCollectionBreakdown = async () => {
    const response = await api.get(
      `/api/sUsers/fetchDashboardCompanyDailyCollectionBreakdown/${cmp_id}/${primaryUserId}`,
      { withCredentials: true }
    );
    return response.data;
  };

  const fetchDashboardCompanyMonthlyCollectionBreakdown = async () => {
    const response = await api.get(
      `/api/sUsers/fetchDashboardCompanyMonthlyCollectionBreakdown/${cmp_id}/${primaryUserId}`,
      { withCredentials: true }
    );
    return response.data;
  };

  const {
    data,
    isLoading: isTotalsLoading,
    isError: isTotalsError,
    error: totalsError,
    refetch: refetchTotals,
    isFetching: isTotalsFetching,
  } = useQuery({
    queryKey: ["dashboardSummary", "consolidatedTotals", cmp_id],
    queryFn: fetchDashboardConsolidatedTotals,
    enabled: !!cmp_id && !!primaryUserId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const {
    data: revenueBreakdownData,
    isLoading: isRevenueBreakdownLoading,
    isError: isRevenueBreakdownError,
    error: revenueBreakdownError,
    refetch: refetchRevenueBreakdown,
    isFetching: isRevenueBreakdownFetching,
  } = useQuery({
    queryKey: ["dashboardSummary", "companyRevenueBreakdown", primaryUserId],
    queryFn: fetchDashboardCompanyRevenueBreakdown,
    enabled: !!cmp_id && !!primaryUserId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const {
    data: dailyCollectionBreakdownData,
    isLoading: isDailyCollectionBreakdownLoading,
    isError: isDailyCollectionBreakdownError,
    error: dailyCollectionBreakdownError,
    refetch: refetchDailyCollectionBreakdown,
    isFetching: isDailyCollectionBreakdownFetching,
  } = useQuery({
    queryKey: ["dashboardSummary", "dailyCollectionBreakdown", primaryUserId],
    queryFn: fetchDashboardCompanyDailyCollectionBreakdown,
    enabled: !!cmp_id && !!primaryUserId,
    staleTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const {
    data: monthlyCollectionBreakdownData,
    isLoading: isMonthlyCollectionBreakdownLoading,
    isError: isMonthlyCollectionBreakdownError,
    error: monthlyCollectionBreakdownError,
    refetch: refetchMonthlyCollectionBreakdown,
    isFetching: isMonthlyCollectionBreakdownFetching,
  } = useQuery({
    queryKey: ["dashboardSummary", "monthlyCollectionBreakdown", primaryUserId],
    queryFn: fetchDashboardCompanyMonthlyCollectionBreakdown,
    enabled: !!cmp_id && !!primaryUserId,
    staleTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const isLoading =
    isTotalsLoading ||
    isRevenueBreakdownLoading ||
    isDailyCollectionBreakdownLoading ||
    isMonthlyCollectionBreakdownLoading;
  const isError =
    isTotalsError ||
    isRevenueBreakdownError ||
    isDailyCollectionBreakdownError ||
    isMonthlyCollectionBreakdownError;
  const error =
    totalsError ||
    revenueBreakdownError ||
    dailyCollectionBreakdownError ||
    monthlyCollectionBreakdownError;
  const isFetching =
    isTotalsFetching ||
    isRevenueBreakdownFetching ||
    isDailyCollectionBreakdownFetching ||
    isMonthlyCollectionBreakdownFetching;

  const refetch = () => {
    refetchTotals();
    refetchRevenueBreakdown();
    refetchDailyCollectionBreakdown();
    refetchMonthlyCollectionBreakdown();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        <TitleDiv title="Summary Dashboard" />
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 max-w-6xl mx-auto">

        {/* Header row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-700 leading-tight truncate">
              {company?.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{today}</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">Search</span>
            </button>

            <button className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-xl bg-[#0f172a] text-sm text-white font-medium hover:bg-[#1e293b] active:bg-[#0a101e] transition">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">Export Report</span>
            </button>
          </div>
        </div>

        {/* Section label */}
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Overview
        </p>

        {/* Loading */}
        {isLoading && <SummaryCardsSkeleton />}

        {/* Error */}
        {isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load summary</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 mt-1">
              <span className="text-sm">
                {error?.message ?? "Something went wrong. Please try again."}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="w-fit flex items-center gap-2"
              >
                <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
                {isFetching ? "Retrying…" : "Retry"}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Success */}
        {!isLoading && !isError && data && (
          <SummaryCards
            totalRevenue={fmt(data.totalRevenue)}
            revenueBreakdown={revenueBreakdownData?.companyWiseRevenue ?? []}
            dailyCollection={fmt(data.dailyCollection)}
            dailyCollectionBreakdown={
              dailyCollectionBreakdownData?.companyWiseCollection ?? []
            }
            monthlyCollection={fmt(data.monthlyCollection)}
            monthlyCollectionBreakdown={
              monthlyCollectionBreakdownData?.companyWiseCollection ?? []
            }
            dailyCash={fmt(data.cashCollection?.daily)}
            dailyBank={fmt(data.bankCollection?.daily)}
            monthlyCash={fmt(data.cashCollection?.monthly)}
            monthlyBank={fmt(data.bankCollection?.monthly)}
          />
        )}
      </div>
    </div>
  );
};

export default SummaryDashboard;
