/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useState, useCallback, useRef } from "react";
import api from "../../../api/api";
import { toast } from "sonner";
import { FaEdit , FaFileExcel, FaFileUpload} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { useSelector } from "react-redux";
import SearchBar from "@/components/common/SearchBar";
import TitleDiv from "@/components/common/TitleDiv";

function ItemList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [listHeight, setListHeight] = useState(0);

  const listRef = useRef();
  const fileInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const limit = 60; // Number of rooms per page

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
const orgId = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg?._id
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
      setItems([]);
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

  const fetchRooms= useCallback(
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
        params.append('under' ,  'restaurant')
        const res = await api.get(`/api/sUsers/getItems/${cmp_id}?${params}`, {
          withCredentials: true,
        });

        console.log(res);

        if (pageNumber === 1) {
          setItems(res?.data?.roomData);
        } else {
          setItems((prevRooms) => [...prevRooms, ...res?.data?.roomData]);
        }

        setHasMore(res.data.pagination?.hasMore);
        setPage(pageNumber);
      } catch (error) {
        console.log(error);
        setHasMore(false);
        // toast.error("Failed to load rooms");
      } finally {
        setIsLoading(false);
        setLoader(false);
      }
    },
    [cmp_id]
  );

  useEffect(() => {
    // Fetch rooms whenever searchTerm changes (debounced)
    fetchRooms(1, searchTerm);
  }, [fetchRooms, searchTerm]);

console.log(items)
const handleExcelExport = () => {
  try {
    if (items.length === 0) {
      toast.warning("No items to export");
      return;
    }

    setLoader(true);

    // Prepare data for Excel with price levels
   const excelData  = items.map(item => {
  // Default empty rates
  let priceRate = "";
  let dineIn = "";
  let takeAway = "";
  let roomService = "";
  let delivery = "";

  item.Priceleveles?.forEach(pl => {
    const level = pl?.pricelevel || {}; // 👈 safeguard

    // generic/default rate
    if (!level.dineIn && !level.takeaway && !level.roomService && !level.delivery) {
      priceRate = pl.pricerate;
    }
    if (level.dineIn === "enabled") dineIn = pl.pricerate;
    if (level.takeaway === "enabled") takeAway = pl.pricerate;
    if (level.roomService === "enabled") roomService = pl.pricerate;
    if (level.delivery === "enabled") delivery = pl.pricerate;
  });

  return {
    "Product Name": item.product_name || "",
    "HSN Code": item.hsn_code || "",
    "Price Rate": priceRate,
    "Dine In": dineIn,
    "Take Away": takeAway,
    "Room Service": roomService,
    "Delivery": delivery,
    "Item ID": item._id || ""
  };
});


    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws["!cols"] = [
      { wch: 30 }, // Item Name
      { wch: 15 }, // HSN Code
      { wch: 12 }, // Price Rate
      { wch: 12 }, // Dine In
      { wch: 12 }, // Take Away
      { wch: 15 }, // Room Service
      { wch: 12 }, // Delivery
      { wch: 25 }, // Item ID
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Items Price Levels");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `Items_Price_Levels_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);

    toast.success(`Exported ${items.length} items successfully`);
    setLoader(false);
  } catch (error) {
    console.error("Export error:", error);
    toast.error("Failed to export items");
    setLoader(false);
  }
};

  // Excel Import Function - Updates using existing API
 const handleExcelImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    toast.error("Please upload a valid Excel file (.xlsx or .xls)");
    return;
  }

  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      setLoader(true);
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.warning("No data found in the Excel file");
        setLoader(false);
        return;
      }

      // Create a map of updates from Excel
      const updatesMap = new Map();
   jsonData.forEach(row => {
  if (row['Item ID']) {
    updatesMap.set(row['Item ID'], {
      itemId: row['Item ID'],
      product_name: row['Product Name'],
      hsn_code: row['HSN Code'] || row['hsn_code'],
      priceLevels: {
        dineIn: parseFloat(row['Dine In']) || parseFloat(row['Price Rate']) || 0,
        takeaway: parseFloat(row['Take Away']) || parseFloat(row['Price Rate']) || 0,
        roomService: parseFloat(row['Room Service']) || parseFloat(row['Price Rate']) || 0,
        delivery: parseFloat(row['Delivery']) || parseFloat(row['Price Rate']) || 0,
      }
    });
  }
});


      if (updatesMap.size === 0) {
        toast.error("No valid items found with Item IDs in the Excel file");
        setLoader(false);
        return;
      }

      // Show confirmation
      const confirmation = await Swal.fire({
        title: 'Confirm Import',
        html: `Found <strong>${updatesMap.size}</strong> items to update.<br/>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update them!',
        cancelButtonText: 'Cancel',
      });

      if (!confirmation.isConfirmed) {
        setLoader(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Update items one by one using your edit API
      let successCount = 0;
      let failCount = 0;
      const failedItems = [];
      const updateArray = Array.from(updatesMap.values());

      for (let i = 0; i < updateArray.length; i++) {
        const update = updateArray[i];
        try {
          // Find the current item to get its existing data
          const currentItem = items.find(item => item._id === update.itemId);
          
          if (!currentItem) {
            console.error(`Item ${update.itemId} not found in current items list`);
            failCount++;
            failedItems.push(`${update.product_name} (Item not found)`);
            continue;
          }

          // Prepare formData with existing data + updates from Excel
          const formData = {
            itemName: update.product_name || currentItem.product_name,
            foodCategory: currentItem.category?._id || currentItem.category,
            foodType: currentItem.sub_category?._id || currentItem.sub_category,
            unit: currentItem.unit,
            hsn: update.hsn_code || currentItem.hsn_code, // FIXED: Use 'hsn' instead of 'hsn_code'
            cgst: currentItem.cgst,
            sgst: currentItem.sgst,
            igst: currentItem.igst,
            imageUrl: currentItem.product_image ? { secure_url: currentItem.product_image } : undefined,
          };

          // Prepare tableData (price levels) with updates from Excel
          const tableData = currentItem.Priceleveles?.map(pl => {
            const priceLevel = pl.pricelevel?._id || pl.pricelevel;
            const priceLevelName = pl.pricelevel?.pricelevel?.toLowerCase().replace(/\s+/g, '_');
            
            // Use Excel price if available, otherwise keep existing price
            const newPrice = update.priceLevels[priceLevelName] !== undefined 
              ? update.priceLevels[priceLevelName] 
              : pl.pricerate;
            
            return {
              pricelevel: priceLevel,
              pricerate: newPrice,
              priceDisc: pl.priceDisc || 0,
              applicabledt: pl.applicabledt || "",
              serviceConfig: pl.serviceConfig || {
                dineIn: "",
                takeaway: "",
                roomService: "",
                delivery: ""
              }
            };
          }) || [];

          // Use the correct edit item endpoint
          await api.post(
            `/api/sUsers/editItem/${orgId}/${update.itemId}`,
            {
              formData,
              tableData,
            },
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );
          successCount++;

          // Update local state for immediate UI feedback
          setItems(prevItems =>
            prevItems.map(item =>
              item._id === update.itemId
                ? { 
                    ...item, 
                    product_name: update.product_name || item.product_name,
                    hsn_code: update.hsn_code || item.hsn_code,
                    Priceleveles: tableData 
                  }
                : item
            )
          );
        } catch (error) {
          console.error(`Failed to update item ${update.itemId}:`, error);
          failCount++;
          failedItems.push(`${update.product_name} (${error.response?.data?.message || 'Update failed'})`);
        }
      }

      setLoader(false);

      // Show results with details
      if (successCount > 0) {
        let resultHtml = `<strong>Success:</strong> ${successCount} items updated`;
        if (failCount > 0) {
          resultHtml += `<br/><strong>Failed:</strong> ${failCount} items`;
          if (failedItems.length > 0) {
            resultHtml += `<br/><br/><div style="text-align: left; max-height: 200px; overflow-y: auto;">`;
            resultHtml += `<strong>Failed items:</strong><br/>`;
            failedItems.forEach(item => {
              resultHtml += `• ${item}<br/>`;
            });
            resultHtml += `</div>`;
          }
        }
        
        await Swal.fire({
          title: 'Import Complete!',
          html: resultHtml,
          icon: successCount === updateArray.length ? 'success' : 'warning',
          timer: failCount > 0 ? undefined : 3000,
          timerProgressBar: failCount === 0,
          showConfirmButton: failCount > 0,
        });

        // Refresh the list to get updated data
        fetchRooms(1, searchTerm);
      } else {
        toast.error("Failed to update any items. Check if HSN codes exist in the system.");
      }

    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to process Excel file");
      setLoader(false);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  reader.onerror = () => {
    toast.error("Failed to read Excel file");
    setLoader(false);
  };

  reader.readAsArrayBuffer(file);
};
  const handleDelete = async (id) => {
    // Show confirmation dialog
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

    // If user confirms deletion
    if (confirmation.isConfirmed) {
      setLoader(true);
      try {
        const res = await api.delete(`/api/sUsers/deleteItem/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        // Display success message
        await Swal.fire({
          title: "Deleted!",
          text: res.data.message,
          icon: "success",
          timer: 2000, // Auto close after 2 seconds
          timerProgressBar: true,
          showConfirmButton: false,
        });

        // Refresh the rooms list
        setItems((prevRooms) =>
          prevRooms.filter((product) => product._id !== id)
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


  // Calculate the height of the list
  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 95;
      setListHeight(newHeight);
    };

    // Calculate the height on component mount and whenever the window is resized
    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);


  // Items loaded status for InfiniteLoader
  const isItemLoaded = (index) => index < items.length;

  // Load more items when reaching the end
  const loadMoreItems = () => {
    if (!isLoading && hasMore) {
      return fetchRooms(page + 1, searchTerm);
    }
    return Promise.resolve();
  };

  const Row = ({ index, style }) => {
    // Return a loading placeholder if the item is not loaded yet
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

    const el = items[index];
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
                <p className="text-gray-500">{el?.hsnCode}</p>
              </div>
              <div className="flex gap-2">
                <p className="text-gray-500">Tax :</p>
                <p className="text-gray-500">{`${el?.igst} %`}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div
              className={` 
                flex gap-3 px-4`}
            >
              <FaEdit
                className="text-blue-500"
                onClick={() =>
                  navigate("/sUsers/editItem", {
                    state: el,
                  })
                }
              />

              <MdDelete
                onClick={() => {
                  handleDelete(el._id);
                }}
                className="text-red-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
  
      <div className="flex-1 bg-slate-50  h-screen overflow-hidden  ">
        <div className="sticky top-0 z-20 ">
          <TitleDiv
            loading={loader}
            title="Your Items"
            dropdownContents={[
              {
                title: "Add Item",
                to: "/sUsers/itemRegistration",
              },
            ]}
          />

          <SearchBar onType={searchData} />
        </div>


 <div className="flex justify-end gap-3">
  {/* Excel Export Button */}
  <button
    onClick={handleExcelExport}
    disabled={loader || items.length === 0}
    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
    title="Export current items to Excel"
  >
    <FaFileExcel className="text-lg" />
    <span className="hidden sm:inline">Export</span>
  </button>

  {/* Excel Import Button */}
  <button
    onClick={() => fileInputRef.current?.click()}
    disabled={loader}
    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
    title="Import items from Excel"
  >
    <FaFileUpload className="text-lg" />
    <span className="hidden sm:inline">Import</span>
  </button>

  {/* Hidden file input */}
  <input
    ref={fileInputRef}
    type="file"
    accept=".xlsx,.xls"
    onChange={handleExcelImport}
    className="hidden"
  />
</div>

         
        {!loader && !isLoading && items?.length === 0 && (
          <div className="flex justify-center items-center mt-20 overflow-hidden font-bold text-gray-500">
            Oops!!.No Items Found
          </div>
        )}

        <div className="pb-4">
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={hasMore ? items?.length + 1 : items?.length}
            loadMoreItems={loadMoreItems}
            threshold={10}
          >
            {({ onItemsRendered, ref }) => (
              <List
                className="pb-4"
                height={listHeight}
                itemCount={hasMore ? items?.length + 1 : items?.length}
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

export default ItemList;
