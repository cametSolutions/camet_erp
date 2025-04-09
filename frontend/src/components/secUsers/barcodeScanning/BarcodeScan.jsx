/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
import { CiCircleRemove } from "react-icons/ci";
import { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash/debounce";
import { useSelector } from "react-redux";
import CustomBarLoader from "../../common/CustomBarLoader";
import { PiBarcode } from "react-icons/pi";
import { FaMobileAlt } from "react-icons/fa";
import { Html5Qrcode } from "html5-qrcode";
import api from "../../../api/api";

const BarcodeScan = ({ handleBarcodeScanProducts }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scannerRef = useRef(null);

  // Get company ID from Redux or context
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  // Reference to track if the current search is from barcode
  const isBarcodeSearch = useRef(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
  }, []);

  // Debounced search for manual typing only
  const handleManualSearch = useCallback(
    debounce(async (term) => {
      setSearchLoading(true);

      if (!term.trim() || isBarcodeSearch.current) {
        setShowDropdown(false);
        setSearchLoading(false);
        return;
      }

      try {
        // Create the search params
        const params = new URLSearchParams({ search: term }).toString();

        // Call the API with search parameter
        const res = await api.get(
          `/api/sUsers/getProducts/${cmp_id}?${params}`,
          {
            withCredentials: true,
          }
        );

        const searchResults = res.data?.productData || [];

        if (searchResults.length === 0) {
          setFilteredProducts([]);
          setSearchLoading(false);
          setErrorMessage("Product not found with this name.");
          return;
        }

        setFilteredProducts(searchResults);
        setSearchLoading(false);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching products:", error);
        setErrorMessage("Failed to fetch products. Please try again.");
        setSearchLoading(false);
      }
    }, 300),
    [cmp_id]
  );

  // Search based on barcode/QR code value
  const handleBarcodeSearch = async (barcode) => {
    setSearchLoading(true);
    isBarcodeSearch.current = true;

    if (!barcode.trim()) {
      setSearchLoading(false);
      return;
    }

    try {
      // Create the search params with the barcode
      const params = new URLSearchParams({ search: barcode }).toString();

      // Call the API with search parameter
      const res = await api.get(`/api/sUsers/getProducts/${cmp_id}?${params}`, {
        withCredentials: true,
      });

      const searchResults = res.data?.productData || [];

      if (searchResults.length === 0) {
        setSearchLoading(false);
        setErrorMessage("Product not found with this code.");
        return;
      }

      setSelectedProducts(searchResults);
      setSearchLoading(false);
      setShowDropdown(false);
      setSearchTerm("");
      
      // Close the scanner if it's open
      if (showScanner) {
        stopScanner();
      }
    } catch (error) {
      console.error("Error fetching products by barcode:", error);
      setErrorMessage("Failed to fetch product. Please try again.");
      setSearchLoading(false);
    }
  };

  // Global listener for hardware barcode scanners
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
      }

      lastKeyTime = currentTime;

      // Only set barcodeBuffer when Enter is pressed
      if (e.key === "Enter") {
        if (tempBuffer) {
          isBarcodeSearch.current = true; // Ensure the current search is marked as barcode
          handleBarcodeSearch(tempBuffer);
          tempBuffer = ""; // Clear temp buffer
        }
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  // Function to initialize the camera scanner
  const startScanner = () => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;
    
    html5QrCode.start(
      { facingMode: "environment" }, // Use the rear camera
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText) => {
        // On successful scan
        handleBarcodeSearch(decodedText);
      },
      (errorMessage) => {
        // Ignore errors during scanning
        console.log(errorMessage);
      }
    ).catch((err) => {
      console.error("Failed to start scanner:", err);
      setErrorMessage("Failed to access camera. Please check permissions.");
    });
  };

  // Function to stop the scanner
  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          setShowScanner(false);
        })
        .catch((err) => {
          console.error("Failed to stop scanner:", err);
        });
    }
  };

  // Toggle camera scanner
  const toggleScanner = () => {
    if (showScanner) {
      stopScanner();
    } else {
      setShowScanner(true);
      // We need to wait for the DOM to render the reader div before starting the scanner
      setTimeout(() => {
        startScanner();
      }, 100);
    }
  };

  const handleInputChange = (e) => {
    setErrorMessage("");
    const value = e.target.value;
    setSearchTerm(value);
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

  // Clean up the scanner when component unmounts
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div className="relative">
        <div className="flex items-center p-2 px-4 bg-white shadow-lg relative">
          <PiBarcode size={20} className="mr-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            className="no-focus-box outline-none border-none w-full pr-8"
            placeholder="Scan barcode or type product name or code..."
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setErrorMessage("");
              }}
              className="absolute right-10 text-gray-400 hover:text-gray-600"
            >
              <CiCircleRemove size={20} />
            </button>
          )}
          {isMobile && (
            <button
              onClick={toggleScanner}
              className="absolute right-3 text-gray-500 hover:text-gray-700"
              title="Use camera to scan"
            >
              <FaMobileAlt size={20} />
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="p-2 px-4 font-semibold w-full bg-white shadow-lg flex items-center text-xs text-gray-500">
            {errorMessage}
          </div>
        )}

        {searchLoading && <CustomBarLoader />}

        {/* Camera Scanner */}
        {showScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Scan Barcode or QR Code</h3>
                <button
                  onClick={stopScanner}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <CiCircleRemove size={24} />
                </button>
              </div>
              <div id="reader" className="w-full aspect-square"></div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Position the code within the frame to scan
              </p>
            </div>
          </div>
        )}

        {/* Dropdown for manual search */}
        {showDropdown && filteredProducts.length > 0 && (
          <div className="absolute bg-white border w-3/4 sm:w-1/2 shadow-lg mt-1 max-h-64 overflow-y-auto z-40 mx-1">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="hover:bg-gray-200 cursor-pointer"
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