import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

export default function TariffHistory({
  isOpen,
  onClose,
  booking,
  formData,
  sendUpdatedTariffToParent,
}) {
  const [tariffHistory, setTariffHistory] = useState([]);

  useEffect(() => {
    if (isOpen && booking) {
      const history = [];
      console.log(booking?.dateTariffs);
      if (booking.dateTariffs) {
        Object.entries(booking.dateTariffs).forEach(([date, rate]) => {
          history.push({
            date,
            rate,
            priceLevel: booking.selectedPriceLevel,
          });
        });
      }

      history.sort((a, b) => new Date(b.date) - new Date(a.date));
      console.log(history);
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

  const handleDelete = (date) => {
    console.log(date);
    console.log(tariffHistory);
    const updated = tariffHistory.filter((item) => item.date !== date);
    console.log(updated);
    setTariffHistory(updated);
    const result = updated.reduce((acc, item) => {
      acc[item.date] = item.rate;
      return acc;
    }, {});
    console.log(result);
    sendUpdatedTariffToParent(result);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Clock className="text-[#1e3a5f]" size={22} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Tariff Rate History
              </h2>
              <p className="text-sm text-gray-500">
                {booking?.roomName} • {booking?.roomType?.brand}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
          {tariffHistory.length === 0 ? (
            <div className="bg-white border rounded-lg py-16 text-center text-gray-500">
              <Clock size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No tariff history available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tariffHistory.length > 0 &&
                tariffHistory.map((entry, index) => {
                  const isCurrentDate = entry.date === formData?.currentDate;
                  console.log(entry);

                  return (
                    <div
                      key={index}
                      className={`relative p-4 rounded-md border transition ${
                        isCurrentDate
                          ? "bg-blue-50 border-blue-400"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {isCurrentDate && (
                        <span className="absolute -top-2 left-4 text-xs font-medium px-2 py-0.5 rounded bg-blue-600 text-white">
                          Current
                        </span>
                      )}

                      <div className="flex items-center justify-between">
                        {/* Date */}
                        <div className="flex items-center gap-3">
                          <Calendar size={18} className="text-gray-500" />
                          <p className="font-medium text-gray-800">
                            {formatDate(entry.date)}
                          </p>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-5">
                          <p className="text-lg font-semibold text-gray-900">
                            ₹{entry.rate.toFixed(0)}
                          </p>

                          <button
                            onClick={() => handleDelete(entry.date)}
                            className="p-1.5 rounded hover:bg-red-50"
                          >
                            <X size={14} className="text-red-500" />
                          </button>
                        </div>
                      </div>

                      {index < tariffHistory.length - 1 && (
                        <div className="absolute left-6 top-full h-3 w-px bg-gray-300" />
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t flex justify-between items-center bg-white">
          <p className="text-sm text-gray-600">
            {tariffHistory.length} rate change
            {tariffHistory.length !== 1 && "s"}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-[#1e3a5f] text-white hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
