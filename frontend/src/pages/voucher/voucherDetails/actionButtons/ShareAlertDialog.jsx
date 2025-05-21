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
import { useNavigate } from "react-router-dom";
// import { Scroll } from "lucide-react";
import { HiDocument } from "react-icons/hi2";
import { IoDocumentTextSharp } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export function ShareAlertDialog({ open, setOpen, voucherId,voucherType }) {
  const [selectedFormat, setSelectedFormat] = useState("tax-invoice");
  const navigate = useNavigate();

  const formats = [
    {
      id: "tax-invoice",
      label: "Tax Invoice",
      icon: <IoDocumentTextSharp size={25} />,
      to: "/invoice/pdf",
    },
    {
      id: "pos",
      label: "POS Format",
      icon: <HiDocument size={25} />,
    },
    {
      id: "mail",
      label: "Mail",
      icon: <MdEmail size={25} />,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <FaWhatsapp size={25} />,
    },
  ];

  const handleContinue = () => {
    // Handle different cases here
    switch (selectedFormat) {
      case "tax-invoice":
      case "pos":
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
            Select Invoice Format
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Choose the format you want to share
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-6">
          <RadioGroup
            value={selectedFormat}
            onValueChange={setSelectedFormat}
            className="flex justify-center gap-6 flex-wrap"
          >
            {formats.map((format) => (
              <div
                key={format.id}
                className={`flex flex-col items-center cursor-pointer ${
                  selectedFormat === format.id ? "opacity-100" : "opacity-70"
                } hover:opacity-100 transition-all`}
                onClick={() => setSelectedFormat(format.id)}
              >
                <div
                  className={`p-4 rounded-full ${
                    selectedFormat === format.id
                      ? "bg-gray-700 border-2 border-white"
                      : "bg-gray-800 border-2 border-gray-600"
                  } mb-3`}
                >
                  {format.icon}
                </div>
                <div className="flex items-center justify-center">
                  <RadioGroupItem
                    value={format.id}
                    id={format.id}
                    className="hidden"
                  />
                  <Label
                    htmlFor={format.id}
                    className="text-center cursor-pointer font-medium text-gray-200"
                  >
                    {format.label}
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
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
