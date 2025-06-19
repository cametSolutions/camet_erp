/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // Add this import
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import {
  addVoucherNumber,
  addSelectedVoucherSeries,
} from "../../../../slices/voucherSlices/commonVoucherSlice";
import {
  addVoucherNumber as addAccountingVoucherNumber,
  addSelectedVoucherSeries as addAccountingSelectedVoucherSeries,
} from "../../../../slices/voucherSlices/commonAccountingVoucherSlice"; // Add this import
import api from "@/api/api";
import { LoaderCircle } from "lucide-react";

function VoucherSeriesModal({
  isOpen,
  onClose,
  voucherType,
  voucherSeries = [],
}) {
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const {
    voucherSeries: voucherSeriesFromCommonVoucher,
    selectedVoucherSeries: selectedVoucherSeriesFromCommon,
    voucherType: voucherTypeFromCommonVoucher,
    selectedVoucherSeriesForEdit: selectedVoucherSeriesForEditFromCommon,
    mode: modeFromCommonVoucher,
  } = useSelector((state) => state.commonVoucherSlice);
  const {
    voucherSeries: voucherSeriesFromCommonAccVoucher,
    selectedVoucherSeries: selectedVoucherSeriesFromAccounting,
    voucherType: voucherTypeFromCommonAccVoucher,
    selectedVoucherSeriesForEdit: selectedVoucherSeriesForEditFromAccounting,
    mode: modeFromCommonAccVoucher,
  } = useSelector((state) => state.commonAccountingVoucherSlice);

  // Determine which slice to use based on location path
  const isReceiptOrPayment =
    location.pathname.includes("receipt") ||
    location.pathname.includes("payment");

  // Select appropriate voucher series and selected series based on path
  const currentVoucherSeries = isReceiptOrPayment
    ? voucherSeriesFromCommonAccVoucher
    : voucherSeriesFromCommonVoucher;
  const currentSelectedVoucherSeries = isReceiptOrPayment
    ? selectedVoucherSeriesFromAccounting
    : selectedVoucherSeriesFromCommon;

  const selectedVoucherSeriesForEdit = isReceiptOrPayment
    ? selectedVoucherSeriesForEditFromAccounting
    : selectedVoucherSeriesForEditFromCommon;

  const mode = isReceiptOrPayment
    ? modeFromCommonAccVoucher
    : modeFromCommonVoucher;

  // Update current voucher series for edit mode
  const getUpdatedVoucherSeries = () => {
    if (
      mode === "edit" &&
      selectedVoucherSeriesForEdit &&
      Object.keys(selectedVoucherSeriesForEdit).length > 0
    ) {
      return currentVoucherSeries?.map((series) => {
        if (series._id === selectedVoucherSeriesForEdit._id) {
          return {
            ...series,
            currentNumber: selectedVoucherSeriesForEdit.currentNumber,
          };
        }
        return series;
      });
    }
    return currentVoucherSeries;
  };

  const updatedVoucherSeries = getUpdatedVoucherSeries();

  useEffect(() => {
    // Only proceed if selectedVoucherSeries is null
    if (
      currentSelectedVoucherSeries === null &&
      updatedVoucherSeries?.length > 0
    ) {
      let seriesToSelect;

      // Priority 1: If selectedVoucherSeriesForEdit exists, use it
      if (
        selectedVoucherSeriesForEdit &&
        Object.keys(selectedVoucherSeriesForEdit).length > 0
      ) {
        // Find the matching series from updatedVoucherSeries
        seriesToSelect = updatedVoucherSeries.find(
          (series) => series._id === selectedVoucherSeriesForEdit._id
        );
      }

      // Priority 2: Check if any series has currentlySelected === true
      if (!seriesToSelect) {
        const currentlySelectedSeries = updatedVoucherSeries.find(
          (series) => series.currentlySelected === true
        );
        seriesToSelect = currentlySelectedSeries;
      }

      // Priority 3: Use the 0th series if no other option found
      if (!seriesToSelect) {
        seriesToSelect = updatedVoucherSeries[0];
      }

      setSelectedSeries(seriesToSelect);

      // Dispatch to appropriate slice based on path
      if (isReceiptOrPayment) {
        dispatch(
          addAccountingVoucherNumber(generateSeriesFormat(seriesToSelect))
        );
        dispatch(addAccountingSelectedVoucherSeries(seriesToSelect));
      } else {
        dispatch(addVoucherNumber(generateSeriesFormat(seriesToSelect)));
        dispatch(addSelectedVoucherSeries(seriesToSelect));
      }
    }
  }, [
    updatedVoucherSeries,
    currentSelectedVoucherSeries,
    selectedVoucherSeriesForEdit,
    isReceiptOrPayment,
    dispatch,
  ]);

  useEffect(() => {
    if (currentSelectedVoucherSeries) {
      setSelectedSeries(currentSelectedVoucherSeries);
    }
  }, [currentSelectedVoucherSeries]);

  // Generate series format preview
  const generateSeriesFormat = (series) => {
    if (!series) return "";
    const paddedNumber = series?.currentNumber
      .toString()
      .padStart(series?.widthOfNumericalPart, "0");
    return `${series?.prefix}${paddedNumber}${series?.suffix}`;
  };

  // Handle confirm selection
  const handleConfirmSelection = async () => {
    // Dispatch to appropriate slice based on path
    if (isReceiptOrPayment) {
      dispatch(
        addAccountingVoucherNumber(generateSeriesFormat(selectedSeries))
      );

      dispatch(addAccountingSelectedVoucherSeries(selectedSeries));
    } else {
      dispatch(addVoucherNumber(generateSeriesFormat(selectedSeries)));
      dispatch(addSelectedVoucherSeries(selectedSeries));
    }

    await makeTheSeriesAsCurrentlySelected(selectedSeries?._id);
    onClose();
  };

  // Save series as currently selected in series master
  const makeTheSeriesAsCurrentlySelected = async (seriesId) => {
    setLoading(true);

    const voucherType =
      voucherTypeFromCommonVoucher || voucherTypeFromCommonAccVoucher;
    const body = {
      seriesId,
      voucherType,
    };
    try {
      await api.put(
        `/api/sUsers/makeTheSeriesAsCurrentlySelected/${cmp_id}`,
        body,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const titleText =
    voucherType?.split("")[0]?.toUpperCase()?.concat(voucherType?.slice(1)) ||
    "Voucher";

  // Use the updated voucher series for rendering
  const seriesToRender = updatedVoucherSeries || voucherSeries;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[380px] bg-white p-0">
        <DialogHeader className="border-b border-gray-200 px-4 py-3">
          <DialogTitle className="text-base font-semibold text-gray-800">
            Select {titleText} Series
          </DialogTitle>
        </DialogHeader>

        {/* Current Number Display */}
        <div className="p-2 px-4 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="text-blue-700 font-medium">
            Current Number:{" "}
            {generateSeriesFormat(selectedSeries) || "Not Selected"}
          </div>
        </div>

        <div className="px-4 pb-5">
          {/* Series List */}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {seriesToRender?.map((series) => (
              <div
                key={series._id}
                onClick={() => setSelectedSeries(series)}
                className={`p-2 border rounded cursor-pointer transition-colors ${
                  series?._id === selectedSeries?._id ? "bg-gray-200" : ""
                } `}
              >
                <div className="font-semibold text-gray-900 text-sm mb-1">
                  {series?.seriesName}
                </div>
                <div className="text-xs text-gray-600">
                  Next: {generateSeriesFormat(series)}
                </div>
              </div>
            ))}
          </div>

          {seriesToRender?.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <p className="text-xs">No series available for {titleText}</p>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={!selectedSeries || loading}
              className={`px-4 py-1.5 text-xs text-white transition-colors rounded ${
                selectedSeries
                  ? "bg-gray-600 hover:bg-gray-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <LoaderCircle className="animate-spin" size={16} />
                  <span className="ml-2">Loading...</span>
                </span>
              ) : (
                "Select"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VoucherSeriesModal;
