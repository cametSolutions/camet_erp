/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback, useRef } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link } from "react-router-dom";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import CallIcon from "../../../components/common/CallIcon";
import { toast } from "react-toastify";
import api from "@/api/api";
import CustomBarLoader from "../../../components/common/CustomBarLoader";
import SearchBar from "../../../components/common/SearchBar";
import { IoMdArrowDown } from "react-icons/io";
import { formatAmount } from "../../../../../backend/helpers/helper";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  addBillToParty,
  addParty,
  addShipToParty,
} from "../../../../slices/voucherSlices/commonVoucherSlice";
import { addParty as addPartyInAccountingVouchers } from "../../../../slices/voucherSlices/commonAccountingVoucherSlice";

function PartyListComponent({ deleteHandler = () => {}, isVoucher = false }) {
  const [parties, setParties] = useState([]);
  const [filteredParties, setFilteredParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [listHeight, setListHeight] = useState(0);
  const debounceTimerRef = useRef(null);
  const PAGE_SIZE = 60;

  const { _id: cmp_id, type } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const getVoucherType = () => {
    if (location.pathname === "/sUsers/searchPartyReceipt") {
      return "receipt";
    } else if (location.pathname === "/sUsers/searchPartySales") {
      return "sale";
    } else {
      return "sale";
    }
  };

  const allowAlteration = (accountGroupName) => {
    console.log(accountGroupName);

    if (
      accountGroupName === "Sundry Debtors" ||
      accountGroupName === "Sundry Creditors"
    ) {
      return true;
    } else {
      return false;
    }
  };

  // Calculate list height based on window size
  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 107; // Adjusted for header and search bar
      setListHeight(newHeight);
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  // Fetch data function
  const fetchParties = useCallback(
    async (pageNum = 1, searchTerm = "") => {
      if (pageNum === 1) setLoading(true);

      try {
        setLoading(true);
        const res = await api.get(
          `/api/sUsers/PartyList/${cmp_id}?voucher=${getVoucherType()}`,
          {
            params: {
              page: pageNum,
              limit: PAGE_SIZE,
              search: searchTerm,
            },
            withCredentials: true,
          }
        );

        const newParties = res.data.partyList;

        if (pageNum === 1) {
          setParties(newParties);
          setFilteredParties(newParties);
        } else {
          setParties((prevParties) => [...prevParties, ...newParties]);
          setFilteredParties((prevParties) => [...prevParties, ...newParties]);
        }

        // Check if we've reached the end of the data
        setHasMore(newParties.length === PAGE_SIZE);
      } catch (error) {
        console.error("Error fetching parties:", error);
        toast.error("Failed to load customers. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [cmp_id]
  );

  // Initial data load
  useEffect(() => {
    fetchParties(1, search);
  }, [fetchParties, cmp_id]);

  // Handle search with improved debounce
  const handleSearch = useCallback(
    (searchTerm) => {
      setSearch(searchTerm);

      // Clear any existing timeout
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Reset pagination when searching
      setPage(1);

      // Set debounced search
      debounceTimerRef.current = setTimeout(() => {
        fetchParties(1, searchTerm);
      }, 400);
    },
    [fetchParties]
  );

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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

  /// select handler
  //// dispatch to correct redux state according to vouchers

  const selectHandler = (el) => {
    const voucherType = getVoucherType();

    const pathName = location?.pathname;
    if (location?.state?.from === "AddressForm") {
      const addressType = location?.state?.type;
      if (addressType === "billTo") {
        dispatch(addBillToParty(el));
      } else {
        dispatch(addShipToParty(el));
      }

      navigate(-1, { replace: true });
      return;
    }

    if (pathName === "/sUsers/partyStatement/partyList") {
      navigate("/sUsers/partyStatement", { state: el });
    } else if (pathName === "/sUsers/orderPending/partyList") {
      navigate(`/sUsers/pendingOrders/${el?._id}`);
    } else if (voucherType === "receipt") {
      dispatch(addPartyInAccountingVouchers(el));

      navigate(-1, { replace: true });
    } else {
      //// dispatch to the correct redux state
      dispatch(addParty(el));
      dispatch(addBillToParty(el));
      dispatch(addShipToParty(el));

      navigate(-1, { replace: true });
    }
  };

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
      // marginTop: "16px",
      height: "130px",
    };

    return (
      <div
        key={el._id}
        style={adjustedStyle}
        className="bg-white p-4 pb-6 drop-shadow-lg  flex flex-col rounded-sm cursor-pointer hover:bg-slate-100 pr-6"
      >
        <div className="flex justify-between ">
          <div className="overflow-hidden">
            <p className="font-bold text-sm truncate">{el?.partyName}</p>
            {el.accountGroup && (
              <div className="flex">
                <p className="font-medium mt-2 text-gray-500 text-sm truncate">
                  {el?.accountGroup}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-center items-center gap-3 shrink-0">
            <CallIcon phoneNumber={el?.mobileNumber} size={18} color="green" />
            <Link to={`/sUsers/editParty/${el._id}`}>
              <FaEdit
                className={` ${
                  type === "self" &&
                  !allowAlteration(el?.accountGroupName) &&
                  "pointer-events-none opacity-50"
                }  text-blue-500`}
              />
            </Link>
            {/* delete id only for self users */}
            {/* {type === "self" && allowAlteration(el?.accountGroup) && ( */}
            <MdDelete
              onClick={() => deleteHandler(el._id)}
              className={` ${
                type === "self" &&
                !allowAlteration(el?.accountGroupName) &&
                "pointer-events-none opacity-50"
              }  text-red-500`}
            />
            {/* // )} */}
          </div>
        </div>
        <div className="flex gap-2 text-sm mt-1 overflow-hidden">
          <p className="font-semibold shrink-0">Mobile:</p>
          <p className="font-semibold text-gray-500 truncate ">
            {el?.mobileNumber}
          </p>
        </div>
        {/* <hr className="mt-6" /> */}
      </div>
    );
  };

  /////// we are rendering the same page for vouchers and for showing just parties in the dashboard so we must maintain the ui changes

  const voucherRow = ({ index, style }) => {
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
      height: "100px",
    };

    return (
      <div
        key={el._id}
        style={adjustedStyle}
        onClick={() => selectHandler(el)}
        className="bg-white p-4 pb-6 drop-shadow-lg  flex flex-col rounded-sm cursor-pointer hover:bg-slate-100 pr-6"
      >
        <div className="flex justify-between ">
          <div className="overflow-hidden">
            <p className="font-bold text-sm truncate">{el?.partyName}</p>
            <p className="font-medium text-gray-500 text-sm">Customer</p>
          </div>
          {el?.totalOutstanding && el?.totalOutstanding > 0 && (
            <section>
              <p className="font-medium text-gray-500 text-md mr-3 flex items-center gap-2">
                <IoMdArrowDown color="green" />
                {formatAmount(el?.totalOutstanding)}
              </p>
            </section>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
        <div style={{ height: listHeight }}>
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={
              hasMore ? filteredParties.length + 1 : filteredParties.length
            }
            loadMoreItems={loadMoreItems}
            threshold={5}
          >
            {({ onItemsRendered, ref }) => (
              <List
                ref={ref}
                onItemsRendered={onItemsRendered}
                height={listHeight}
                itemCount={
                  hasMore ? filteredParties.length + 1 : filteredParties.length
                }
                itemSize={isVoucher ? 110 : 140}
                width="100%"
              >
                {/* {Row} */}
                {isVoucher ? voucherRow : Row}
              </List>
            )}
          </InfiniteLoader>
        </div>
      )}
    </div>
  );
}

export default PartyListComponent;
