/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useState, useCallback, useRef } from "react";
import api from "../../../api/api";
import { toast } from "sonner";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import * as XLSX from "xlsx-js-style";

import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { useSelector } from "react-redux";

import SearchBar from "../../../components/common/SearchBar";
import { PiBarcode } from "react-icons/pi";
import BarcodeModal from "../../../components/common/BarcodeModal";
import TitleDiv from "@/components/common/TitleDiv";
import { FaFileExcel } from "react-icons/fa";
import { Progress } from "@/components/ui/progress";

function ProductListSecondary() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [listHeight, setListHeight] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProductForPrint, setSelectedProductForPrint] = useState(null);
  
  // Excel export states
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const listRef = useRef();
  const searchTimeoutRef = useRef(null);
  const limit = 60; // Number of products per page

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );

  // Debounced search function
  const searchData = (data) => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout to update the search term after 500ms
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(data);
      // Reset pagination when searching
      setPage(1);
      setProducts([]);
      setHasMore(true);
    }, 500);
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const fetchProducts = useCallback(
    async (pageNumber = 1, searchTerm = "") => {
      if (isLoading) return;

      setIsLoading(true);
      setLoader(pageNumber === 1);

      try {
        const params = new URLSearchParams({
          page: pageNumber,
          limit,
        });

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        const res = await api.get(
          `/api/sUsers/getProducts/${cmp_id}?${params}`,
          {
            withCredentials: true,
          }
        );

        if (pageNumber === 1) {
          setProducts(res.data.productData);
        } else {
          setProducts((prevProducts) => [
            ...prevProducts,
            ...res.data.productData,
          ]);
        }

        setHasMore(res.data.pagination.hasMore);
        setPage(pageNumber);
      } catch (error) {
        console.log(error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setLoader(false);
      }
    },
    [cmp_id]
  );

  useEffect(() => {
    fetchProducts(1, searchTerm);
  }, [fetchProducts, searchTerm]);

  const handleDelete = async (id) => {
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirmation.isConfirmed) {
      setLoader(true);
      try {
        const res = await api.delete(`/api/sUsers/deleteProduct/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        await Swal.fire({
          title: "Deleted!",
          text: res.data.message,
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== id)
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete product"
        );
        console.log(error);
      } finally {
        setLoader(false);
      }
    }
  };

  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 95;
      setListHeight(newHeight);
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  const handlePrint = (el) => {
    setOpenModal(true);
    setSelectedProductForPrint(el);
  };

  // Excel export function
  const handleExcelExport = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      setExportProgress(10);

      // Build search params
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      setExportProgress(30);

      // Fetch all products
      const res = await api.get(
        `/api/sUsers/getAllProductsForExcel/${cmp_id}?${params}`,
        {
          withCredentials: true,
        }
      );

      setExportProgress(60);

      const excelData = res.data.data;

      if (!excelData || excelData.length === 0) {
        toast.info("No products found to export");
        return;
      }

      setExportProgress(80);

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Style the header row
      const headerStyle = {
        fill: { fgColor: { rgb: "4F46E5" } },
        font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };

      // Apply header styles
      const headerKeys = Object.keys(excelData[0]);
      headerKeys.forEach((key, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
        if (!ws[cellAddress]) ws[cellAddress] = {};
        ws[cellAddress].s = headerStyle;
      });

      // Set column widths
      const columnWidths = [
        { wch: 30 }, // Product Name
        { wch: 15 }, // Product Code
        { wch: 20 }, // Product Master ID
        { wch: 15 }, // HSN Code
        { wch: 20 }, // Brand
        { wch: 20 }, // Category
        { wch: 20 }, // Sub Category
        { wch: 10 }, // Unit
        { wch: 15 }, // Balance Stock
        { wch: 15 }, // Purchase Price
        { wch: 15 }, // Purchase Cost
        { wch: 12 }, // MRP
        { wch: 10 }, // CGST %
        { wch: 10 }, // SGST %
        { wch: 10 }, // IGST %
        { wch: 12 }, // CESS %
        { wch: 15 }, // Additional CESS %
        { wch: 15 }, // Batch Enabled
        { wch: 15 }, // Godown Enabled
        { wch: 12 }, // Alt Unit
        { wch: 18 }, // Alt Unit Conversion
        { wch: 15 }, // Unit Conversion
      ];
      ws['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Products");

      setExportProgress(95);

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `Products_Export_${currentDate}.xlsx`;

      // Download the file
      XLSX.writeFile(wb, filename);

      setExportProgress(100);

      toast.success(`Excel file downloaded successfully! (${excelData.length} products)`);

    } catch (error) {
      console.error('Excel export error:', error);
      toast.error(error.response?.data?.message || "Failed to export Excel file");
    } finally {
      // Reset states after a small delay
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
    }
  };

  // Items loaded status for InfiniteLoader
  const isItemLoaded = (index) => index < products.length;

  // Load more items when reaching the end
  const loadMoreItems = () => {
    if (!isLoading && hasMore) {
      return fetchProducts(page + 1, searchTerm);
    }
    return Promise.resolve();
  };

  const Row = ({ index, style }) => {
    if (!isItemLoaded(index)) {
      return (
        <div
          style={style}
          className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex flex-col rounded-sm"
        >
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const el = products[index];
    if (!el) return null;

    const adjustedStyle = {
      ...style,
      marginTop: "16px",
      height: "128px",
    };

    return (
      <div
        key={index}
        style={adjustedStyle}
        className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex flex-col rounded-sm cursor-pointer hover:bg-slate-100"
      >
        <div className="">
          <p className="font-bold text-sm">{el?.product_name}</p>
        </div>
        <hr className="mt-4" />
        <div className="flex justify-between items-center w-full gap-3 mt-4 text-sm">
          <div className="flex flex-col">
            <div className="flex gap-2 text-sm">
              <div className="flex gap-2 text-nowrap">
                <p className="text-gray-500 uppercase">Hsn :</p>
                <p className="text-gray-500">{el?.hsn_code}</p>
              </div>
              <div className="flex gap-2">
                <p className="text-gray-500">Tax :</p>
                <p className="text-gray-500">{`${el?.igst} %`}</p>
              </div>
            </div>

            {el?.item_mrp && (
              <div className="flex gap-2 text-nowrap">
                <p className="text-gray-500 uppercase">MRP :</p>
                <p className="text-gray-500">{el?.item_mrp}</p>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <div
              className={`
                ${type !== "self" ? "pointer-events-none opacity-50" : ""}  
                flex gap-3 px-4`}
            >
              <Link to={`/sUsers/editProduct/${el._id}`}>
                <FaEdit className="text-blue-500" />
              </Link>

              <MdDelete
                onClick={() => {
                  handleDelete(el._id);
                }}
                className="text-red-500"
              />
            </div>
            <PiBarcode onClick={() => handlePrint(el)} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <BarcodeModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        product={selectedProductForPrint}
      />
      
      {/* Excel Export Progress Modal */}
      {isExporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Exporting Products to Excel
            </h3>
            <Progress value={exportProgress} className="w-full mb-4" />
            <p className="text-sm text-gray-600 text-center">
              {exportProgress < 30 && "Preparing export..."}
              {exportProgress >= 30 && exportProgress < 60 && "Fetching products data..."}
              {exportProgress >= 60 && exportProgress < 80 && "Processing data..."}
              {exportProgress >= 80 && exportProgress < 95 && "Generating Excel file..."}
              {exportProgress >= 95 && "Download starting..."}
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              {exportProgress}% complete
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 bg-slate-50 h-screen overflow-hidden">
        <div className="sticky top-0 z-20">
          <TitleDiv
            loading={loader}
            title="Your Products"
            dropdownContents={[
              {
                title: "Add Products",
                to: "/sUsers/addProduct",
              },
            ]}
            rightSideContent={
              <FaFileExcel 
                className={`text-lg cursor-pointer transition-colors duration-200 ${
                  isExporting 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-green-600 hover:text-green-700'
                }`} 
              />
            }
            rightSideContentOnClick={handleExcelExport}
          />

          <SearchBar onType={searchData} />
        </div>

        {!loader && !isLoading && products.length === 0 && (
          <div className="flex justify-center items-center mt-20 overflow-hidden font-bold text-gray-500">
            Oops!!.No Products Found
          </div>
        )}

        <div className="pb-4">
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={hasMore ? products.length + 1 : products.length}
            loadMoreItems={loadMoreItems}
            threshold={10}
          >
            {({ onItemsRendered, ref }) => (
              <List
                className="pb-4"
                height={listHeight}
                itemCount={hasMore ? products.length + 1 : products.length}
                itemSize={140}
                onItemsRendered={onItemsRendered}
                ref={(listInstance) => {
                  ref(listInstance);
                  listRef.current = listInstance;
                }}
              >
                {Row}
              </List>
            )}
          </InfiniteLoader>
        </div>

        {isLoading && !loader && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
    </>
  );
}

export default ProductListSecondary;