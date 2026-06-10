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
import { Button } from "@/components/ui/button";
import { Building2, UtensilsCrossed, Loader2 } from "lucide-react";
import api from "@/api/api";
import { toast } from "sonner";
import HotelTabContent from "./HotelTabContent";
import RestaurantTabContent from "./RestaurantTabContent";


// ── Helpers ──
const getPaymentMethod = (sourceType) => {
  switch (sourceType?.toLowerCase()) {
    case "cash":   return "Cash";
    case "upi":    return "Upi";
    case "card":   return "Card";
    case "bank":   return "Bank";
    case "credit": return "Credit";
    default:       return "Online";
  }
};

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";


// eslint-disable-next-line react/prop-types
const BookingListEditModal = ({ open, onOpenChange, voucherNumber, cmp_id, checkInNumber }) => {

  // ── Hotel sale fetch ──
  const { data: saleResponse, loading, error } = useFetch(
    voucherNumber ? `/api/sUsers/getSaleBasedOnVoucher/${voucherNumber}` : null,
    { cmp_id }
  );

  const { data: sourcesResponse } = useFetch(
    cmp_id ? `/api/sUsers/getBankAndCashSources/${cmp_id}` : null
  );

  const saleData = saleResponse?.data;

  // ── Restaurant sales fetch ──
  const {
    data: restaurantSalesResponse,
    loading: restaurantLoading,
    error: restaurantError,
    refreshHook: refreshRestaurantHook
  } = useFetch(
    `/api/sUsers/getSalesByCheckInNumber/${encodeURIComponent(checkInNumber)}?cmp_id=${cmp_id}`
  );

  const restaurantSales = restaurantSalesResponse?.data ?? [];

  const combinedSources = (() => {
    if (!sourcesResponse?.data) return [];
    const { banks = [], cashs = [] } = sourcesResponse.data;
    return [
      ...cashs.map((c) => ({ id: c._id, name: c.cash_ledname, type: c.under })),
      ...banks.map((b) => ({ id: b._id, name: b.bank_ledname, type: b.under })),
    ];
  })();

  const [selectedParty, setSelectedParty] = useState(null);
  const [gstNo, setGstNo]       = useState("");
  const [address, setAddress]   = useState("");
  const [payments, setPayments] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (saleData) {
      setSelectedParty(
        saleData.party
          ? {
              _id:          saleData.party._id,
              partyName:    saleData.party.partyName,
              mobileNumber: saleData.party.mobileNumber || "",
            }
          : null
      );
      setGstNo(saleData.party?.gstNo || "");
      setAddress(saleData.address || "");

      // ── Map ALL payment rows including credit (no filter) ──
      const rows = (saleData.paymentSplittingData || []).map((p) => {
        const isCredit = p.sourceType?.toLowerCase() === "credit";
        return {
          source:        p.source       || "",
          sourceType:    p.sourceType   || "cash",
          type:          p.type         || p.sourceType || "cash",
          subsource:     p.subsource    || "",
          amount:        p.amount       ?? "",
          remarks:       p.remarks      || "",
          customerName:  p.customerName || "",
          paymentMethod: getPaymentMethod(p.sourceType || "cash"),
          underCategory: p.underCategory || "room",
          transactionNo: p.transactionNo || "",
          upiNo:         p.upiNo        || "",
          // credit party fields
          creditParty: isCredit
            ? { _id: p.customer || p.source || "", partyName: p.customerName || "" }
            : null,
          creditPartyId: isCredit ? (p.customer || p.source || "") : "",
        };
      });

      setPayments(
        rows.length > 0
          ? rows
          : [{
              source: "", sourceType: "cash", type: "cash", subsource: "",
              amount: "", remarks: "", customerName: "", paymentMethod: "Cash",
              underCategory: "room", transactionNo: "", upiNo: "",
              creditParty: null, creditPartyId: "",
            }]
      );
    }
  }, [saleData]);

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setSelectedParty(null);
      setGstNo("");
      setAddress("");
      setPayments([]);
    }
    onOpenChange(isOpen);
  };

  const handlePartySelect = (party) => {
    setSelectedParty(party);
    if (party) {
      setGstNo(party.gstNo || "");
      setAddress(party.billingAddress || "");
    } else {
      setGstNo("");
      setAddress("");
    }
  };

  // ── Handler: ledger source change (non-credit rows) ──
  const handleSourceChange = (index, sourceId) => {
    const selected = combinedSources.find((s) => s.id === sourceId);
    setPayments((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              source:        sourceId,
              sourceType:    selected?.type || "cash",
              type:          selected?.type || "cash",
              subsource:     selected?.name || "",
              paymentMethod: getPaymentMethod(selected?.type || "cash"),
            }
          : row
      )
    );
  };

  // ── Handler: payment type change (e.g. Cash → Credit) ──
  const handleSourceTypeChange = (index, newType) => {
    const isCredit = newType.toLowerCase() === "credit";
    setPayments((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              sourceType:    newType.toLowerCase(),
              type:          newType.toLowerCase(),
              paymentMethod: getPaymentMethod(newType),
              source:        isCredit ? "" : row.source,
              subsource:     isCredit ? "credit" : row.subsource,
              creditParty:   isCredit ? row.creditParty : null,
              creditPartyId: isCredit ? row.creditPartyId : "",
            }
          : row
      )
    );
  };

  // ── Handler: select credit party for a row ──
  const handleCreditPartyChange = (index, party) => {
    setPayments((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              source:        party?._id || "",
              subsource:     "credit",
              creditParty:   party
                ? { _id: party._id, partyName: party.partyName, mobileNumber: party.mobileNumber || "" }
                : null,
              creditPartyId: party?._id || "",
              customerName:  party?.partyName || row.customerName,
            }
          : row
      )
    );
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const formattedPayments = payments.map((p) => {
        const isCredit = p.sourceType?.toLowerCase() === "credit";
        return {
          source:        isCredit ? (p.creditPartyId || p.source) : p.source,
          sourceType:    capitalize(p.sourceType),
          type:          p.sourceType?.toLowerCase(),
          subsource:     p.subsource,
          remarks:       p.remarks,
          customerName:  p.customerName,
          amount:        p.amount,
          underCategory: p.underCategory,
          transactionNo: p.transactionNo,
          upiNo:         p.upiNo,
          ...(isCredit && { creditPartyId: p.creditPartyId }),
        };
      });

      await api.put(
        `/api/sUsers/updateCheckout/${saleData._id}?cmp_id=${cmp_id}`,
        {
          partyId:  selectedParty?._id,
          gstNo,
          address,
          payments: formattedPayments,
        },
        { withCredentials: true }
      );
      toast.success("Booking updated successfully");
      handleOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update booking");
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

        {/* Scrollable body */}
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
                    {restaurantSales.length > 0 && (
                      <span className="ml-1 text-xs bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 font-semibold">
                        {restaurantSales.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* HOTEL TAB */}
                <TabsContent value="hotel" className="mt-0">
                  <HotelTabContent
                    saleData={saleData}
                    selectedParty={selectedParty}
                    onPartySelect={handlePartySelect}
                    gstNo={gstNo}
                    onGstNoChange={setGstNo}
                    address={address}
                    onAddressChange={setAddress}
                    payments={payments}
                    combinedSources={combinedSources}
                    onSourceChange={handleSourceChange}
                    onSourceTypeChange={handleSourceTypeChange}
                    onCreditPartyChange={handleCreditPartyChange}
                  />
                </TabsContent>

                {/* RESTAURANT TAB */}
                <TabsContent value="restaurant" className="mt-0">
                  <RestaurantTabContent
                    checkInNumber={checkInNumber}
                    restaurantSales={restaurantSales}
                    restaurantLoading={restaurantLoading}
                    restaurantError={restaurantError}
                    combinedSources={combinedSources}
                    cmp_id={cmp_id}
                    refreshHook={refreshRestaurantHook}
                  />
                </TabsContent>

              </Tabs>
            </div>

            {/* Footer */}
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
                {saveLoading && <Loader2 className="w-3 h-3 animate-spin mr-1.5" />}
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