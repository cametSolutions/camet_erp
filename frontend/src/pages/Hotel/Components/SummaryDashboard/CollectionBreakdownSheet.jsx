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

const fmt = (n) => "₹" + Number(n ?? 0).toLocaleString("en-IN");

const COMPANY_PALETTES = [
  { accent: "#1D9E75", badgeBg: "#E1F5EE", badgeText: "#085041", badgeBorder: "#5DCAA5" },
  { accent: "#378ADD", badgeBg: "#E6F1FB", badgeText: "#0C447C", badgeBorder: "#85B7EB" },
  { accent: "#BA7517", badgeBg: "#FAEEDA", badgeText: "#633806", badgeBorder: "#EF9F27" },
  { accent: "#D4537E", badgeBg: "#FBEAF0", badgeText: "#72243E", badgeBorder: "#ED93B1" },
  { accent: "#534AB7", badgeBg: "#EEEDFE", badgeText: "#3C3489", badgeBorder: "#AFA9EC" },
  { accent: "#639922", badgeBg: "#EAF3DE", badgeText: "#27500A", badgeBorder: "#97C459" },
];

const CashIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth="1.8" />
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
  </svg>
);

const BankIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M3 10h18M3 10V20h18V10M3 10L12 3l9 7" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

const CollectionBreakdownSheet = ({
  open,
  onOpenChange,
  title,
  description,
  totalAmount,
  periodLabel,
  collectionBreakdown = [],
}) => {
  const isMobile = useIsMobile();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="w-full h-[70vh] sm:h-full sm:w-[420px] p-0 flex flex-col overflow-hidden"
      >
        <SheetHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <SheetTitle className="text-sm sm:text-base font-semibold text-gray-800">
            {title}
          </SheetTitle>
          <SheetDescription className="text-[11px] sm:text-xs text-gray-400">
            {description}
          </SheetDescription>
        </SheetHeader>

        {/* Total banner */}
        <div
          className="mx-4 sm:mx-6 mb-3 sm:mb-4 rounded-xl bg-white border border-gray-100 px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col items-center text-center gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between sm:text-left"
      
        >
          <div className="flex min-w-0 flex-col items-center gap-1 sm:items-start">
            <p
              className="text-[10px] uppercase tracking-widest font-semibold"
              style={{ color: "#534AB7" }}
            >
              Total Collection
            </p>
            <p className="text-lg sm:text-2xl font-bold text-gray-800 leading-tight break-all">
              {totalAmount}
            </p>
          </div>
          <span
            className="text-xs font-medium px-3 py-1 rounded-full border self-center"
            style={{
              background: "#EEEDFE",
              color: "#3C3489",
              borderColor: "#AFA9EC",
            }}
          >
            {collectionBreakdown.length} companies
          </span>
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 space-y-3">
          {collectionBreakdown.map((company, idx) => {
            const palette = COMPANY_PALETTES[idx % COMPANY_PALETTES.length];
            return (
              <div
                key={`${company.companyName}-${idx}`}
                className="rounded-xl bg-white border border-gray-100 px-4 py-3 space-y-3"
                
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span
                    className="text-[11px] font-semibold w-4 flex-shrink-0 pt-0.5"
                    style={{ color: palette.accent }}
                  >
                    #{idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-700 break-words leading-snug">
                      {company.companyName}
                    </p>
                    <p
                      className="text-xs font-semibold tabular-nums mt-1 break-all"
                      style={{ color: palette.accent }}
                    >
                      Total {fmt(company.total)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                    <div className="flex items-center gap-1 mb-1">
                      <CashIcon color={palette.accent} />
                      <p
                        className="text-[9px] uppercase tracking-wider leading-none font-semibold"
                        style={{ color: palette.accent }}
                      >
                        Cash
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 break-all">
                      {fmt(company.cashTotal)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                    <div className="flex items-center gap-1 mb-1">
                      <BankIcon color={palette.accent} />
                      <p
                        className="text-[9px] uppercase tracking-wider leading-none font-semibold"
                        style={{ color: palette.accent }}
                      >
                        Bank
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 break-all">
                      {fmt(company.bankTotal)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {collectionBreakdown.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              No collection data available
            </p>
          )}
        </div>

        <Separator />
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <p className="text-[11px] text-gray-400 text-center">
            Showing {periodLabel} company-wise collection split
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CollectionBreakdownSheet;
