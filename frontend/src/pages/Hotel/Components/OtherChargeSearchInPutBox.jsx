import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import { useSelector } from "react-redux";
import api from "@/api/api";

function OtherChargeSearchInputBox({
  onSelect = () => {},
  placeholder = "Search and select a charge...",
  selectedCharge = null,
  className = "",
  disabled = false,
}) {
  console.log(selectedCharge);
  const [charges, setCharges] = useState([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState(0);
 

  const debounceTimerRef = useRef(null);
  const dropdownRef = useRef(null);
  const PAGE_SIZE = 50;

  const { _id: cmp_id } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg,
  );

  const fetchCharges = useCallback(
    async (searchTerm = "") => {
      if (!cmp_id) return;

      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/api/sUsers/otherCharges/${cmp_id}`, {
          params: { limit: PAGE_SIZE, search: searchTerm },
          withCredentials: true,
        });

        setCharges(res.data.chargeList || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load charges.");
      } finally {
        setLoading(false);
      }
    },
    [cmp_id],
  );

  
  useEffect(() => {
    if(!selectedCharge) return
    console.log(selectedCharge);
    setSelectedValue(selectedCharge?.charge);
    setAmount(selectedCharge?.amount);

  }, [selectedCharge]);

  console.log(selectedValue);
  const handleInputChange = (term, name) => {
    if(name == "amount"){
      setAmount(term);
      onSelect({
        amount: term,
        charge: selectedValue
      })
      return
    } 
    console.log(term);
    setSearch(term);
    clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      fetchCharges(term);
    }, 300);
  };

  const handleSelect = (charge) => {
    setSelectedValue(charge);
    setIsOpen(false);
    setSearch("");
    onSelect({
      amount: amount,
      charge: charge
    });
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
    fetchCharges();
  }, [fetchCharges]);
  

  console.log(selectedCharge)
  console.log(selectedValue)
  console.log(amount)

  return (
    <div className={`f relative w-full ${className}`} ref={dropdownRef}>
      <div className="flex gap-2">
        <div className="relative">
          <input
            type="text"
            value={selectedValue ? selectedValue.name : search}
            onChange={(e) => handleInputChange(e.target.value)}
            onClick={() => {
              if (!disabled) setIsOpen(true);
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-1.5 pr-16 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {selectedValue && !disabled && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={16} className="text-gray-500" />
              </button>
            )}
            <ChevronDown size={16} className="text-gray-500" />
          </div>
        </div>
        <input
          type="number"
          name="amount"
          value={amount}
          onChange={(e) => handleInputChange(e.target.value, "amount")}
          placeholder="Other Charges Amount"
          className="w-full px-4 py-1.5 pr-16 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {amount > 0 && Number(selectedValue?.taxPercentage) > 0 && <p className="p-2 text-green-700">Rs.{(Number(amount) * Number(selectedValue?.taxPercentage) / 100) + Number(amount) || 0}</p>}
      </div>
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Loading charges...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : charges.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No charges found
            </div>
          ) : (
            charges.map((charge) => (
              <div
                key={charge._id}
                onClick={() => handleSelect(charge)}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b"
              >
                <p className="font-medium text-gray-900">{charge.name}({charge.taxPercentage}%)</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default OtherChargeSearchInputBox;
