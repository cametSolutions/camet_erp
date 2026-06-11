import TitleDiv from "@/components/common/TitleDiv";
import SummaryCards from "../Components/SummaryDashboard/SummaryCards";

const SummaryDashboard = () => {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav bar */}
      <div >
        <TitleDiv title="Summary Dashboard" />
      </div>

      {/* Page body */}
      <div className="px-6 py-6 max-w-6xl mx-auto">

        {/* Header row */}
        <div className="flex items-start justify-between mb-8">
          {/* Left — greeting */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              
            </h1>
            <p className="text-sm text-gray-500 mt-1">{today}</p>
          </div>

          {/* Right — search + action */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M10.5 10.5L13 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Search
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f172a] text-sm text-white font-medium hover:bg-[#1e293b] transition">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 3v10M3 8h10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Section label */}
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Overview
        </p>

        {/* Summary Cards */}
        <SummaryCards
          totalRevenue="₹24,80,632"
          dailyCollection="₹98,450"
          monthlyCollection="₹9,80,632"
        />
      </div>
    </div>
  );
};

export default SummaryDashboard;