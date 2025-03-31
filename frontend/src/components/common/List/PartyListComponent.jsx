/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link } from "react-router-dom";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import CallIcon from "../CallIcon";
import { toast } from "react-toastify";
import api from "@/api/api";
import CustomBarLoader from "../CustomBarLoader";
import SearchBar from "../SearchBar";

function PartyListComponent({ type, deleteHandler, user = "secondary", cpm_id }) {
  const [parties, setParties] = useState([]);
  const [filteredParties, setFilteredParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [listHeight, setListHeight] = useState(0);
  const PAGE_SIZE = 60;

  // Calculate list height based on window size
  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 108; // Adjusted for header and search bar
      setListHeight(newHeight);
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  // Fetch data function
  const fetchParties = useCallback(async (pageNum = 1, searchTerm = "") => {
    if (pageNum === 1) setLoading(true);
    
    try {
      const res = await api.get(`/api/sUsers/PartyList/${cpm_id}`, {
        params: {
          page: pageNum,
          limit: PAGE_SIZE,
          search: searchTerm
        },
        withCredentials: true,
      });

      const newParties = res.data.partyList;
      
      if (pageNum === 1) {
        setParties(newParties);
        setFilteredParties(newParties);
      } else {
        setParties(prevParties => [...prevParties, ...newParties]);
        setFilteredParties(prevParties => [...prevParties, ...newParties]);
      }

      // Check if we've reached the end of the data
      setHasMore(newParties.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching parties:", error);
      toast.error("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [cpm_id]);

  // Initial data load
  useEffect(() => {
    fetchParties(1, search);
  }, [fetchParties, cpm_id]);

  // Handle search
  const handleSearch = useCallback((searchTerm) => {
    setSearch(searchTerm);
    
    // Reset pagination when searching
    setPage(1);
    
    if (searchTerm === "") {
      // If search is cleared, reset to showing all parties
      fetchParties(1, "");
    } else {
      // Debounce search for better performance
      const timeoutId = setTimeout(() => {
        fetchParties(1, searchTerm);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [fetchParties]);

  // Load more data when scrolling
  const loadMoreItems = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchParties(nextPage, search);
    }
  }, [loading, hasMore, page, fetchParties, search]);

  // Is item loaded check for InfiniteLoader
  const isItemLoaded = (index) => index < filteredParties.length;

  // Row renderer
  const Row = ({ index, style }) => {
    // Show loading placeholder if item isn't loaded yet
    if (!isItemLoaded(index)) {
      return (
        <div style={style} className="bg-white p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      );
    }

    const el = filteredParties[index];
    const adjustedStyle = {
      ...style,
      marginTop: "16px",
      height: "130px",
    };
    
    return (
      <div
        key={el._id}
        style={adjustedStyle}
        className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex flex-col rounded-sm cursor-pointer hover:bg-slate-100 pr-7"
      >
        <div className="flex justify-between w-full gap-3">
          <div>
            <p className="font-bold text-sm">{el?.partyName}</p>
            {el.accountGroup && (
              <div className="flex">
                <p className="font-medium mt-2 text-gray-500 text-sm">
                  {el?.accountGroup}
                </p>
              </div>
            )}
            {el.totalOutstanding > 0 && (
              <div className="mt-1">
                <p className="text-xs font-semibold text-red-500">
                  Outstanding: ₹{el.totalOutstanding.toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-center items-center gap-4">
            <CallIcon phoneNumber={el?.mobileNumber} size={18} color="green" />
            <Link to={`/${user === "secondary" ? "sUsers" : "pUsers"}/editParty/${el._id}`}>
              <FaEdit className="text-blue-500" />
            </Link>
            {type === "self" && (
              <MdDelete
                onClick={() => deleteHandler(el._id)}
                className="text-red-500"
              />
            )}
          </div>
        </div>
        <div className="flex gap-2 text-nowrap text-sm mt-1">
          <p className="font-semibold">Mobile:</p>
          <p className="font-semibold text-gray-500">{el?.mobileNumber}</p>
        </div>
        <hr className="mt-6" />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-slate-50 pb-2">
        <SearchBar onType={handleSearch} />
      </div>
      
      {loading && parties.length === 0 ? (
        <CustomBarLoader color="#363ad6" />
      ) : filteredParties.length === 0 ? (
        <div className="font-bold flex justify-center items-center mt-12 text-gray-500">
          No Customers Found
        </div>
      ) : (
        <div style={{ height: listHeight, width: "100%" }}>
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={hasMore ? filteredParties.length + 1 : filteredParties.length}
            loadMoreItems={loadMoreItems}
            threshold={5}
          >
            {({ onItemsRendered, ref }) => (
              <List
                ref={ref}
                onItemsRendered={onItemsRendered}
                height={listHeight}
                itemCount={hasMore ? filteredParties.length + 1 : filteredParties.length}
                itemSize={140}
                width="100%"
              >
                {Row}
              </List>
            )}
          </InfiniteLoader>
        </div>
      )}
    </div>
  );
}

export default PartyListComponent;