/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MdEmail, MdFileDownload } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

export function SharingMethodSelector({
  open,
  setOpen,
  handleDownload,
}) {
  const [selectedMethod, setSelectedMethod] = useState("download");

  const methods = [
    { id: "download", label: "Download / Print", icon: <MdFileDownload size={20} /> },
    { id: "whatsapp", label: "WhatsApp", icon: <FaWhatsapp size={20} /> },
    { id: "mail", label: "Mail", icon: <MdEmail size={20} /> },
  ];

  const handleContinue = () => {
    if (selectedMethod === "download") {
      handleDownload();
    }
    else if (selectedMethod === "whatsapp") {
      alert("This feature is not available yet.");
    } else if (selectedMethod === "mail") {
      alert("This feature is not available yet.");
    }
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md bg-gray-900 text-white border-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-white">
            Share via
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Choose a method to share the document
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-6 space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-200 mb-3 block">
              Select Method
            </Label>
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Choose method" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {methods.map((method) => (
                  <SelectItem
                    key={method.id}
                    value={method.id}
                    className="text-white hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      {method.icon}
                      <span>{method.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="bg-red-600 hover:bg-red-700 text-white hover:text-white border border-red-500">
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-500"
          >
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
