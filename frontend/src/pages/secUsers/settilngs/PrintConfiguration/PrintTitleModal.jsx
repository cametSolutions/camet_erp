/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomBarLoader from "../../../../components/common/CustomBarLoader";

function PrintTitleModal({ isOpen, onClose, onSubmit, data = {}, loading }) {
  const [printTitle, setPrintTitle] = useState("");

  useEffect(() => {
    setPrintTitle(data?.printTitle || "");
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!printTitle) {
      window.alert("Please enter print title");
      return;
    }
    onSubmit(printTitle);
    setPrintTitle("");
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] w-[340px] sm:w-full bg-gray-900 border-slate-700 text-white">
        <DialogHeader className="flex flex-row items-center space-y-0 pb-4">
          <div className="bg-blue-600 rounded-full p-2 mr-3">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
            </svg>
          </div>
          <div>
            <DialogTitle className="text-xl font-semibold text-white">
              Enter Print Title
            </DialogTitle>
            <p className="text-sm text-slate-400 mt-1">
              Choose a title to configure for your print
            </p>
          </div>
        </DialogHeader>
        
        {loading && <CustomBarLoader />}

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <div className="space-y-3">
            <Label htmlFor="printTitle" className="text-sm font-medium text-white">
              Print Title
            </Label>
            <Input
              id="printTitle"
              type="text"
              value={printTitle}
              onChange={(e) => setPrintTitle(e.target.value)}
              placeholder="Enter your print title..."
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500 h-12"
            />
          </div>

          <DialogFooter className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700 font-medium px-6 py-2"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PrintTitleModal;