/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import useFetch from "../../customHook/useFetch";
import { useSelector } from "react-redux";
import CustomBarLoader from "./CustomBarLoader";

const BarcodeModal = ({ isOpen, onClose }) => {
  const [selectedBarcode, setSelectedBarcode] = useState("");
  const [mrp, setMrp] = useState("");
  const [splCode, setSplCode] = useState("");
  const [barcodeList, setBarcodeList] = useState([]);

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg?._id
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
              onClick={() => {
                handlePrint();
              }}
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
