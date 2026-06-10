/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Receipt } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import CustomerSearchInputBox from "../Components/CustomerSearchInPutBox";

// ── Helpers ──
const getPaymentMethod = (sourceType) => {
  switch (sourceType?.toLowerCase()) {
    case "cash":
      return "Cash";
    case "upi":
      return "Upi";
    case "card":
      return "Card";
    case "bank":
      return "Bank";
    case "credit":
      return "Credit";
    default:
      return "Online";
  }
};

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const PAYMENT_TYPES = ["Cash", "Upi", "Card", "Bank", "Credit"];
// ─────────────────────────────────────────────────────────────
const RestaurantBillEditModal = ({
  open,
  onOpenChange,
  sale,
  combinedSources,
  cmp_id,
  refreshHook,
  fetchBookings,
  setOpen,
}) => {
  const [payments, setPayments] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);

  // ── Populate payments from sale data ──
  useEffect(() => {
    if (sale) {
      const rows = (sale.paymentSplittingData || []).map((p) => {
        const isCredit = p.sourceType?.toLowerCase() === "credit";
        return {
          source: p.source || "",
          sourceType: p.sourceType || "cash",
          type: p.type || p.sourceType || "cash",
          subsource: p.subsource || "",
          amount: p.amount ?? "",
          remarks: p.remarks || "",
          customerName: p.customerName || "",
          paymentMethod: getPaymentMethod(p.sourceType || "cash"),
          underCategory: p.underCategory || "food",
          transactionNo: p.transactionNo || "",
          upiNo: p.upiNo || "",
          creditParty: isCredit
            ? {
                _id: p.customer || p.source || "",
                partyName: p.customerName || "",
              }
            : null,
          creditPartyId: isCredit ? p.customer || p.source || "" : "",
        };
      });

      setPayments(
        rows.length > 0
          ? rows
          : [
              {
                source: "",
                sourceType: "cash",
                type: "cash",
                subsource: "",
                amount: "",
                remarks: "",
                customerName: "",
                paymentMethod: "Cash",
                underCategory: "food",
                transactionNo: "",
                upiNo: "",
                creditParty: null,
                creditPartyId: "",
              },
            ],
      );
    }
  }, [sale]);

  const handleClose = (isOpen) => {
    if (!isOpen) setPayments([]);
    onOpenChange(isOpen);
  };

  // ── Handler: ledger source change (non-credit rows) ──
  const handleSourceChange = (index, sourceId) => {
    const selected = combinedSources.find((s) => s.id === sourceId);
    setPayments((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              source: sourceId,
              sourceType: selected?.type || "cash",
              type: selected?.type || "cash",
              subsource: selected?.name || "",
              paymentMethod: getPaymentMethod(selected?.type || "cash"),
            }
          : row,
      ),
    );
  };

  // ── Handler: payment type change (e.g. Upi → Credit) ──
  const handleSourceTypeChange = (index, newType) => {
    const isCredit = newType.toLowerCase() === "credit";
    setPayments((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              sourceType: newType.toLowerCase(),
              type: newType.toLowerCase(),
              paymentMethod: getPaymentMethod(newType),
              source: isCredit ? "" : row.source,
              subsource: isCredit ? "credit" : row.subsource,
              creditParty: isCredit ? row.creditParty : null,
              creditPartyId: isCredit ? row.creditPartyId : "",
            }
          : row,
      ),
    );
  };

  // ── Handler: select credit party for a row ──
  const handleCreditPartyChange = (index, party) => {
    setPayments((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              source: party?._id || "",
              subsource: "credit",
              creditParty: party
                ? {
                    _id: party._id,
                    partyName: party.partyName,
                    mobileNumber: party.mobileNumber || "",
                  }
                : null,
              creditPartyId: party?._id || "",
              customerName: party?.partyName || row.customerName,
            }
          : row,
      ),
    );
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const formattedPayments = payments.map((p) => {
        const isCredit = p.sourceType?.toLowerCase() === "credit";
        return {
          source: isCredit ? p.creditPartyId || p.source : p.source,
          sourceType: capitalize(p.sourceType),
          type: p.sourceType?.toLowerCase(),
          subsource: p.subsource,
          remarks: p.remarks,
          customerName: p.customerName,
          amount: p.amount,
          underCategory: p.underCategory,
          transactionNo: p.transactionNo,
          upiNo: p.upiNo,
          ...(isCredit && { creditPartyId: p.creditPartyId }),
        };
      });

      await api.put(
        `/api/sUsers/updateRestaurantSalePayments/${sale._id}?cmp_id=${cmp_id}`,
        { payments: formattedPayments },
        { withCredentials: true },
      );

      toast.success("Restaurant bill updated successfully");
      refreshHook?.();
      fetchBookings?.();
      setOpen(false);
      handleClose(false);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to update restaurant bill",
      );
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogOverlay className="bg-black/20 backdrop-blur-sm" />

      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-3 border-b shrink-0">
          <DialogTitle className="text-base font-semibold">
            Edit Restaurant Bill
          </DialogTitle>
          {sale && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <Receipt className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {sale.salesNumber} &middot; ₹{formatCurrency(sale.finalAmount)}
              </p>
            </div>
          )}
        </DialogHeader>

        {/* Body */}
        {sale && (
          <>
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              {/* Read-only bill summary */}
              <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3 text-xs">
                <div>
                  <span className="text-muted-foreground block mb-0.5">
                    Bill No.
                  </span>
                  <span className="font-medium">{sale.salesNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">
                    Date
                  </span>
                  <span className="font-medium">{sale.selectedDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">
                    Total
                  </span>
                  <span className="font-medium">
                    ₹{formatCurrency(sale.finalAmount)}
                  </span>
                </div>
              </div>

              {/* Payment rows */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Payment Details
                </h4>
                <div className="space-y-3">
                  {payments.map((row, index) => {
                    const isCredit = row.sourceType?.toLowerCase() === "credit";

                    const filteredSources = combinedSources.filter(
                      (s) =>
                        s.type?.toLowerCase() === row.sourceType?.toLowerCase(),
                    );

                    return (
                      <div
                        key={index}
                        className="rounded-lg border bg-gray-50 p-3 space-y-3"
                      >
                        {/* Row header badge */}
                        {payments.length > 1 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">
                              Payment {index + 1}
                            </span>
                            <span
                              className={`text-xs border rounded-full px-2 py-0.5 font-medium ${
                                isCredit
                                  ? "bg-amber-50 border-amber-200 text-amber-700"
                                  : "bg-gray-100 border-gray-200 text-gray-600"
                              }`}
                            >
                              {capitalize(row.sourceType)}
                            </span>
                          </div>
                        )}

                        {/* Payment Type + Amount */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Payment Type</Label>
                            <Select
                              value={capitalize(row.sourceType) || "Cash"}
                              onValueChange={(val) =>
                                handleSourceTypeChange(index, val)
                              }
                              disabled={isCredit} // ✅ lock the whole select for credit rows
                            >
                              <SelectTrigger
                                className={`h-9 text-sm bg-white ${
                                  isCredit
                                    ? "opacity-70 cursor-not-allowed pointer-events-none bg-amber-50 border-amber-200 text-amber-700"
                                    : ""
                                }`}
                              >
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {PAYMENT_TYPES.map((type) => (
                                  <SelectItem
                                    key={type}
                                    value={type}
                                    disabled={type === "Credit"} // ✅ Credit visible but unclickable
                                    className={
                                      type === "Credit"
                                        ? "opacity-40 cursor-not-allowed"
                                        : ""
                                    }
                                  >
                                    {type}
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

                        {/* Credit party picker OR Ledger source dropdown */}
                        {isCredit ? (
                          <div className="space-y-1.5 pointer-events-none opacity-60">
                            <Label className="text-xs">
                              Credit Party
                              <span className="ml-1 text-amber-600 font-normal text-[11px]">
                                (billed on credit)
                              </span>
                            </Label>
                            <CustomerSearchInputBox
                              selectedParty={row.creditParty || null}
                              onSelect={(party) =>
                                handleCreditPartyChange(index, party)
                              }
                              placeholder="Search credit party..."
                            />
                            {row.creditParty?.partyName && (
                              <p className="text-xs text-muted-foreground">
                                Billing to:{" "}
                                <span className="font-semibold text-amber-700">
                                  {row.creditParty.partyName}
                                </span>
                                {row.creditParty.mobileNumber && (
                                  <span className="ml-1 text-gray-400">
                                    · {row.creditParty.mobileNumber}
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <Label className="text-xs">Payment Source</Label>
                            <Select
                              value={row.source}
                              onValueChange={(val) =>
                                handleSourceChange(index, val)
                              }
                            >
                              <SelectTrigger className="h-9 text-sm bg-white">
                                <SelectValue placeholder="Select source">
                                  {row.subsource || "Select source"}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {filteredSources.length === 0 && (
                                  <SelectItem value="loading" disabled>
                                    Loading sources...
                                  </SelectItem>
                                )}
                                {filteredSources.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Customer name (non-credit only) */}
                        {row.customerName && !isCredit && (
                          <p className="text-xs text-muted-foreground">
                            Customer:{" "}
                            <span className="font-medium text-gray-700">
                              {row.customerName}
                            </span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClose(false)}
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
                {saveLoading && (
                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                )}
                Save Changes
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantBillEditModal;
