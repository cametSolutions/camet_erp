import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import api from "@/api/api";


function AvailableRooms({ 
  onSelect = () => {}, 
  placeholder = "Search and select a party...",
  selectedParty = null,
  className = "",
  disabled = false 
}) {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(selectedParty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const debounceTimerRef = useRef(null);
  const dropdownRef = useRef(null);
  const PAGE_SIZE = 50;

  const { _id: cmp_id } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const location = useLocation();

  const fetchRooms = useCallback(async (pageNum = 1, searchTerm = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/sUsers/getRooms/${cmp_id}`, {
        params: { page: pageNum, limit: PAGE_SIZE, search: searchTerm },
        withCredentials: true,
      });
      const newRooms = res.data?.roomData;
      setRooms(prev => pageNum === 1 ? newRooms : [...prev, ...newRooms]);
      setHasMore(newRooms.length === PAGE_SIZE);
    } catch (err) {
      console.error(err);
      setError("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }, [cmp_id, location.pathname]);

  const handleSearch = useCallback((term) => {
    setSearch(term);
    setPage(1);
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchRooms(1, term);
    }, 300);
  }, [fetchRooms]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRooms(nextPage, search);
    }
  }, [loading, hasMore, page, fetchRooms, search]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50) loadMore();
  };

  const handleSelect = (party) => {
    setSelectedValue(party);
    setIsOpen(false);
    setSearch("");
    onSelect(party);
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
    if (cmp_id) fetchRooms(1);
  }, [cmp_id, fetchRooms]);

  useEffect(() => () => clearTimeout(debounceTimerRef.current), []);

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={selectedValue ? selectedValue.roomName : search}
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
          {loading && rooms.length === 0 ? (
            <div className="p-4 text-center text-gray-500 animate-pulse">Loading rooms...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : rooms.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No rooms found</div>
          ) : (
            rooms.map(room => (
              <div key={room._id} onClick={() => handleSelect(room)} className="p-3 hover:bg-gray-50 cursor-pointer border-b">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{ room.roomName}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && rooms.length > 0 && (
            <div className="p-3 text-center text-gray-500 animate-pulse">Loading more...</div>
          )}
          {!hasMore && rooms.length > 0 && (
            <div className="p-3 text-center text-gray-400 text-sm">No more parties</div>
          )}
        </div>
      )}
    </div>
  );
}

export default AvailableRooms;

