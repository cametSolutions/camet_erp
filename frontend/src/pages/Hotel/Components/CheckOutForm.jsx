import {useState,useCallback,useEffect} from "react";
import { useSelector }  from "react-redux";
import { toast } from "sonner";
import {useNavigate} from "react-router-dom";
import api from "@/api/api";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import HeaderTile from "@/pages/voucher/voucherCreation/HeaderTile";
import { formatVoucherType } from "/utils/formatVoucherType";

function CheckOutForm({isLoading,setIsLoading}) {
  const[voucherNumber,setVoucherNumber] = useState("");
  const[selectedParty,setSelectedParty] = useState("");
  const[errors,setErrors] = useState({});
  
  const[touched,setTouched] = useState({});
const navigate=useNavigate();
  const cmp_id = useSelector((state) => state.secSelectedOrganization.secSelectedOrg._id);
  const[formData,setFormData] = useState({ 
    Date: new Date().toISOString().split("T")[0],
    CheckoutNo:'',
    GuestName:'',
    GuestAddressdetails:'',
    PriceListName:"",
    ArrivalDate:"",
    ArrivalTime:"",
    StayDays:"",
    CheckoutDate:'',
    CheckOutTime:'',
    BookingType:'', 
    SlNo:'',
    RoomNo:'',
    Days:'',
    NoofPax:'',
    ExtraPaxType:'',
    ExtraPaxRate:"",
    ExtraPaxAmount:'',
    TotalNoofExtraPax:'',
    Plan:'',
    PlanAmount:'',
    TarifRate:'',
    ExtraPaxAmount2:'', // Second Extra Pax Amount field
    RoomRent:'',
    DiscountPercentage:'',
    DiscountAmount:'',
    Amount:'',
    FoodPlanAmount:'',
    CGST:'',
    SGST:'',
    RoundOff:'',
    TotalBillAmount:'',
    SourceType:'',
    CheckoutAmountandDetails:'',
    GuestHistory:'',
    BalanceSettlementAmount:'',
    EnteredBy:'',
  });

  // Validation rules
  const validateField = (name, value) => {
    switch(name) {
      case 'Date':
        if (!value) return 'Date is required';
        if (new Date(value) < new Date().setHours(0,0,0,0)) return 'Date cannot be in the past';
        break;
      
      case 'CheckoutNo':
        if (!value) return 'Checkout number is required';
        if (value.length < 3) return 'Checkout number must be at least 3 characters';
        break;
      
      case 'GuestName':
        if (!value) return 'Guest name is required';
        if (value.length < 2) return 'Guest name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Guest name can only contain letters and spaces';
        break;
      
      case 'GuestAddressdetails':
        if (!value) return 'Guest address is required';
        if (value.length < 10) return 'Address must be at least 10 characters';
        break;
      
      case 'PriceListName':
        if (!value) return 'Price list name is required';
        break;
      
      case 'ArrivalDate':
        if (!value) return 'Arrival date is required';
        if (new Date(value) < new Date().setHours(0,0,0,0)) return 'Arrival date cannot be in the past';
        break;
      
      case 'ArrivalTime':
        if (!value) return 'Arrival time is required';
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) return 'Invalid time format (HH:MM)';
        break;
      
      case 'StayDays':
        if (!value) return 'Stay days is required';
        if (isNaN(value) || parseInt(value) < 1) return 'Stay days must be a positive number';
        if (parseInt(value) > 365) return 'Stay days cannot exceed 365';
        break;
      
      case 'CheckoutDate':
        if (!value) return 'Checkout date is required';
        if (formData.ArrivalDate && new Date(value) <= new Date(formData.ArrivalDate)) {
          return 'Checkout date must be after arrival date';
        }
        break;
      
      case 'CheckOutTime':
        if (!value) return 'Checkout time is required';
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) return 'Invalid time format (HH:MM)';
        break;
      
      case 'BookingType':
        if (!value) return 'Booking type is required';
        break;
      
      case 'RoomNo':
        if (!value) return 'Room number is required';
        if (!/^[A-Za-z0-9\-]+$/.test(value)) return 'Invalid room number format';
        break;
      
      case 'Days':
        if (!value) return 'Days is required';
        if (isNaN(value) || parseInt(value) < 1) return 'Days must be a positive number';
        break;
      
      case 'NoofPax':
        if (!value) return 'Number of pax is required';
        if (isNaN(value) || parseInt(value) < 1) return 'Number of pax must be at least 1';
        if (parseInt(value) > 20) return 'Number of pax cannot exceed 20';
        break;
      
      case 'ExtraPaxRate':
        if (value && (isNaN(value) || parseFloat(value) < 0)) return 'Extra pax rate must be a positive number';
        break;
      
      case 'ExtraPaxAmount':
      case 'ExtraPaxAmount2':
        if (value && (isNaN(value) || parseFloat(value) < 0)) return 'Extra pax amount must be a positive number';
        break;
      
      case 'TotalNoofExtraPax':
        if (value && (isNaN(value) || parseInt(value) < 0)) return 'Total extra pax must be a positive number';
        break;
      
      case 'PlanAmount':
        if (value && (isNaN(value) || parseFloat(value) < 0)) return 'Plan amount must be a positive number';
        break;
      
      case 'TarifRate':
        if (!value) return 'Tarif rate is required';
        if (isNaN(value) || parseFloat(value) <= 0) return 'Tarif rate must be a positive number';
        break;
      
      case 'RoomRent':
        if (!value) return 'Room rent is required';
        if (isNaN(value) || parseFloat(value) <= 0) return 'Room rent must be a positive number';
        break;
      
      case 'DiscountPercentage':
        if (value && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100)) {
          return 'Discount % must be between 0 and 100';
        }
        break;
      
      case 'DiscountAmount':
        if (value && (isNaN(value) || parseFloat(value) < 0)) return 'Discount amount must be a positive number';
        break;
      
      case 'Amount':
        if (!value) return 'Amount is required';
        if (isNaN(value) || parseFloat(value) <= 0) return 'Amount must be a positive number';
        break;
      
      case 'FoodPlanAmount':
        if (value && (isNaN(value) || parseFloat(value) < 0)) return 'Food plan amount must be a positive number';
        break;
      
      case 'CGST':
        if (value && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 50)) {
          return 'CGST must be between 0 and 50';
        }
        break;
      
      case 'SGST':
        if (value && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 50)) {
          return 'SGST must be between 0 and 50';
        }
        break;
      
      case 'RoundOff':
        if (value && (isNaN(value) || Math.abs(parseFloat(value)) > 1)) {
          return 'Round off must be between -1 and 1';
        }
        break;
      
      case 'TotalBillAmount':
        if (!value) return 'Total bill amount is required';
        if (isNaN(value) || parseFloat(value) <= 0) return 'Total bill amount must be a positive number';
        break;

      case 'BalanceSettlementAmount':
        if (value && (isNaN(value) || parseFloat(value) < 0)) return 'Balance settlement amount must be a positive number';
        break;
      
      case 'EnteredBy':
        if (!value) return 'Entered by is required';
        if (value.length < 2) return 'Entered by must be at least 2 characters';
        break;
      
      default:
        break;
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Real-time validation
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'Date', 'CheckoutNo', 'GuestName', 'GuestAddressdetails', 'PriceListName',
      'ArrivalDate', 'ArrivalTime', 'StayDays', 'CheckoutDate', 'CheckOutTime',
      'BookingType', 'RoomNo', 'Days', 'NoofPax', 'TarifRate', 'RoomRent',
      'Amount', 'TotalBillAmount', 'EnteredBy'
    ];

    // Check all fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    // Check required fields
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return Object.keys(newErrors).length === 0;
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get(
        `/api/sUsers/getSeriesByVoucher/${cmp_id}?voucherType=saleOrder`,
        { withCredentials: true }
      );
      if (response.data) {
        const specificSeries = response.data.series?.find(
          (item) => item.seriesName === "Booking"
        );
        if (specificSeries) {
          const {
            prefix = "",
            currentNumber = 0,
            suffix = "",
            width = 3,
          } = specificSeries;

          const paddedNumber = String(currentNumber).padStart(width, "0");
          const specificNumber = `${prefix}${paddedNumber}${suffix}`;

          console.log(specificNumber);
          setVoucherNumber(specificNumber);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error fetching data");
    } finally {
      setIsLoading(false);
    }
  }, [cmp_id,setIsLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelection = (selectedParty) => {
    setSelectedParty(selectedParty);
    console.log(selectedParty);
    setFormData((prev) => ({ ...prev,
      country: selectedParty.country,
      state: selectedParty.state,
      pinCode: selectedParty.pin,
      detailedAddress: selectedParty.billingAddress
    }));
  };

  const submitHandler = () => {
    if (!validateForm()) {
      toast.error('Please fix all validation errors before submitting');
      return;
    }
    
    // Submit logic here
    console.log("Form submitted:", formData);
    toast.success('Form submitted successfully!');
  };

  const renderField = (name, label, type = "text", required = false) => {
    const hasError = errors[name] && touched[name];
    
    return (
      <div className="w-full lg:w-6/12 px-4">
        <div className="relative w-full mb-3">
          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
              hasError ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-200'
            }`}
          />
          {hasError && (
            <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
          )}
        </div>
      </div>
    );
  };

  const renderSelectField = (name, label, options, required = false) => {
    const hasError = errors[name] && touched[name];
    
    return (
      <div className="w-full lg:w-6/12 px-4">
        <div className="relative w-full mb-3">
          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <select
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
              hasError ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-200'
            }`}
          >
            <option value="">Select {label}</option>
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {hasError && (
            <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
          )}
        </div>
      </div>
    );
  };

  const renderTextArea = (name, label, required = false) => {
    const hasError = errors[name] && touched[name];
    
    return (
      <div className="w-full lg:w-6/12 px-4">
        <div className="relative w-full mb-3">
          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={3}
            className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
              hasError ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-200'
            }`}
          />
          {hasError && (
            <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
          )}
        </div>
      </div>
    );
  };

  // Options for dropdown fields
  const bookingTypeOptions = [
    { value: 'Online Booking', label: 'Online Booking' },
    { value: 'Office Line Booking', label: 'Office Line Booking' }
  ];

  return (
    <>
      {isLoading ? (
        <CustomBarLoader />
      ) : (
        <>
          <div className="flex items-center justify-end gap-2 text-sm text-gray-600 mt-4 mr-4  ml-4">
                      <div className="flex items-center gap-1">
                      <button
                        className="px-2 py-2 gap-3 rounded-lg bg-[#012a4a] text-white"
                        onClick={() => navigate('/CheckOutList')}
                      >
                        View List
                      </button>
        
                      </div>
                    </div>
          <div className="flex-auto px-4 lg:px-10 py-10 pt-4">
            <div className="flex flex-wrap">
              {/* 1. Date */}
              {renderField('Date', 'Date', 'date', true)}
              
              {/* 2. Checkout No (Voucher No) */}
              {renderField('CheckoutNo', 'Checkout No (Voucher No)', 'text', true)}
              
              {/* 3. Guest Name (Customer Ledger) */}
              {renderField('GuestName', 'Guest Name (Customer Ledger)', 'text', true)}
              
              {/* 4. Guest Address Details */}
              {renderTextArea('GuestAddressdetails', 'Guest Address Details', true)}
              
              {/* 5. Price List Name */}
              {renderField('PriceListName', 'Price List Name', 'text', true)}
              
              {/* 6. Arrival Date */}
              {renderField('ArrivalDate', 'Arrival Date', 'date', true)}
              
              {/* 7. Arrival Time */}
              {renderField('ArrivalTime', 'Arrival Time', 'time', true)}
              
              {/* 8. Stay Days */}
              {renderField('StayDays', 'Stay Days', 'number', true)}
              
              {/* 9. Check out Date */}
              {renderField('CheckoutDate', 'Check out Date', 'date', true)}
              
              {/* 10. Check Out Time */}
              {renderField('CheckOutTime', 'Check Out Time', 'time', true)}
              
              {/* 11. Booking Type */}
              {renderSelectField('BookingType', 'Booking Type', bookingTypeOptions, true)}
              
              {/* 12. Sl.No */}
              {renderField('SlNo', 'Sl.No', 'text')}
              
              {/* 13. Room No */}
              {renderField('RoomNo', 'Room No', 'text', true)}
              
              {/* 14. Days */}
              {renderField('Days', 'Days', 'number', true)}
              
              {/* 15. No.of Pax */}
              {renderField('NoofPax', 'No.of Pax', 'number', true)}
              
              {/* 16. Extra Pax Type */}
              {renderField('ExtraPaxType', 'Extra Pax Type', 'text')}
              
              {/* 17. Extra Pax Rate */}
              {renderField('ExtraPaxRate', 'Extra Pax Rate', 'number')}
              
              {/* 18. Extra Pax Amount */}
              {renderField('ExtraPaxAmount', 'Extra Pax Amount', 'number')}
              
              {/* 19. Total No.of Extra Pax */}
              {renderField('TotalNoofExtraPax', 'Total No.of Extra Pax', 'number')}
              
              {/* 20. Plan */}
              {renderField('Plan', 'Plan', 'text')}
              
              {/* 21. Plan Amount */}
              {renderField('PlanAmount', 'Plan Amount', 'number')}
              
              {/* 22. Tarif Rate */}
              {renderField('TarifRate', 'Tarif Rate', 'number', true)}
              
              {/* 23. Extra Pax Amount (Second one) */}
              {renderField('ExtraPaxAmount2', 'Extra Pax Amount', 'number')}
              
              {/* 24. Room Rent */}
              {renderField('RoomRent', 'Room Rent', 'number', true)}
              
              {/* 25. Disc % */}
              {renderField('DiscountPercentage', 'Disc %', 'number')}
              
              {/* 26. Discount Amount */}
              {renderField('DiscountAmount', 'Discount Amount', 'number')}
              
              {/* 27. Amount */}
              {renderField('Amount', 'Amount', 'number', true)}
              
              {/* 28. Food Plan Amount */}
              {renderField('FoodPlanAmount', 'Food Plan Amount', 'number')}
              
              {/* 29. CGST */}
              {renderField('CGST', 'CGST', 'number')}
              
              {/* 30. SGST */}
              {renderField('SGST', 'SGST', 'number')}
              
              {/* 31. Round Off */}
              {renderField('RoundOff', 'Round Off', 'number')}
              
              {/* 32. Total Bill Amount */}
              {renderField('TotalBillAmount', 'Total Bill Amount', 'number', true)}
              
              {/* 33. Source Type */}
              {renderField('SourceType', 'Source Type', 'text')}
              
              {/* 34. Checkout Amount and Details */}
              {renderTextArea('CheckoutAmountandDetails', 'Checkout Amount and Details')}
              
              {/* 35. Guest History */}
              {renderTextArea('GuestHistory', 'Guest History')}
              
              {/* 36. Balance Settlement Amount */}
              {renderField('BalanceSettlementAmount', 'Balance Settlement Amount', 'number')}
              
              {/* 37. Entered By */}
              {renderField('EnteredBy', 'Entered By', 'text', true)}

              {/* Save Button */}
              <div className="w-full flex justify-end">
                <button
                  className="bg-pink-500 mt-4 ml-4 w-20 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
                  type="button"
                  onClick={submitHandler}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default CheckOutForm;