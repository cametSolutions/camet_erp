import React, { useEffect, useMemo, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import DeleteDialog from "@/components/common/modal/DeleteDialog";
import { toast } from "sonner";
import api from "@/api/api";

const toNumber = (value) => {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
};

export default function OutStandingModal({
  showModal,
  onClose,
  outStanding = [],
  cmp_id,
  sendDataToParent,
}) {
  const [items, setItems] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    setItems(Array.isArray(outStanding) ? outStanding : []);
  }, [outStanding]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + toNumber(item.bill_amount), 0);
  }, [items]);

  const totalPending = useMemo(() => {
    return items.reduce((sum, item) => sum + toNumber(item.bill_pending_amt), 0);
  }, [items]);

  if (!showModal) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `₹${toNumber(amount).toLocaleString("en-IN")}`;
  };

  const getSourceBadgeColor = (source) => {
    switch (source) {
      case "Booking":
        return "bg-blue-100 text-blue-800";
      case "CheckOut":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteAdvance = async (id) => {
    if (!id) {
      toast.error("Invalid advance ID");
      return;
    }

    if (!cmp_id) {
      toast.error("Company ID missing");
      return;
    }

    try {
      setDeletingId(id);

      const { data } = await api.delete(`/api/sUsers/deleteAdvance/${id}`, {
        params: { cmp_id },
      });

      setItems((prev) => prev.filter((item) => item._id !== id));
      sendDataToParent(id);

      toast.success(data?.message || "Advance deleted successfully");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete advance";

      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Outstanding Bills</h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="overflow-x-auto p-6">
          {items.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Bill No
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Party Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Mobile
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Bill Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Advance Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {item.bill_no || "-"}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-900">
                      {item.party_name || "-"}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-900">
                      {item.mobile_no || "-"}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatDate(item.bill_date)}
                    </td>

                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(item.bill_amount)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSourceBadgeColor(
                          item.source
                        )}`}
                      >
                        {item.source || "Unknown"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.isCancelled ? "bg-red-500" : "bg-green-500"
                          }`}
                        />
                        <span className="text-xs text-gray-600">
                          {item.isCancelled ? "Cancelled" : "Active"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <DeleteDialog
                          onConfirm={() => handleDeleteAdvance(item._id)}
                          title="Delete this Advance?"
                          description={`This will permanently delete advance for "${
                            item.bill_no || "-"
                          }".`}
                        >
                          <button
                            type="button"
                            disabled={deletingId === item._id}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
                          >
                            <MdDelete />
                          </button>
                        </DeleteDialog>

                        {/* <button
                          type="button"
                          className="text-gray-600 hover:text-blue-700"
                        >
                          <FaEdit />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No outstanding bills to display
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Total:</span> {items.length} bills
                {" • "}
                Amount:{" "}
                <span className="font-semibold text-gray-900">
                  {formatCurrency(totalAmount)}
                </span>
                {" • "}
                Pending Amount:{" "}
                <span
                  className={`font-semibold ${
                    totalPending > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatCurrency(totalPending)}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}