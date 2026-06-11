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


// 🔁 Replace this with a real API call / prop
const COMPANY_REVENUES = [
  { name: "The Misty Glen Resort",  revenue: 980632,  color: "#1db974" },
  { name: "Hillview Cottages",       revenue: 742100,  color: "#e8960c" },
  { name: "Green Valley Suites",     revenue: 520000,  color: "#7c4dcc" },
  { name: "Sunrise Inn",             revenue: 238300,  color: "#e84c4c" },
];

const TOTAL = COMPANY_REVENUES.reduce((sum, c) => sum + c.revenue, 0);

const fmt = (n) => "₹" + n.toLocaleString("en-IN");
const pct = (n) => ((n / TOTAL) * 100).toFixed(1) + "%";

const RevenueBreakdownSheet = ({ open, onOpenChange, totalRevenue }) => {

  const isMobile = useIsMobile();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
   side={isMobile ? "bottom" : "right"}   // 👈 only change
       className="w-full sm:w-[420px] p-0 flex flex-col">

        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="text-base font-semibold text-gray-800">
            Revenue Breakdown
          </SheetTitle>
          <SheetDescription className="text-xs text-gray-400">
            Company-wise split of total revenue
          </SheetDescription>
        </SheetHeader>

        {/* Total revenue banner */}
        <div className="mx-6 mb-4 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
              Total Revenue
            </p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">{totalRevenue}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {COMPANY_REVENUES.length} companies
          </Badge>
        </div>

        <Separator />

        {/* Company list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {COMPANY_REVENUES.map((company, idx) => (
            <div key={company.name} className="space-y-2">

              {/* Rank + Name + Amount */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[11px] text-gray-400 font-medium w-4 flex-shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {company.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-800 flex-shrink-0 tabular-nums">
                  {fmt(company.revenue)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: pct(company.revenue),
                    backgroundColor: company.color,
                    opacity: 0.75,
                  }}
                />
              </div>

              {/* Percentage */}
              <p className="text-[11px] text-gray-400 tabular-nums">
                {pct(company.revenue)} of total
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <Separator />
        <div className="px-6 py-4">
          <p className="text-[11px] text-gray-400 text-center">
            Showing all-time revenue · Tap outside to close
          </p>
        </div>

      </SheetContent>
    </Sheet>
  );
};

export default RevenueBreakdownSheet;