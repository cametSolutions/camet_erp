/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useState, useCallback, useRef } from "react";
import api from "../../../api/api";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";

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
  const searchTimeoutRef = useRef(null);
  const limit = 60; // Number of rooms per page

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
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
