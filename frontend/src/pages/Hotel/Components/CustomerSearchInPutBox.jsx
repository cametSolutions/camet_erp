import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import api from "@/api/api";


function CustomerSearchInputBox({ 
  onSelect = () => {}, 
  placeholder = "Search and select a party...",
  isAgent=false,
  selectedParty = null,
  className = "",
  disabled = false ,
  sendSearchToParent,
}) {
  const [parties, setParties] = useState([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(selectedParty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const debounceTimerRef = useRef(null);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  const PAGE_SIZE = 50;

  const { _id: cmp_id } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const location = useLocation();

  const getVoucherType = () => {
    const path = location.pathname;
    if (path.includes("Receipt")) return "receipt";
    if (path.includes("Payment")) return "payment";
    return "sale";
  };

  console.log("selectedParty", selectedParty);

  const fetchParties = useCallback(async (pageNum = 1, searchTerm = "") => {
    setLoading(true);
    setError(null);
    try {

      const res = await api.get(`/api/sUsers/PartyList/${cmp_id}`, {
        params: { page: pageNum, limit: PAGE_SIZE, search: searchTerm, voucher: getVoucherType(),isAgent:isAgent },
        withCredentials: true,
      });
      const newParties = res.data.partyList;
      setParties(prev => pageNum === 1 ? newParties : [...prev, ...newParties]);
      setHasMore(newParties.length === PAGE_SIZE);
    } catch (err) {
      console.error(err);
      setError("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }, [cmp_id, location.pathname ]);

  const handleSearch = useCallback((term) => {
    setSearch(term);
    setPage(1);
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchParties(1, term);
    }, 300);
    sendSearchToParent(term);
  }, [fetchParties]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchParties(nextPage, search);
    }
  }, [loading, hasMore, page, fetchParties, search]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50) loadMore();
  };

  const handleSelect = (party) => {
    setSelectedValue(party);
    setIsOpen(false);
    setSearch("");
    onSelect(party,search);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedValue(null);
    setSearch("");
    onSelect(null);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedValue(selectedParty);
  }, [selectedParty]);

  useEffect(() => {
    if (cmp_id) fetchParties(1);
  }, [cmp_id, fetchParties]);

  useEffect(() => () => clearTimeout(debounceTimerRef.current), []);

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={selectedValue ? selectedValue.partyName : search}
          onChange={(e) => handleSearch(e.target.value)}
          onClick={() => { if (!disabled) setIsOpen(true); }}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-20 border rounded-lg bg-white ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {selectedValue && !disabled && (
            <button onClick={handleClear} className="p-1 hover:bg-gray-100 rounded-full">
              <X size={16} className="text-gray-500" />
            </button>
          )}
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto" onScroll={handleScroll}>
          {loading && parties.length === 0 ? (
            <div className="p-4 text-center text-gray-500 animate-pulse">Loading parties...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : parties.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No parties found</div>
          ) : (
            parties.map(party => (
              <div key={party._id} onClick={() => handleSelect(party)} className="p-3 hover:bg-gray-50 cursor-pointer border-b">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{party.partyName}</p>
                    <p className="text-sm text-gray-500">{party.mobileNumber}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && parties.length > 0 && (
            <div className="p-3 text-center text-gray-500 animate-pulse">Loading more...</div>
          )}
          {!hasMore && parties.length > 0 && (
            <div className="p-3 text-center text-gray-400 text-sm">No more parties</div>
          )}
        </div>
      )}
    </div>
  );
}

export default CustomerSearchInputBox;