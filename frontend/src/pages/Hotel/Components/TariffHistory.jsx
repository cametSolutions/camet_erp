import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

export default function TariffHistory({ isOpen, onClose, booking, formData,sendUpdatedTariffToParent }) {
  const [tariffHistory, setTariffHistory] = useState([]);

  useEffect(() => {
    if (isOpen && booking) {
      // Generate tariff history from dateTariffs object
      const history = [];

      if (booking.dateTariffs) {
        Object.entries(booking.dateTariffs).forEach(([date, rate]) => {
          history.push({
            date,
            rate,
            priceLevel: booking.selectedPriceLevel,
          });
        });
      }

      // Sort by date (most recent first)
      history.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTariffHistory(history);
    }
  }, [isOpen, booking]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateChange = (currentRate, previousRate) => {
    if (!previousRate) return null;
    const change = currentRate - previousRate;
    const percentChange = ((change / previousRate) * 100).toFixed(1);
    return { change, percentChange };
  };
const handleDelete = (date) => {
  // You can modify this based on how you want to delete
  const updated = tariffHistory.filter(item => item.date !== date);
  setTariffHistory(updated);
  sendUpdatedTariffToParent(updated);

};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#1e3a5f] to-[#2d5278]">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Clock className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Tariff Rate History
              </h2>
              <p className="text-gray-200 text-sm mt-0.5">
                {booking?.roomName} - {booking?.roomType?.brand}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {tariffHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-white rounded-lg border border-gray-200">
              <Clock size={56} className="mb-4 opacity-40 text-gray-400" />
              <p className="text-lg font-semibold text-gray-700">
                No Tariff History Available
              </p>
              <p className="text-sm mt-2 text-gray-500">
                Rate changes will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tariffHistory.map((entry, index) => {
                const previousEntry = tariffHistory[index + 1];
                const change = previousEntry
                  ? calculateChange(entry.rate, previousEntry.rate)
                  : null;
                const isCurrentDate = entry.date === formData?.currentDate;

                return (
                  <div
                    key={index}
                    className={`relative p-4 rounded-lg border transition-all ${
                      isCurrentDate
                        ? "border-[#ff6b35] bg-orange-50 shadow-md ring-2 ring-orange-200"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    {isCurrentDate && (
                      <div className="absolute -top-2.5 left-4 bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        CURRENT RATE
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2.5 rounded-lg ${
                            isCurrentDate ? "bg-orange-100" : "bg-gray-100"
                          }`}
                        >
                          <Calendar
                            size={20}
                            className={
                              isCurrentDate
                                ? "text-orange-600"
                                : "text-gray-600"
                            }
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-base">
                            {formatDate(entry.date)}
                          </p>
                          {isCurrentDate && (
                            <p className="text-xs text-orange-600 font-medium mt-0.5">
                              Selected Date
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {change && (
                          <div
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                              change.change > 0
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : change.change < 0
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                          >
                            {change.change > 0 ? (
                              <TrendingUp size={16} />
                            ) : change.change < 0 ? (
                              <TrendingDown size={16} />
                            ) : (
                              <Minus size={16} />
                            )}
                            <span>
                              {change.change > 0 ? "+" : ""}₹
                              {Math.abs(change.change).toFixed(0)}
                            </span>
                            <span className="text-xs opacity-75">
                              ({change.percentChange}%)
                            </span>
                          </div>
                        )}

                        <div className="text-right">
                          <p
                            className={`text-2xl font-bold ${
                              isCurrentDate
                                ? "text-orange-600"
                                : "text-gray-900"
                            }`}
                          >
                            ₹{entry.rate.toFixed(0)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(entry.date)}
                          className="p-2 rounded-lg hover:bg-red-100 group"
                        >
                          <X
                            size={16}
                            className="text-red-600 group-hover:text-red-800 hover:shadow-sm"
                          />
                        </button>
                      </div>
                    </div>

                    {/* Timeline connector */}
                    {index < tariffHistory.length - 1 && (
                      <div
                        className={`absolute left-[2.85rem] top-full w-0.5 h-3 ${
                          isCurrentDate ? "bg-orange-300" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-white flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">
              {tariffHistory.length}
            </span>{" "}
            rate {tariffHistory.length === 1 ? "change" : "changes"} recorded
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-[#1e3a5f] to-[#2d5278] text-white rounded-lg hover:from-[#2d5278] hover:to-[#1e3a5f] transition-all font-medium shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
