import { useEffect, useState } from "react";
import useFetch from "@/customHook/useFetch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, UtensilsCrossed, Loader2 } from "lucide-react";

// eslint-disable-next-line react/prop-types
const BookingListEditModal = ({ open, onOpenChange, voucherNumber, cmp_id }) => {

  const { data: saleResponse, loading, error } = useFetch(
    voucherNumber ? `/api/sUsers/getSaleBasedOnVoucher/${voucherNumber}` : null,
    { cmp_id }
  );

  const { data: sourcesResponse } = useFetch(
    cmp_id ? `/api/sUsers/getBankAndCashSources/${cmp_id}` : null
  );

  const saleData = saleResponse?.data;

  const combinedSources = (() => {
    if (!sourcesResponse?.data) return [];
    const { banks = [], cashs = [] } = sourcesResponse.data;
    return [
      ...cashs.map((c) => ({
        id: c._id,
        name: c.cash_ledname,
        type: c.under,
      })),
      ...banks.map((b) => ({
        id: b._id,
        name: b.bank_ledname,
        type: b.under,
      })),
    ];
  })();

  const [gstNo, setGstNo] = useState("");
  const [address, setAddress] = useState("");
  const [payments, setPayments] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (saleData) {
      setGstNo(saleData.party?.gstNo || "");
      setAddress(saleData.address || "");

      const rows = (saleData.paymentSplittingData || []).map((p) => ({
        source: p.source || "",
        sourceType: p.sourceType || "cash",
        subsource: p.subsource || "",
        amount: p.amount ?? "",
        remarks: p.remarks || "",
        customerName: p.customerName || "",
      }));

      setPayments(
        rows.length > 0
          ? rows
          : [{ source: "", sourceType: "cash", subsource: "", amount: "", remarks: "", customerName: "" }]
      );
    }
  }, [saleData]);

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setGstNo("");
      setAddress("");
      setPayments([]);
    }
    onOpenChange(isOpen);
  };

  const handleSourceChange = (index, sourceId) => {
    const selected = combinedSources.find((s) => s.id === sourceId);
    setPayments((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              source: sourceId,
              sourceType: selected?.type || "cash",
              subsource: selected?.name || "",
            }
          : row
      )
    );
  };

  const handleRemarksChange = (index, value) => {
    setPayments((prev) =>
      prev.map((row, i) => (i === index ? { ...row, remarks: value } : row))
    );
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      // TODO: wire your API
      // await api.put(`/api/sUsers/update-sale/${saleData._id}`, {
      //   gstNo, address, payments, cmp_id,
      // }, { withCredentials: true });
      // toast.success("Sale updated successfully");
      handleOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogOverlay className="bg-black/20 backdrop-blur-sm" />

      <DialogContent className="sm:max-w-[580px] p-0 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-3 border-b shrink-0">
          <DialogTitle className="text-base font-semibold">Edit Booking</DialogTitle>
          {saleData && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {saleData.salesNumber} &middot; {saleData.party?.partyName}
            </p>
          )}
        </DialogHeader>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading sale data...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-6 my-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            Failed to load: {error}
          </div>
        )}

        {/* Scrollable body + footer */}
        {!loading && !error && saleData && (
          <>
            <div className="overflow-y-auto flex-1">
              <Tabs defaultValue="hotel" className="w-full">

                {/* Tab triggers */}
                <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-white h-auto p-0 sticky top-0 z-10">
                  <TabsTrigger
                    value="hotel"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 py-3 text-sm font-medium gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Hotel
                  </TabsTrigger>
                  <TabsTrigger
                    value="restaurant"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 py-3 text-sm font-medium gap-1.5"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    Restaurant
                  </TabsTrigger>
                </TabsList>

                {/* ── HOTEL TAB ── */}
                <TabsContent value="hotel" className="mt-0 px-6 py-5 space-y-5">

                  {/* Read-only sale summary */}
                  <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block mb-0.5">Sale No.</span>
                      <span className="font-medium">{saleData.salesNumber}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-0.5">Date</span>
                      <span className="font-medium">{saleData.selectedDate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-0.5">Total</span>
                      <span className="font-medium">
                        ₹{saleData.finalAmount?.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Editable: Party details */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Party Details
                    </h4>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm">GST Number</Label>
                        <Input
                          value={gstNo}
                          onChange={(e) => setGstNo(e.target.value)}
                          placeholder="e.g. 27AAAPA1234A1Z5"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Billing Address</Label>
                        <Input
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Enter billing address"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Editable: Payment rows */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Payment Details
                    </h4>
                    <div className="space-y-3">
                      {payments.map((row, index) => (
                        <div
                          key={index}
                          className="rounded-lg border bg-gray-50 p-3 space-y-3"
                        >
                          {/* Badge for multiple payments */}
                          {payments.length > 1 && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-500">
                                Payment {index + 1}
                              </span>
                              <span className="text-xs border rounded-full px-2 py-0.5 text-gray-600">
                                {row.sourceType}
                              </span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            {/* Source selector — editable */}
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
                                  {combinedSources.length === 0 && (
                                    <SelectItem value="loading" disabled>
                                      Loading sources...
                                    </SelectItem>
                                  )}
                                  {combinedSources.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      {s.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Amount — read-only */}
                            <div className="space-y-1.5">
                              <Label className="text-xs">Amount</Label>
                              <div className="h-9 px-3 flex items-center bg-gray-100 border rounded-md text-sm font-medium text-gray-700 cursor-not-allowed">
                                ₹{Number(row.amount)?.toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>

                          {/* Remarks — editable */}
                          <div className="space-y-1.5">
                            <Label className="text-xs">Remarks</Label>
                            <Input
                              value={row.remarks}
                              onChange={(e) => handleRemarksChange(index, e.target.value)}
                              placeholder="Optional remarks"
                              className="h-9 text-sm bg-white"
                            />
                          </div>

                          {/* Customer name — read-only */}
                          {row.customerName && (
                            <p className="text-xs text-muted-foreground">
                              Customer:{" "}
                              <span className="font-medium text-gray-700">
                                {row.customerName}
                              </span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Read-only: Items table */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Items
                    </h4>
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500">
                            <th className="text-left px-3 py-2 font-medium">Item</th>
                            <th className="text-right px-3 py-2 font-medium">Amount</th>
                            <th className="text-right px-3 py-2 font-medium">GST</th>
                          </tr>
                        </thead>
                        <tbody>
                          {saleData.items?.map((item, i) => (
                            <tr key={i} className="border-t">
                              <td className="px-3 py-2">
                                <span className="font-medium">{item.product_name}</span>
                                <span className="text-muted-foreground ml-1">
                                  ({item.cgst + item.sgst}%)
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right">
                                ₹{item.total?.toLocaleString("en-IN")}
                              </td>
                              <td className="px-3 py-2 text-right text-muted-foreground">
                                ₹{(item.totalCgstAmt + item.totalSgstAmt)?.toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t bg-gray-50 font-semibold">
                            <td className="px-3 py-2">Total</td>
                            <td className="px-3 py-2 text-right">
                              ₹{saleData.finalAmount?.toLocaleString("en-IN")}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                {/* ── RESTAURANT TAB ── */}
                <TabsContent value="restaurant" className="mt-0 px-6 py-5">
                  <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                    No restaurant data for this booking.
                  </div>
                </TabsContent>

              </Tabs>
            </div>

            {/* Footer — always visible */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
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

export default BookingListEditModal;