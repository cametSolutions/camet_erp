import { useState, useMemo, useEffect } from "react";
import TitleDiv from "../../../../../../components/common/TitleDiv";
import SelectedBarcode from "./SelectedBarcode";
import { addBarcodeData,removeAll } from "../../../../../../../slices/barcodeSlice";
import { useDispatch, useSelector } from "react-redux";
import api from "../../../../../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  // Get the barcode data from Redux
  const barcodeData = useSelector((state) => state.barcode);
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  // console.log("barcodeData", barcodeData);

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
      // Check if the line contains a colon within double quotes
      const match = line.match(/"([^"]*):([^"]*)"/);
      if (match) {
        // If colon is present, replace only the part after the colon inside the quotes
        return line.replace(match[2], `\${${replacement}}`);
      } else {
        // If no colon is present, replace the entire value inside the quotes
        return line.replace(/"([^"]*)"/, `"\${${replacement}}"`);
      }
    }
    return line;
  });

  useEffect(() => {
    if (activeTab === "label1") {
      dispatch(
        addBarcodeData({
          format1: modifiedLines.join("\n"),
        })
      );
    } else {
      dispatch(
        addBarcodeData({
          format2: modifiedLines.join("\n"),
        })
      );
    }
  }, [modifiedLines]);

  const submitHandler = async () => {
    const { _id, stickerName, printOn, printOff, format1, format2 } =
      barcodeData;

    const data = {
      _id: _id || "",
      stickerName,
      printOn,
      printOff,
      format1,
      format2,
    };

    const method = _id === "" ? "POST" : "PUT";

    const url =
      _id === ""
        ? `/api/sUsers/addBarcodeData/${cmp_id}`
        : `/api/sUsers/editBarcodeData/${_id}/${cmp_id}`;

    try {
      const res = await api[method.toLowerCase()](url, data, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success("Barcode Format Updated Successfully");
      dispatch(removeAll());
      navigate("/sUsers/barcodeList");
      
  
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-50">
        <TitleDiv
          title="Barcode Format"
          from="/sUsers/barcodeCreationDetails"
        />
        <SelectedBarcode />
      </div>
      <div className="max-w-6xl p-6 bg-white shadow-xl m-5 border ">
        <div className="bg-white shadow-md rounded-lg ">
          {/* Tabs */}
          <div className="flex border-b px-4 w-1/2">
            {["label1", "label2"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 text-gray-500 text-sm  font-bold
                ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 shadow-xl text-gray-700 "
                    : " hover:bg-gray-100"
                }`}
              >
                {tab === "label1" ? "Label 1" : "Label 2"}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="grid grid-cols-2 gap-4 p-4">
            {/* Left Section - Textarea */}
            <div className="">
              <textarea
                value={textareaContents[activeTab]}
                onChange={handleTextareaChange}
                placeholder="Paste your PRN label content here..."
                className="w-full h-[400px] p-2 resize-none overflow-x-auto whitespace-nowrap bg-[#d8edff] border-none shadow-lg
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
        </div>

        <button
          className="bg-pink-500 w-full mt-4 ml-4 w-20 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
          type="button"
          onClick={submitHandler}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default BarcodeFormat;
