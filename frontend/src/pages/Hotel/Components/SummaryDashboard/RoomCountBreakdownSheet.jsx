/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "./useIsMobile";

const RoomStatusPill = ({ type }) => {
  const isAvailable = type === "available";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
        isAvailable
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700"
      }`}
    >
      {isAvailable ? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          className="flex-shrink-0"
        >
          <path
            d="M4 10L12 4L20 10V20H4V10Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 14L11 16L15 12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          className="flex-shrink-0"
        >
          <rect
            x="5"
            y="11"
            width="14"
            height="9"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )}
      <p className="text-[9px] uppercase tracking-wider leading-none font-semibold">
        {isAvailable ? "Available" : "Blocked"}
      </p>
    </div>
  );
};

const RoomListBlock = ({ title, rooms = [], type }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
    <div className="flex items-center justify-between gap-2">
      <RoomStatusPill type={type} />
      <span className="text-xs font-semibold text-slate-600">{rooms.length}</span>
    </div>

    <div className="mt-3">
      {rooms.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {rooms.map((roomName, idx) => (
            <span
              key={`${title}-${roomName}-${idx}`}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                type === "available"
                  ? "bg-emerald-100/80 text-emerald-800"
                  : "bg-rose-100/80 text-rose-800"
              }`}
            >
              {roomName}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400">No {title.toLowerCase()} rooms</p>
      )}
    </div>
  </div>
);

const RoomCountBreakdownSheet = ({
  open,
  onOpenChange,
  totalRooms,
  totalAvailableRooms,
  totalBlockedRooms,
  roomBreakdown = [],
}) => {
  const isMobile = useIsMobile();
  const [selectedCompany, setSelectedCompany] = useState(null);

  const companyDetailTitle = useMemo(() => {
    if (!selectedCompany) return "";
    return `${selectedCompany.companyName} Rooms`;
  }, [selectedCompany]);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className="w-full h-[70vh] sm:h-full sm:w-[420px] p-0 flex flex-col overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50"
        >
          <SheetHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
            <SheetTitle className="text-sm sm:text-base font-semibold text-gray-800">
              Room Count Breakdown
            </SheetTitle>
          </SheetHeader>

          <div className="mx-4 sm:mx-6 mb-2 sm:mb-4 rounded-2xl bg-white border border-slate-200 px-3 sm:px-4 py-2 sm:py-3 shadow-sm flex flex-col items-center text-center gap-1.5 sm:gap-3 sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div className="flex min-w-0 flex-col items-center gap-1 sm:items-start">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                Total Rooms
              </p>
              <p className="text-base sm:text-2xl font-bold text-gray-800 leading-tight break-all">
                {totalRooms}
              </p>
            </div>
            <Badge
              variant="secondary"
              className="text-[11px] sm:text-xs px-2.5 py-0.5 self-center sm:self-center"
            >
              {roomBreakdown.length} companies
            </Badge>
          </div>

          <div className="mx-4 sm:mx-6 mb-2 sm:mb-4 grid grid-cols-2 gap-2 sm:gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 sm:px-3 py-1.5 sm:py-2">
              <RoomStatusPill type="available" />
              <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1 break-all leading-none">
                {totalAvailableRooms}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 sm:px-3 py-1.5 sm:py-2">
              <RoomStatusPill type="blocked" />
              <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1 break-all leading-none">
                {totalBlockedRooms}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
            {roomBreakdown.map((company, idx) => (
              <button
                key={`${company.companyName}-${idx}`}
                type="button"
                onClick={() => setSelectedCompany(company)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm text-left transition-colors hover:border-slate-300"
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
                        Tap to view room names
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="rounded-full bg-amber-50 text-amber-700 px-3 py-1.5 text-sm font-semibold">
                      {company.roomCount}
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-slate-400"
                    >
                      <path
                        d="M9 6L15 12L9 18"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                    <RoomStatusPill type="available" />
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1">
                      {company.availableCount}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                    <RoomStatusPill type="blocked" />
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1">
                      {company.blockedCount}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            {roomBreakdown.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                No room data available
              </p>
            )}
          </div>

          <Separator />
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <p className="text-[11px] text-gray-400 text-center">
              Showing company-wise room count
            </p>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={Boolean(selectedCompany)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setSelectedCompany(null);
          }
        }}
      >
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className="w-full h-[65vh] sm:h-full sm:w-[420px] p-0 flex flex-col overflow-hidden bg-white"
        >
          <SheetHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
            <SheetTitle className="text-sm sm:text-base font-semibold text-gray-800">
              {companyDetailTitle || "Room Details"}
            </SheetTitle>
          </SheetHeader>

          {selectedCompany && (
            <>
              <div className="mx-4 sm:mx-6 mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 break-words">
                      {selectedCompany.companyName}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Room names grouped by status
                    </p>
                  </div>
                  <div className="rounded-full bg-amber-50 text-amber-700 px-3 py-1.5 text-sm font-semibold shrink-0">
                    {selectedCompany.roomCount}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 space-y-3">
                <RoomListBlock
                  title="Available"
                  type="available"
                  rooms={selectedCompany.availableRooms}
                />
                <RoomListBlock
                  title="Blocked"
                  type="blocked"
                  rooms={selectedCompany.blockedRooms}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default RoomCountBreakdownSheet;
