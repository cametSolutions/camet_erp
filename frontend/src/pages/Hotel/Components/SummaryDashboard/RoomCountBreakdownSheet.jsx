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

const RoomCountBreakdownSheet = ({
  open,
  onOpenChange,
  totalRooms,
  totalAvailableRooms,
  totalBlockedRooms,
  roomBreakdown = [],
}) => {
  const isMobile = useIsMobile();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="w-full h-[70vh] sm:h-full sm:w-[420px] p-0 flex flex-col overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50"
      >
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="text-base font-semibold text-gray-800">
            Room Count Breakdown
          </SheetTitle>
          <SheetDescription className="text-xs text-gray-400">
            Company-wise room count under the primary user
          </SheetDescription>
        </SheetHeader>

        <div className="mx-6 mb-4 rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm flex flex-col items-center text-center gap-3 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex min-w-0 flex-col items-center gap-1 sm:items-start">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
              Total Rooms
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight break-all">
              {totalRooms}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs self-center sm:self-center">
            {roomBreakdown.length} companies
          </Badge>
        </div>

        <div className="mx-6 mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
            <div className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-emerald-50 text-emerald-700">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <path d="M4 10L12 4L20 10V20H4V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M9 14L11 16L15 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[9px] uppercase tracking-wider leading-none font-semibold">Available</p>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1 break-all">
              {totalAvailableRooms}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
            <div className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-rose-50 text-rose-700">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <p className="text-[9px] uppercase tracking-wider leading-none font-semibold">Blocked</p>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1 break-all">
              {totalBlockedRooms}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {roomBreakdown.map((company, idx) => (
            <div
              key={`${company.companyName}-${idx}`}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="text-[11px] text-gray-400 font-medium w-4 flex-shrink-0 pt-0.5">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 break-words leading-snug">
                      {company.companyName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Company-wise room status
                    </p>
                  </div>
                </div>

                <div className="rounded-full bg-amber-50 text-amber-700 px-3 py-1.5 text-sm font-semibold shrink-0">
                  {company.roomCount}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                  <div className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-emerald-50 text-emerald-700">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                      <path d="M4 10L12 4L20 10V20H4V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <path d="M9 14L11 16L15 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-[9px] uppercase tracking-wider leading-none font-semibold">Available</p>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1">
                    {company.availableCount}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                  <div className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-rose-50 text-rose-700">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <p className="text-[9px] uppercase tracking-wider leading-none font-semibold">Blocked</p>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1">
                    {company.blockedCount}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {roomBreakdown.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              No room data available
            </p>
          )}
        </div>

        <Separator />
        <div className="px-6 py-4">
          <p className="text-[11px] text-gray-400 text-center">
            Showing company-wise room count
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RoomCountBreakdownSheet;
