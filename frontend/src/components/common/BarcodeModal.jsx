/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import useFetch from "../../customHook/useFetch";
import { useSelector } from "react-redux";
import CustomBarLoader from "./CustomBarLoader";

const BarcodeModal = ({ isOpen, onClose, product }) => {
  const [selectedBarcode, setSelectedBarcode] = useState("");
  const [mrp, setMrp] = useState("");
  const [splCode, setSplCode] = useState("");
  const [barcodeItemName, setBarcodeItemName] = useState("");
  const [barcodeList, setBarcodeList] = useState([]);
  

  console.log("barcodeitemanme", barcodeItemName);
  

  const { _id: cmp_id, name: company_name } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const {
    data: apiData,
    loading,
    // refreshHook,
  } = useFetch(`/api/sUsers/getBarcodeList/${cmp_id}`);

  useEffect(() => {
    if (apiData) {
      setBarcodeList(apiData?.data);
    }
  }, [apiData]);

  const handlePrint = () => {

    if(!selectedBarcode) {
      alert("Please select a Barcode");
    }
    if (selectedBarcode) {
      const currentBarcode = barcodeList.find(
        (item) => item._id === selectedBarcode
      );

      const productName = product?.product_name;
      const companyName = company_name;
      const productCode = product?.product_code;

      // Replace placeholders in format1 and format2 with actual values
      const format1WithValues = currentBarcode.format1
        .replace(/\${productName}/g, productName)
        .replace(/\${productCode}/g, productCode)
        .replace(/\${companyName}/g, companyName)
        .replace(/\${mrp}/g, mrp)
        .replace(/\${splCode}/g, splCode)
        .replace(/\${barcodeItemName}/g, barcodeItemName);
        

      // const format2WithValues = currentBarcode.format2
      //   .replace(/\${productName}/g, productName)
      //   .replace(/\${productCode}/g, productCode);

      // Combine both formats side by side
      const combinedFormat = `
        ${currentBarcode.printOn}
        ${format1WithValues}
        ${currentBarcode.printOff}
      `;

      // Log the command for debugging
      console.log("Generated Command for Double Sticker:", combinedFormat);

      // Create a Blob from the command
      const blob = new Blob([combinedFormat], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      // Open a new window or tab and print the Blob
      const printWindow = window.open("", "_blank");
      printWindow.document.write(
        "<html><head><title>Print Command</title></head><body>"
      );
      printWindow.document.write("<pre>" + combinedFormat + "</pre>");
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();

      // Clean up the object URL
      URL.revokeObjectURL(url);
      onClose();
      setMrp("");
      setSplCode("");
      setSelectedBarcode("");

    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-lg shadow-lg  w-96">
        <div className="bg-[#0a9396] p-4 ">
          <h2 className="text-lg font-semibold text-white ">Select Barcode</h2>
        </div>
        {loading && <CustomBarLoader />}

        <div className="p-6">
          <div className="mb-4">
            <label
              htmlFor="barcode-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Barcode:
            </label>
            <select
              id="barcode-select"
              value={selectedBarcode}
              onChange={(e) => setSelectedBarcode(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="" disabled>
                Select a barcode
              </option>
              {barcodeList.map((barcode, index) => (
                <option key={index} value={barcode._id}>
                  {barcode.stickerName}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="barcode-item-name"
              className=" block text-sm font-medium text-gray-700 mb-1"
            >
              Barcode Item Name:
            </label>
            <input
              type="text"
              id="barcode-item-name"
              value={barcodeItemName}
              onChange={(e) => setBarcodeItemName(e.target.value)}
              placeholder="Enter Barcode Item Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="mrp"
              className=" block text-sm font-medium text-gray-700 mb-1"
            >
              MRP:
            </label>
            <input
              type="text"
              id="mrp"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              placeholder="Enter MRP"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="spl-code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              SPL Code:
            </label>
            <input
              type="text"
              id="spl-code"
              value={splCode}
              onChange={(e) => setSplCode(e.target.value)}
              placeholder="Enter SPL Code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
            >
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeModal;
