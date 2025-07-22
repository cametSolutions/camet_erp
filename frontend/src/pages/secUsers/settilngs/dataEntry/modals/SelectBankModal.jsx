/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import useFetch from "../../../../../customHook/useFetch";
import { useSelector } from "react-redux";
import { BarLoader } from "react-spinners";
import api from "../../../../../api/api";
import { useDispatch } from "react-redux";
import { updateConfiguration } from "../../../../../../slices/secSelectedOrgSlice";
import { FaUniversity } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function SelectBankModal({ showModal = true, setShowModal }) {
  const [selectedBank, setSelectedBank] = React.useState("");
  const [bankList, setBankList] = React.useState([]);
  const [submitLoading, setSubmitLoading] = React.useState(false);

  const dispatch = useDispatch();

  const { _id: cmp_id, configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const { data, loading, error } = useFetch(`/api/sUsers/fetchBanks/${cmp_id}`);

  useEffect(() => {
    if (data) {
      setBankList(data.data);
    }
    if (configurations?.length > 0) {
      setSelectedBank(configurations[0].bank || "");
    }
  }, [data, configurations]);

  const handleBankChange = (value) => {
    setSelectedBank(value);
  };

  const handleSubmit = async () => {
    if (!selectedBank) {
      toast.error("Please select a bank account.");
      return;
    }

    const data = { bankAccount: selectedBank };

    try {
      setSubmitLoading(true);

      const res = await api.put(
        `/api/sUsers/updateBankAccount/${cmp_id}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success(res.data.message);
      setShowModal(false);
      dispatch(updateConfiguration(res.data.data));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update bank account."
      );
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
        {/* Loading Bar */}
        {(loading || submitLoading) && (
          <div className="absolute top-0 left-0 right-0 z-50">
            <BarLoader
              color="#3b82f6"
              width="100%"
              className="rounded-t-lg"
            />
          </div>
        )}

        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-full">
              <FaUniversity size={20} className="text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-white">
                Select Bank Account
              </DialogTitle>
              <DialogDescription className="text-gray-400 mt-1">
                Choose a bank account to configure for your organization
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">
                {error.response?.data?.message || "Failed to fetch banks."}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="bankSelect" className="text-sm font-medium text-gray-200">
              Bank Account
            </Label>
            <Select
              value={selectedBank || ""}
              onValueChange={handleBankChange}
              disabled={loading || error}
            >
              <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500">
                <SelectValue 
                  placeholder={
                    loading 
                      ? "Loading bank accounts..." 
                      : bankList?.length > 0 
                        ? "Select a bank account"
                        : "No banks found"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {bankList?.length > 0 ? (
                  bankList
                    ?.filter((bank) => bank?.bank_name !== "null")
                    ?.map((bank, index) => (
                      <SelectItem 
                        key={index} 
                        value={bank?._id}
                        className="text-white hover:bg-gray-700 focus:bg-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <FaUniversity size={14} className="text-gray-400" />
                          <span>
                            {bank?.bank_ledname?.length > 35
                              ? bank?.bank_ledname?.substring(0, 35) + "..."
                              : bank?.bank_ledname}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                ) : (
                  !loading && (
                    <SelectItem value="no-banks" disabled className="text-gray-400">
                      No banks available
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => setShowModal(false)}
            className="bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || bankList.length === 0 || submitLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
          >
            {submitLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}