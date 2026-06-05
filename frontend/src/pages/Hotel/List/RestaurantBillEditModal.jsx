/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Receipt } from "lucide-react";
import api from "@/api/api";
import { toast } from "sonner";

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const getPaymentMethod = (sourceType) => {
  switch (sourceType?.toLowerCase()) {
    case "cash":  return "Cash";
    case "upi":   return "Upi";
    case "card":  return "Card";
    case "bank":  return "Bank";
    default:      return "Online";
  }
};

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

// eslint-disable-next-line react/prop-types
const RestaurantBillEditModal = ({ open, onOpenChange, sale, combinedSources, cmp_id }) => {
  const [payments, setPayments] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (sale && open) {
      const rows = (sale.paymentSplittingData || [])
        .filter((p) => p.sourceType?.toLowerCase() !== "credit")
        .map((p) => ({
          source:        p.source       || "",
          sourceType:    p.sourceType   || "cash",
          subsource:     p.subsource    || "",
          amount:        p.amount       ?? "",
          remarks:       p.remarks      || "",
          customerName:  p.customerName || "",
          paymentMethod: getPaymentMethod(p.sourceType || "cash"),
        }));

      setPayments(
        rows.length > 0
          ? rows
          : [{ source: "", sourceType: "cash", subsource: "", amount: "", remarks: "", customerName: "", paymentMethod: "Cash" }]
      );
    }
  }, [sale, open]);

  const handleSourceChange = (index, sourceId) => {
    const selected = combinedSources.find((s) => s.id === sourceId);
    setPayments((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              source:        sourceId,
              sourceType:    selected?.type || "cash",
              subsource:     selected?.name || "",
              paymentMethod: getPaymentMethod(selected?.type || "cash"),
            }
          : row
      )
    );
  };

  const handleClose = () => {
    setPayments([]);
    onOpenChange(false);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const formattedPayments = payments.map((p) => ({
        ...p,
        sourceType: capitalize(p.sourceType),
      }));

      await api.put(
        `/api/sUsers/updateRestaurantSalePayment/${sale._id}?cmp_id=${cmp_id}`,
        { payments: formattedPayments },
        { withCredentials: true }
      );
      toast.success("Payment updated successfully");
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update payment");
    } finally {
      setSaveLoading(false);
    }
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogOverlay className="bg-black/40 backdrop-blur-sm" />

      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden flex flex-col max-h-[85vh]">

        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b shrink-0">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Receipt className="w-4 h-4 text-gray-500" />
            Edit Payment
          </DialogTitle>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">
              {sale.salesNumber} &middot; {sale.party?.partyName || "-"}
            </p>
            <span className="text-xs font-semibold text-gray-700">
              ₹{formatCurrency(sale.finalAmount)}
            </span>
          </div>
        </DialogHeader>

        {/* Bill summary — read-only */}
        <div className="mx-5 mt-4 grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3 text-xs shrink-0">
          <div>
            <span className="text-muted-foreground block mb-0.5">Date</span>
            <span className="font-medium">{sale.selectedDate || "-"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-0.5">Items</span>
            <span className="font-medium">{sale.items?.length ?? "-"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-0.5">Total</span>
            <span className="font-medium">₹{formatCurrency(sale.finalAmount)}</span>
          </div>
        </div>

        {/* Payment rows — scrollable */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Payment Details
          </h4>

          {payments.map((row, index) => (
            <div key={index} className="rounded-lg border bg-gray-50 p-3 space-y-3">

              {payments.length > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    Payment {index + 1}
                  </span>
                  <span className="text-xs border rounded-full px-2 py-0.5 text-gray-600">
                    {capitalize(row.sourceType)}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Payment Source</Label>
                  <Select
                    value={row.source}
                    onValueChange={(val) => handleSourceChange(index, val)}
                  >
                    <SelectTrigger className="h-9 text-sm bg-white">
                      <SelectValue placeholder="Select source">
                        {row.subsource || "Select source"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {combinedSources?.length === 0 && (
                        <SelectItem value="loading" disabled>
                          Loading sources...
                        </SelectItem>
                      )}
                      {combinedSources?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Amount</Label>
                  <div className="h-9 px-3 flex items-center bg-gray-100 border rounded-md text-sm font-medium text-gray-700 cursor-not-allowed">
                    ₹{Number(row.amount)?.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Payment Method</Label>
                <div className="h-9 px-3 flex items-center bg-gray-100 border rounded-md text-sm text-gray-600 cursor-not-allowed">
                  {row.paymentMethod}
                </div>
              </div>

              {row.customerName && (
                <p className="text-xs text-muted-foreground">
                  Customer:{" "}
                  <span className="font-medium text-gray-700">{row.customerName}</span>
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t bg-gray-50 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="h-8 text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saveLoading}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-500 text-white"
          >
            {saveLoading && <Loader2 className="w-3 h-3 animate-spin mr-1.5" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantBillEditModal;