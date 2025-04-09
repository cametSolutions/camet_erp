import { useState, useRef, useEffect } from "react";
import TitleDiv from "../../../../../../components/common/TitleDiv";
import {
  addBarcodeData,
  removeAll,
} from "../../../../../../../slices/barcodeSlice";
import { useDispatch, useSelector } from "react-redux";
import api from "../../../../../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import SelectedBarcode from "./SelectedBarcode";

const labelOptions = [
  { value: "_id", label: "Product ID" },
  { value: "companyName", label: "Company Name" },
  { value: "productName", label: "Product Name" },
  { value: "productCode", label: "Product Code" },
  { value: "mrp", label: "MRP" },
  { value: "splCode", label: "Special Code" },
  { value: "barcodeItemName", label: "Barcode Item Name" },
];

const BarcodeFormat = () => {
  const [textareaContent, setTextareaContent] = useState("");
  const textareaRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const barcodeData = useSelector((state) => state.barcode);
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  // Initialize textarea content from Redux
  useEffect(() => {
    if (barcodeData.format1) {
      setTextareaContent(barcodeData.format1);
    }
  }, [barcodeData]);

  // Handler for textarea content change
  const handleTextareaChange = (e) => {
    const newContent = e.target.value;
    setTextareaContent(newContent);
    dispatch(addBarcodeData({ format1: newContent }));
  };

  // Insert selected replacement at current cursor position
  const handleReplacementSelect = (e) => {
    const selectedReplacement = e.target.value;
    if (!selectedReplacement) return;

    const textarea = textareaRef.current;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const currentContent = textareaContent;

    // Create the replacement string
    const replacementText = `\${${selectedReplacement}}`;

    // Insert the replacement
    const newContent =
      currentContent.slice(0, startPos) +
      replacementText +
      currentContent.slice(endPos);

    setTextareaContent(newContent);
    dispatch(addBarcodeData({ format1: newContent }));

    // Set focus back to textarea and position cursor after inserted text
    textarea.focus();
    const newCursorPos = startPos + replacementText.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);

    // Reset the select to default
    e.target.value = "";
  };

  const submitHandler = async () => {
    if(!textareaContent.trim()) {
      toast.error("Please enter a format");
      return;
    }
    const { _id, stickerName, printOn, printOff } = barcodeData;

    const data = {
      _id: _id || "",
      stickerName,
      printOn,
      printOff,
      format1: textareaContent,
      format2: "", // Keep this empty as per requirements
    };

    const method = _id === "" ? "POST" : "PUT";

    const url =
      _id === ""
        ? `/api/sUsers/addBarcodeData/${cmp_id}`
        : `/api/sUsers/editBarcodeData/${_id}/${cmp_id}`;

    try {
       await api[method.toLowerCase()](url, data, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success("Barcode Format Updated Successfully");
      dispatch(removeAll());
      navigate("/sUsers/barcodeList");
    } catch (error) {
      toast.error("Failed to update Barcode Format");
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
      <div className="max-w-6xl p-6 bg-white shadow-xl m-5 border">
        <div className="grid grid-cols-1 gap-4">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={textareaContent}
            onChange={handleTextareaChange}
            placeholder="Paste your PRN label content here..."
            className="w-full h-[350px] p-2 resize-none overflow-x-auto whitespace-nowrap bg-[#d8edff] border-none shadow-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          <div className="flex items-center space-x-2">
            {/* Replacement Selection */}
            <select
              onChange={handleReplacementSelect}
              className="w-full px-2 py-2 border rounded 
               focus:outline-none focus:ring-2 focus:ring-blue-300 
               text-sm h-10"
            >
              <option value="">Select replacement</option>
              {labelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Submit Button */}
            <button
              className="bg-pink-500 w-full text-white active:bg-pink-600 
               font-bold uppercase text-xs px-4 h-10 rounded shadow 
               hover:bg-pink-600 hover:shadow-lg 
               "
              type="button"
              onClick={submitHandler}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeFormat;
