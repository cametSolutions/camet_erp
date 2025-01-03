/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
import { CiCircleRemove, CiSearch } from "react-icons/ci";
import { useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash/debounce";
import { useSelector } from "react-redux";
import CustomBarLoader from "../../common/CustomBarLoader";
import { PiBarcode } from "react-icons/pi";





const BarcodeScan = ({handleBarcodeScanProducts}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeBuffer, setBarcodeBuffer] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoding, setSearchLoading] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [localProducts, setLocalProducts] = useState([]); // New state for local products

  const location = useLocation();
  const path = location.pathname;
  let redux = path.includes("/purchase") ? "purchase" : "salesSecondary";

  // get products from redux
  const reduxProducts = useSelector((state) => state[redux].products);
   // Sync redux products with local state
   useEffect(() => {
    if (reduxProducts) {
      setLocalProducts(reduxProducts);
    }
  }, [reduxProducts]);


  // Reference to track if the current search is from barcode
  const isBarcodeSearch = useRef(false);

  // Debounced search for manual typing only
  const handleManualSearch = useCallback(
    debounce((term) => {
      setSearchLoading(true);

      if (!term.trim() || isBarcodeSearch.current) {
        setShowDropdown(false);
        setSearchLoading(false);

        return;
      }

      const searchResults = localProducts.filter((product) => {
        const searchLower = term.toLowerCase();
        return (product?.product_name?.toLowerCase().includes(searchLower) || product?.product_code == searchLower);
      });

      if (searchResults.length === 0) {
        setFilteredProducts([]);

        setSearchLoading(false);
        setErrorMessage("Product not found with this name.");
        return;
      }

      setFilteredProducts(searchResults);
      setSearchLoading(false);
      setShowDropdown(true);
    }, 300),
    [localProducts]
  );

  // Immediate search for barcode scans
 // Modified barcode search to handle initial state
 const handleBarcodeSearch = (barcode) => {
  setSearchLoading(true);
 

  isBarcodeSearch.current = true;

  if (!barcode.trim()) {
    setSearchLoading(false);
    return;
  }

  // Ensure we have products to search through
  if (!localProducts || localProducts.length === 0) {
    console.log("No local products available yet");
    setSearchLoading(false);
    setErrorMessage("Product database not loaded. Please try again.");
    return;
  }

  const searchResults = localProducts.filter((product) => {
    return product?.product_code === barcode;
  });


  if (searchResults.length === 0) {
    setSearchLoading(false);
    setErrorMessage("Product not found with this code.");
    return;
  }

  setSelectedProducts(searchResults);
  setSearchLoading(false);
  setShowDropdown(false);
  setSearchTerm("");
};


  // Global listener for barcode scans
  useEffect(() => {
    let lastKeyTime = Date.now();
    let tempBuffer = ""; // Temporary buffer to collect characters
    const KEYPRESS_TIMEOUT = 50;

    const handleKeydown = (e) => {
      const currentTime = Date.now();
      const timeSinceLastKey = currentTime - lastKeyTime;

      if (timeSinceLastKey < KEYPRESS_TIMEOUT) {
        // Don't update barcodeBuffer yet, just collect in tempBuffer
        if (e.key !== "Enter") {
          tempBuffer += e.key;
        }
      } else {
        // Reset for manual typing
        tempBuffer = e.key;
        setIsScanning(false);
      }

      lastKeyTime = currentTime;

      // Only set barcodeBuffer when Enter is pressed
      if (e.key === "Enter") {
        if (tempBuffer) {
          isBarcodeSearch.current = true; // Ensure the current search is marked as barcode
          // Now we set the complete barcode at once
          setBarcodeBuffer(tempBuffer);
          handleBarcodeSearch(tempBuffer);
          tempBuffer = ""; // Clear temp buffer
          setIsScanning(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [localProducts]);

  const handleInputChange = (e) => {
    setErrorMessage("");
    const value = e.target.value;
    setSearchTerm(value);
    setIsScanning(false);
    isBarcodeSearch.current = false;
    handleManualSearch(value);
  };

  const handleProductSelect = (product) => {
    setSelectedProducts([product]);
    setShowDropdown(false);
    setSearchTerm("");
  };

  useEffect(() => {
    if (selectedProducts.length > 0) {
      handleBarcodeScanProducts(selectedProducts);
    }
  }, [selectedProducts]);

  

  

  


  return (
    <div>
       <div className="relative">
          <div className="flex items-center p-2 px-4 bg-white shadow-lg relative">
            <PiBarcode size={20} className="mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              className="no-focus-box border-none w-full pr-8"
              placeholder="Scan barcode or type product name..."
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setErrorMessage("");
                }}
                className="absolute right-3 text-gray-400 hover:text-gray-600"
              >
                <CiCircleRemove size={20} />
              </button>
            )}
            <div></div>
          </div>
          {errorMessage && (
            <div className="p-2 px-4 font-semibold  w-full bg-wite shadow-lg flex items-center text-xs text-gray-500">
              {errorMessage}
            </div>
          )}

          {searchLoding && <CustomBarLoader />}

          {/* Dropdown for manual search */}
          {showDropdown && filteredProducts.length > 0 && (
            <div className="absolute  bg-white border w-3/4 sm:w-1/2 shadow-lg mt-1 max-h-64 overflow-y-auto z-100 mx-1 ">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="  hover:bg-gray-200 cursor-pointer "
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="text-xs font-semibold p-3 px-4">
                    {product.product_name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default BarcodeScan;
