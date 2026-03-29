import React from "react";
import { MdList, MdPrint, MdClose } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { constructNow } from "date-fns";

const KitchenBatchesViewForPrint = ({
  order,
  setShowBatchWiseKotPrint,
  onPrintBatch, // (orderWithItems, batch) => void
  onEditBatch, // (orderWithItems, batch) => void
  mode = "print",
  setSelectedMode,
  setDataForBatchWisePrint,
  // "print" | "edit"
}) => {
  if (!order?.kitchenBatches || order.kitchenBatches.length === 0) return null;

  const isPrintMode = mode === "print";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-blue-700/40 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-blue-100">
              Batch-wise KOT Preview
            </span>
            <span className="text-sm font-semibold text-white">
              #{order.voucherNumber} · {order.type}
            </span>
            {order?.tableNumber && (
              <span className="text-[11px] text-blue-100">
                Table {order.tableNumber}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setShowBatchWiseKotPrint(false);
              setSelectedMode(null);
              setDataForBatchWisePrint(null);
            }}
            className="p-1.5 rounded-full hover:bg-white/15 text-white transition"
          >
            <MdClose className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 overflow-y-auto">
          {order.kitchenBatches.map((batch) => {
            const items = batch.items || [];
            const totalQty = items.reduce(
              (sum, item) => sum + (item.quantity || 0),
              0,
            );

            const handlePrimaryAction = () => {
              console.log(order);
              console.log(items);
              const updatedOrderItems = order?.items
                ?.map((orderItem) => {
                  const match = items.find(
                    (it) => it.itemId?.toString() === orderItem._id?.toString(),
                  );
                  if (!match) return null; // or undefined
                  return { ...orderItem, quantity: match.quantity };
                })
                .filter(Boolean); // removes null/undefined
              console.log(updatedOrderItems);

              const payload = {
                ...order,
                items: updatedOrderItems,
                batchNo: batch.batchNo,
              };
              if (isPrintMode && onPrintBatch) {
                onPrintBatch(payload, batch);
              } else if (!isPrintMode && onEditBatch) {
                onEditBatch(payload, batch.batchNo ,order);
              }
            };

            return (
              <div
                key={batch.batchNo}
                className="border border-blue-100 rounded-xl overflow-hidden bg-white shadow-sm"
              >
                {/* Batch Header Row */}
                <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-white bg-blue-500 px-2 py-0.5 rounded-full">
                      KOT {batch.batchNo}
                    </span>
                    <span className="text-[11px] text-gray-600 flex items-center gap-1">
                      <MdPrint className="w-3 h-3" />
                      {new Date(batch.printedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        batch.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : batch.status === "printed"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {batch.status}
                    </span>

                    {/* Per-batch primary button */}
                    <button
                      onClick={handlePrimaryAction}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-full shadow-sm transition ${
                        isPrintMode
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {isPrintMode ? (
                        <>
                          <MdPrint className="w-3 h-3" />
                          Print
                        </>
                      ) : (
                        <>
                          <FaRegEdit className="w-3 h-3" />
                          Edit
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Items list */}
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <MdList className="w-3 h-3 text-blue-500" />
                      <span className="text-[11px] font-semibold text-blue-900">
                        Items ({items.length})
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500">
                      Total Qty:{" "}
                      <span className="font-semibold">{totalQty}</span>
                    </span>
                  </div>

                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-2 py-1 rounded-lg border border-blue-50 bg-blue-50"
                      >
                        <div className="text-[11px] text-gray-800 font-medium truncate">
                          {it.product_name}
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          ×{it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KitchenBatchesViewForPrint;
