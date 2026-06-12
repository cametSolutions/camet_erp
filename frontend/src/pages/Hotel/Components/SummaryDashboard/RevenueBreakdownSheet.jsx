/* eslint-disable react/prop-types */
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "./useIsMobile";

const COMPANY_COLORS = ["#1db974", "#e8960c", "#7c4dcc", "#e84c4c", "#2a5298", "#0f766e"];

const fmt = (n) => "₹" + n.toLocaleString("en-IN");
const pct = (n, total) =>
  `${(((Number(n) || 0) / (Number(total) || 1)) * 100).toFixed(1)}%`;

const RevenueBreakdownSheet = ({
  open,
  onOpenChange,
  totalRevenue,
  revenueBreakdown = [],
}) => {

  const isMobile = useIsMobile();
  const companyRevenues = revenueBreakdown.map((company, idx) => ({
    name: company.companyName,
    revenue: Number(company.revenue) || 0,
    color: COMPANY_COLORS[idx % COMPANY_COLORS.length],
  }));
  const total = companyRevenues.reduce((sum, company) => sum + company.revenue, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
   side={isMobile ? "bottom" : "right"}   // 👈 only change
       className="w-full h-[70vh] sm:h-full sm:w-[420px] p-0 flex flex-col overflow-hidden">

        {/* Header */}
        <SheetHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <SheetTitle className="text-sm sm:text-base font-semibold text-gray-800">
            Revenue Breakdown
          </SheetTitle>
          <SheetDescription className="text-[11px] sm:text-xs text-gray-400">
            Company-wise split of total revenue
          </SheetDescription>
        </SheetHeader>

        {/* Total revenue banner */}
        <div className="mx-4 sm:mx-6 mb-3 sm:mb-4 rounded-xl bg-gray-50 border border-gray-100 px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col items-center text-center gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex min-w-0 flex-col items-center gap-1 sm:items-start">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
              Total Revenue
            </p>
            <p className="text-lg sm:text-2xl font-bold text-gray-800 leading-tight break-all">
              {totalRevenue}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs self-center sm:self-center">
            {companyRevenues.length} companies
          </Badge>
        </div>

        <Separator />

        {/* Company list */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 space-y-4 sm:space-y-5">
          {companyRevenues.map((company, idx) => (
            <div key={`${company.name}-${idx}`} className="space-y-2">

              {/* Rank + Name */}
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="text-[11px] text-gray-400 font-medium w-4 flex-shrink-0 pt-0.5">
                  #{idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-700 break-words leading-snug">
                    {company.name}
                  </p>
                  <p className="text-xs font-semibold text-gray-800 tabular-nums mt-1 break-all">
                    {fmt(company.revenue)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: pct(company.revenue, total),
                    backgroundColor: company.color,
                    opacity: 0.75,
                  }}
                />
              </div>

              {/* Percentage */}
              <p className="text-[11px] text-gray-400 tabular-nums">
                {pct(company.revenue, total)} of total
              </p>
            </div>
          ))}
          {companyRevenues.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              No revenue data available
            </p>
          )}
        </div>

        {/* Footer */}
        <Separator />
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <p className="text-[11px] text-gray-400 text-center">
            Showing all-time revenue · Tap outside to close
          </p>
        </div>

      </SheetContent>
    </Sheet>
  );
};

export default RevenueBreakdownSheet;
