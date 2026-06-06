/* eslint-disable react/prop-types */
import { useState } from "react";
import { UtensilsCrossed, Loader2, Receipt, Pencil } from "lucide-react";
import RestaurantBillEditModal from "./RestaurantBillEditModal";

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

// eslint-disable-next-line react/prop-types
const RestaurantTabContent = ({
  checkInNumber,
  restaurantSales,
  restaurantLoading,
  restaurantError,
  combinedSources,
  cmp_id,
    refreshHook
}) => {
  const [editingSale, setEditingSale] = useState(null);

  return (
    <div className="px-6 py-5 space-y-4">

      {/* Check-in reference badge */}
      {checkInNumber && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          <Receipt className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="text-xs text-blue-700">
            Check-In: <span className="font-semibold">{checkInNumber}</span>
          </span>
        </div>
      )}

      {/* Loading */}
      {restaurantLoading && (
        <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading restaurant bills...</span>
        </div>
      )}

      {/* Error */}
      {restaurantError && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          Failed to load restaurant data: {restaurantError}
        </div>
      )}

      {/* No check-in linked */}
      {!checkInNumber && !restaurantLoading && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
          <UtensilsCrossed className="w-8 h-8 opacity-30" />
          <p className="text-sm">No check-in linked to this booking.</p>
        </div>
      )}

      {/* No restaurant bills */}
      {checkInNumber && !restaurantLoading && !restaurantError && restaurantSales.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
          <UtensilsCrossed className="w-8 h-8 opacity-30" />
          <p className="text-sm">No restaurant bills for this booking.</p>
        </div>
      )}

      {/* Restaurant sales list */}
      {!restaurantLoading && !restaurantError && restaurantSales.length > 0 && (
        <div className="space-y-3">

          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Bills ({restaurantSales.length})
            </span>
            <span className="text-xs font-semibold text-gray-700">
              Total: ₹{formatCurrency(
                restaurantSales.reduce((sum, s) => sum + (Number(s.finalAmount) || 0), 0)
              )}
            </span>
          </div>

          {restaurantSales.map((sale, idx) => (
            <div
              key={sale._id || idx}
              className="rounded-lg border bg-gray-50 p-3 space-y-2.5"
            >
              {/* Bill header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-xs font-semibold text-gray-700">
                    {sale.salesNumber || `Bill ${idx + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800">
                    ₹{formatCurrency(sale.finalAmount)}
                  </span>
                  {/* Edit payment button */}
                  <button
                    onClick={() => setEditingSale(sale)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 bg-white hover:bg-blue-50 rounded-md px-2 py-1 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                </div>
              </div>

              {/* Bill meta */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Date</span>
                  <span className="font-medium text-gray-700">{sale.selectedDate || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Party</span>
                  <span
                    className="font-medium text-gray-700 truncate block"
                    title={sale.party?.partyName}
                  >
                    {sale.party?.partyName || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Items</span>
                  <span className="font-medium text-gray-700">
                    {sale.items?.length ?? "-"}
                  </span>
                </div>
              </div>

              {/* Payment split pills */}
              {sale.paymentSplittingData?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sale.paymentSplittingData
                    .filter((p) => p.sourceType?.toLowerCase() !== "credit")
                    .map((p, pi) => (
                      <span
                        key={pi}
                        className="inline-flex items-center gap-1 text-xs bg-white border rounded-full px-2 py-0.5 text-gray-600"
                      >
                        <span className="capitalize">{p.sourceType}</span>
                        <span className="font-medium text-gray-800">
                          ₹{formatCurrency(p.amount)}
                        </span>
                      </span>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Restaurant Bill Edit Modal */}
      <RestaurantBillEditModal
        open={!!editingSale}
        onOpenChange={(isOpen) => { if (!isOpen) setEditingSale(null); }}
        sale={editingSale}
        combinedSources={combinedSources}
        cmp_id={cmp_id}
        refreshHook={refreshHook}
      />
    </div>
  );
};

export default RestaurantTabContent;