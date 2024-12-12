/* eslint-disable react/jsx-key */
import { TbPrinter, TbLayoutGridAdd, TbSettings } from "react-icons/tb";
import TitleDiv from "../../../../../../components/common/TitleDiv";
import SettingsCard from "../../../../../../components/common/SettingsCard";

import SelectedBarcode from "./SelectedBarcode";

const BarcodeCreationDetails = () => {

  const settingsOptions = [
    {
      title: "Print On",
      description: "Select the material or surface to print the barcode.",
      icon: <TbPrinter />,
      to: "/sUsers/barcodePrintOn",
      active: true,
    },
    {
      title: "Format",
      description: "Choose the format and layout for the barcode.",
      icon: <TbLayoutGridAdd />,
      to: "/sUsers/barcodeFormat",
      active: true,
    },
    {
      title: "Print Off",
      description: "Configure settings for ending the printing process.",
      icon: <TbSettings />,
      to: "/sUsers/barcodePrintOff",
      active: true,
    },
  ];

  return (
    <div className="bg-white">
      <TitleDiv title="Barcode Creation" from="/sUsers/barcodeList" />
      <SelectedBarcode />
      <div className="space-y-4 bg-white p-4 mx-1">
        {settingsOptions.map((option, index) => (
          <SettingsCard key={index} option={option} index={index} />
        ))}
      </div>
    </div>
  );
};

export default BarcodeCreationDetails;
