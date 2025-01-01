import { CiSearch } from "react-icons/ci";
import { useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash/debounce";
import { useSelector } from "react-redux";
import TitleDiv from "../../common/TitleDiv";

const BarcodeScan = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeBuffer, setBarcodeBuffer] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const location = useLocation();
  const path = location.pathname;
  let redux = path.includes("/purchase") ? "purchase" : "salesSecondary";

  // get products from redux
  const products = useSelector((state) => state[redux].products);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Reference to track if the current search is from barcode
  const isBarcodeSearch = useRef(false);

  // Debounced search for manual typing only
  const handleManualSearch = useCallback(
    debounce((term) => {
      if (!term.trim() || isBarcodeSearch.current) {
        setShowDropdown(false);
        return;
      }

      const searchResults = products.filter((product) => {
        const searchLower = term.toLowerCase();
        return product?.product_name?.toLowerCase().includes(searchLower);
      });

      console.log("maual");
      

      setFilteredProducts(searchResults);
      setShowDropdown(true);
    }, 300),
    [products]
  );

  // console.log("barcode", barcode);

  // Immediate search for barcode scans
  const handleBarcodeSearch = (barcode) => {

    console.log("barcode", barcode);
    
    isBarcodeSearch.current = true; // Mark as barcode search

    if (!barcode.trim()) {
      
      setFilteredProducts([]);
      return;
    }

    const searchResults = products.filter(
      (product) => product?.product_code === barcode
    );

    console.log("searchResults", searchResults);

    setFilteredProducts(searchResults);
    setShowDropdown(false); // Don't show dropdown for barcode searches
    setSearchTerm(barcode);
  };

  console.log("filteredProducts", filteredProducts);

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
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsScanning(false);
    isBarcodeSearch.current = false;
    handleManualSearch(value);
  };

  const handleProductSelect = (product) => {
    console.log("Selected product:", product);
    setSearchTerm(product.product_name);
    setShowDropdown(false);
  };

  return (
    <div>
      <div className="sticky top-0 bg-white z-50">
        <TitleDiv title="Scan Barcode" />

        <div className="relative">
          <div className="flex items-center p-2 px-4 bg-white shadow-lg">
            <CiSearch size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              className="no-focus-box border-none w-full"
              placeholder="Scan barcode or type product name..."
            />
          </div>

          {/* Dropdown for manual search */}
          {showDropdown && filteredProducts.length > 0 && (
            <div className="absolute w-full bg-white border rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto z-50">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="font-medium">{product.product_name}</div>
                  <div className="text-sm text-gray-600">
                    Code: {product.product_code}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main results area */}
      <div className="mt-4 px-4">
        {filteredProducts.length > 0 && !showDropdown ? (
          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleProductSelect(product)}
              >
                <h3 className="font-medium">{product.product_name}</h3>
                <div className="text-sm text-gray-600">
                  <p>Code: {product.product_code}</p>
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm && !showDropdown ? (
          <div className="text-center text-gray-500 py-8">
            No products found matching "{searchTerm}"
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BarcodeScan;
