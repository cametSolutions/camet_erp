/* eslint-disable react/prop-types */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomerSearchInputBox from "../Components/CustomerSearchInputBox";

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

// eslint-disable-next-line react/prop-types
const HotelTabContent = ({
  saleData,
  selectedParty,
  onPartySelect,
  gstNo,
  onGstNoChange,
  address,
  onAddressChange,
  payments,
  combinedSources,
  onSourceChange,
}) => {
  return (
    <div className="px-6 py-5 space-y-5">
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

      {/* Party Section */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Party
        </h4>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm">Party Name</Label>
            <CustomerSearchInputBox
              selectedParty={selectedParty}
              onSelect={onPartySelect}
              placeholder="Search party..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">GST Number</Label>
            <Input
              value={gstNo}
              onChange={(e) => onGstNoChange(e.target.value)}
              placeholder="e.g. 27AAAPA1234A1Z5"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Billing Address</Label>
            <Input
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder="Enter billing address"
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Payment Details
        </h4>
        <div className="space-y-3">
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
                    onValueChange={(val) => onSourceChange(index, val)}
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
                  <span className="font-medium text-gray-700">
                    {row.customerName}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotelTabContent;