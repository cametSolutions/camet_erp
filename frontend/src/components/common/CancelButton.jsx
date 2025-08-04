/* eslint-disable react/no-unescaped-entities */

/* eslint-disable react/prop-types */
import { useState } from "react";
import { MdCancel } from "react-icons/md";
import { toast } from "sonner";
import api from "../../api/api";

// Import Shadcn UI components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function CancelButton({
  id,
  voucherType,
  vanSale = false,
  isEditable,
  isConverted = false,
  setActionLoading,
  reFetch,
  actionLoading,
  cancellationAllowed,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (voucherType === "vanSale") {
    voucherType = "Sales";
    vanSale = true;
  }

  const handleCancelClick = () => {
    if (isEditable !== undefined && isEditable === false) {
      window.alert(
        "You can't cancel this voucher since it has been used to generate receipts or payments"
      );
      return;
    }
    if (isConverted !== undefined && isConverted === true) {
      window.alert(
        "You can't edit this voucher since it has been converted to sales"
      );
      return;
    }

    // Open the confirmation dialog
    setIsDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellationAllowed) {
      window.alert(
        "Cancellation not allowed: This entry is associated with another voucher."
      );
      setIsDialogOpen(false);
      return;
    }
    try {
      setActionLoading(true);
      await api.put(
        `/api/sUsers/cancel${voucherType}/${id}?vanSale=${vanSale}`,
        {},
        {
          withCredentials: true,
        }
      );

      toast.success("Your file has been cancelled successfully");
      reFetch();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to cancel");
    } finally {
      setActionLoading(false);
    }

    // Close the dialog
    setIsDialogOpen(false);
  };

  return (
    <div className={`${actionLoading ? "pointer-events-none opacity-50" : ""}`}>
      <div
        onClick={handleCancelClick}
        className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className={`p-2 rounded-full bg-gray-100 mb-2`}>
          <MdCancel className="text-red-500" />
        </div>
        <span className="text-[10px] font-bold">Cancel</span>
      </div>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-gray-900 text-white border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              You won't be able to revert this!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Cancel it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CancelButton;
