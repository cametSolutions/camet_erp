import { useState, useMemo, useEffect } from "react";
import TitleDiv from "../../../../../../components/common/TitleDiv";
import SelectedBarcode from "./SelectedBarcode";
import { addBarcodeData } from "../../../../../../../slices/barcodeSlice";
import { useDispatch, useSelector } from "react-redux";

const labelOptions = [
  { value: "companyName", label: "Company Name" },
  { value: "productName", label: "Product Name" },
  { value: "productCode", label: "Product Code" },
  { value: "mrp", label: "MRP" },
  { value: "splCode", label: "Special Code" },
];

const BarcodeFormat = () => {
  const [activeTab, setActiveTab] = useState("label1");
  const [textareaContents, setTextareaContents] = useState({
    label1: "",
    label2: "",
  });
  const [labelReplacements, setLabelReplacements] = useState({
    label1: {},
    label2: {},
  });

  const dispatch = useDispatch();

  // Get the barcode data from Redux
  const barcodeData = useSelector((state) => state.barcode);

  // Set initial textarea contents and label replacements from Redux data
  useEffect(() => {
    if (barcodeData.format1) {
      setTextareaContents((prev) => ({
        ...prev,
        label1: barcodeData.format1,
      }));
    }
    if (barcodeData.format2) {
      setTextareaContents((prev) => ({
        ...prev,
        label2: barcodeData.format2,
      }));
    }
    // Optionally set initial label replacements if needed
    // Example: Initialize label replacements based on previous data if necessary
  }, [barcodeData]);

  // Parse textarea content into lines
  const lines = useMemo(
    () =>
      textareaContents[activeTab]
        .split("\n")
        .filter((line) => line.trim() !== ""),
    [textareaContents, activeTab]
  );

  // Handler for textarea content change
  const handleTextareaChange = (e) => {
    setTextareaContents((prev) => ({
      ...prev,
      [activeTab]: e.target.value,
    }));

    let data;

    if (activeTab === "label1") {
      data = {
        format1: e.target.value,
      };
    } else if (activeTab === "label2") {
      data = {
        format2: e.target.value,
      };
    }

    dispatch(addBarcodeData(data));
  };

  // Handler for select change
  const handleSelectChange = (lineIndex, value) => {
    setLabelReplacements((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [lineIndex]: value, // Adding the dollar sign and enclosing in ${}
      },
    }));
  };

  // Modify lines based on replacements
  const modifiedLines = lines.map((line, index) => {
    const replacement = labelReplacements[activeTab][index];
    if (replacement) {
      // Extract the last quoted part
      const match = line.match(/"([^"]*)"$/);
      if (match) {
        return line.replace(match[1], `\${${replacement}}`); // Format when applying
      }
    }
    return line;
  });

  useEffect(() => {
    if (activeTab === "label1") {
      dispatch(addBarcodeData({
        format1: modifiedLines.join("\n")
      }));
    } else {
      dispatch(addBarcodeData({
        format2: modifiedLines.join("\n")
      }));
    }
  }, [modifiedLines]);

  return (
    <div>
      <div className="sticky top-0 z-50">
        <TitleDiv
          title="Barcode Format"
          from="/sUsers/barcodeCreationDetails"
        />
        <SelectedBarcode />
      </div>
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b">
            {["label1", "label2"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 font-semibold text-sm 
                ${
                  activeTab === tab
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab === "label1" ? "Label 1" : "Label 2"}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="grid grid-cols-2 gap-4 p-4">
            {/* Left Section - Textarea */}
            <div className="border rounded">
              <textarea
                value={textareaContents[activeTab]}
                onChange={handleTextareaChange}
                placeholder="Paste your PRN label content here..."
                className="w-full h-[500px] p-2 resize-none overflow-x-auto whitespace-nowrap 
                         focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Right Section - Replacement Selects */}
            <div className="space-y-2 overflow-y-auto max-h-[500px]">
              {lines.map((line, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-100 rounded"
                >
                  <span className="text-sm text-gray-600 mr-2">
                    Line {index + 1}
                  </span>
                  <select
                    value={labelReplacements[activeTab][index] || ""}
                    onChange={(e) => handleSelectChange(index, e.target.value)}
                    className="w-48 py-1 px-2 border rounded 
                             focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">Select replacement</option>
                    {labelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Section */}
          {/* <div className="p-4 bg-gray-100 border-t">
            <h3 className="text-lg font-semibold mb-2">Modified Lines</h3>
            <pre className="bg-white p-3 rounded border overflow-x-auto whitespace-pre">
              {modifiedLines.join("\n")}
            </pre>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default BarcodeFormat;
