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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { HiDocument, HiPrinter } from "react-icons/hi2";
import { IoDocumentTextSharp } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export function ShareAlertDialog({ open, setOpen, voucherId, voucherType }) {
  const [selectedFormat, setSelectedFormat] = useState("tax-invoice");
  const [selectedAction, setSelectedAction] = useState("print");
  const navigate = useNavigate();

  const formats = [
    {
      id: "tax-invoice",
      label: "Tax Invoice",
      icon: <IoDocumentTextSharp size={20} />,
    },
    {
      id: "pos",
      label: "POS Format",
      icon: <HiDocument size={20} />,
    },
  ];

  const actions = [
    {
      id: "print",
      label: "Print",
      icon: <HiPrinter size={25} />,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <FaWhatsapp size={25} />,
    },
    {
      id: "mail",
      label: "Email",
      icon: <MdEmail size={25} />,
    },
  ];

  const handleContinue = () => {
    // Handle different cases here
    switch (selectedAction) {
      case "print":
        navigate(`/sUsers/share${voucherType}/${voucherId}?format=${selectedFormat}`);
        break;
      case "mail":
        // TODO: Add your email handling logic here
        alert("Mailing feature coming soon.");
        break;
      case "whatsapp":
        // TODO: Add your WhatsApp sharing logic here
        alert("WhatsApp sharing feature coming soon.");
        break;
      default:
        break;
    }

    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md bg-gray-900 text-white border-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-white">
            Share Invoice
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Choose the format and sharing method
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-6 space-y-6">
          {/* Format Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-200 mb-3 block">
              Select Format
            </Label>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Choose format" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {formats.map((format) => (
                  <SelectItem 
                    key={format.id} 
                    value={format.id}
                    className="text-white hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      {format.icon}
                      <span>{format.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-200 mb-3 block">
              Select Action
            </Label>
            <RadioGroup
              value={selectedAction}
              onValueChange={setSelectedAction}
              className="flex justify-center gap-6 flex-wrap"
            >
              {actions.map((action) => (
                <div
                  key={action.id}
                  className={`flex flex-col items-center cursor-pointer ${
                    selectedAction === action.id ? "opacity-100" : "opacity-70"
                  } hover:opacity-100 transition-all`}
                  onClick={() => setSelectedAction(action.id)}
                >
                  <div
                    className={`p-4 rounded-full ${
                      selectedAction === action.id
                        ? "bg-gray-700 border-2 border-white"
                        : "bg-gray-800 border-2 border-gray-600"
                    } mb-3`}
                  >
                    {action.icon}
                  </div>
                  <div className="flex items-center justify-center">
                    <RadioGroupItem
                      value={action.id}
                      id={action.id}
                      className="hidden"
                    />
                    <Label
                      htmlFor={action.id}
                      className="text-center cursor-pointer font-medium text-gray-200"
                    >
                      {action.label}
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
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