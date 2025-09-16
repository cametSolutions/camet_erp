import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/api/api";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import HeaderTile from "@/pages/voucher/voucherCreation/HeaderTile";
import { formatVoucherType } from "/utils/formatVoucherType";
import CustomerSearchInputBox from "./CustomerSearchInPutBox";
import TimeSelector from "./TimeSelector";
import AvailableRooms from "./AvailableRooms";
import AdditionalPaxDetails from "./AdditionalPaxDetails";
import FoodPlanComponent from "./FoodPlanComponent";
import useFetch from "@/customHook/useFetch";
import OutStandingModal from "./OutStandingModal";
import PaymentModal from "./paymentModal";
import { set } from "mongoose";

function BookingForm({
  isLoading,
  setIsLoading,
  handleSubmit,
  editData,
  isSubmittingRef,
  isFor,
  outStanding = [],
  roomId,
  submitLoader, 
}) {
  const [voucherNumber, setVoucherNumber] = useState("");
  const [selectedParty, setSelectedParty] = useState("");
  const [displayFoodPlan, setDisplayFoodPlan] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [displayAdditionalPax, setDisplayAdditionalPax] = useState(false);
  const [roomType, setRoomType] = useState([]);
  const [errorObject, setErrorObject] = useState({});
  const [hotelAgent, setHotelAgent] = useState({});
  const [visitOfPurpose, setVisitOfPurpose] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();
  const [saveLoader, setSaveLoader] = useState(false);
  // used to get organization id from redux
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const { data, loading } = useFetch(
    `/api/sUsers/getProductSubDetails/${cmp_id}?type=roomType`
  );

  useEffect(() => {
    if (data) {
      setRoomType(data?.data);
    }
  }, [data]);

  const { data: visitOfPurposeData, loading: visitOfPurposeLoading } = useFetch(
    `/api/sUsers/getVisitOfPurpose/${cmp_id}`
  );

  useEffect(() => {
    if (visitOfPurposeData) {
      setVisitOfPurpose(visitOfPurposeData?.data);
    }
  }, [visitOfPurposeData]);

  const today = new Date();
  const arrivalDate = today.toISOString().split("T")[0];

  const checkOutDateObj = new Date(today);
  checkOutDateObj.setDate(today.getDate() + 1); // Add 1 day
  const checkOutDate = checkOutDateObj.toISOString().split("T")[0];

  useEffect(() => {
    if (submitLoader) {
      setShowPaymentModal(true);
      setSaveLoader(true);
    }
  }, [submitLoader]);

  const [formData, setFormData] = useState({
    bookingDate: arrivalDate,
    voucherNumber: voucherNumber,
    voucherId: "",
    arrivalDate: arrivalDate,
    arrivalTime: "",
    checkOutDate: checkOutDate,
    selectedRoomPrice: "",
    checkOutTime: "",
    stayDays: 1,
    bookingType: "offline",
    country: "",
    state: "",
    pinCode: "",
    detailedAddress: "",
    priceLevelRate: "",
    priceLevelId: "",
    discountPercentage: 0,
    discountAmount: 0,
    advanceAmount: 0,
    totalAmount: 0,
    balanceToPay: 0,
    totalAdvance: 0,
    foodPlan: [],
    grandTotal: 0,
    previousAdvance: 0,
  });

  useEffect(() => {
    if (editData) {
      console.log(editData?.advanceAmount);
      setSelectedParty(editData?.customerId);
      setHotelAgent(editData?.agentId);
      setVoucherNumber(editData?.voucherNumber);
      setFormData((prev) => ({
        ...prev,
        country: editData?.country,
        customerId: editData?.customerId?._id,
        state: editData?.state,
        pinCode: editData?.pinCode,
        detailedAddress: editData?.detailedAddress,
        mobileNumber: editData?.mobileNumber,
        arrivalDate: editData?.arrivalDate,
        arrivalTime: editData?.arrivalTime,
        checkOutDate: editData?.checkOutDate,
        checkOutTime: editData?.checkOutTime,
        stayDays: editData?.stayDays,
        bookingType: editData?.bookingType,
        selectedRooms: editData?.selectedRooms,
        additionalPaxDetails: editData?.additionalPaxDetails,
        foodPlan: editData?.foodPlan,
        paxTotal: editData?.paxTotal,
        foodPlanTotal: editData?.foodPlanTotal,
        discountPercentage: editData?.discountPercentage || 0,
        discountAmount: editData?.discountAmount || 0,
        totalAdvance: editData?.totalAdvance || 0,
        visitOfPurpose: editData?.visitOfPurpose,
        voucherId: editData?.voucherId,
        customerName: editData?.customerId?.partyName,
        accountGroup: editData?.customerId?.accountGroup,
        balanceToPay: editData?.balanceToPay,
        advanceAmount: editData?.advanceAmount,
        previousAdvance: editData?.previousAdvance || 0,
      }));
    }
  }, [editData]);

  useEffect(() => {
    if (roomId) {
      setSelectedRoomId(roomId);
    }
  }, [roomId]);

  console.log(selectedRoomId);

  // handle change function used to update form data
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "arrivalDate") {
      const checkout = new Date(value); // this is the arrivalDate

      if (formData.stayDays) {
        checkout.setDate(checkout.getDate() + Number(formData.stayDays));
      } else {
        checkout.setDate(checkout.getDate() + 1); // ✅ use `checkout`
      }
      const formattedCheckout = checkout.toISOString().split("T")[0];

      setFormData((prev) => ({
        ...prev,
        checkOutDate: formattedCheckout,
        arrivalDate: value,
      }));

      return;
    }

    if (name == "checkOutDate") {
      const arrivalDate = new Date(formData.arrivalDate);
      const checkOutDate = new Date(value);

      // Get difference in milliseconds
      const diffTime = checkOutDate - arrivalDate;

      // Convert milliseconds to days
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      let updatedSelectedItems = formData.selectedRooms?.map((room) => ({
        ...room,
        stayDays: diffDays,
        totalAmount: diffDays * room.priceLevelRate,
      }));

      setFormData((prev) => ({
        ...prev,
        checkOutDate: value,
        stayDays: diffDays,
        selectedRooms: updatedSelectedItems,
      }));
      return;
    }
    if (name === "stayDays") {
      const arrival = new Date(formData.arrivalDate);
      const stayDays = parseInt(value || 0);

      if (!isNaN(stayDays)) {
        const checkout = new Date(arrival);
        checkout.setDate(arrival.getDate() + stayDays);
        let updatedSelectedItems = formData.selectedRooms?.map((room) => ({
          ...room,
          stayDays: stayDays,
          totalAmount: stayDays * room.priceLevelRate,
        }));

        const formattedCheckout = checkout.toISOString().split("T")[0];
        setFormData((prev) => ({
          ...prev,
          stayDays: value,
          checkOutDate: formattedCheckout,
          selectedRooms: updatedSelectedItems,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          stayDays: value,
        }));
      }
      return;
    }

    // General case
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  console.log(isFor);

  // function used to get voucher number with the help of useCallback
  const fetchData = useCallback(async () => {
    try {
      const response = await api.get(
        `/api/sUsers/getSeriesByVoucher/${cmp_id}?voucherType=${isFor}`,
        { withCredentials: true }
      );
      console.log(response.data);
      if (response.data) {
        const specificSeries = response.data.series?.find(
          (item) => item.under === "hotel"
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
          setFormData((prev) => ({
            ...prev,
            voucherNumber: specificNumber,
            voucherId: specificSeries._id,
            voucherType: "",
          }));
          setVoucherNumber(specificNumber);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching data");
    } finally {
      setIsLoading(false);
    }
  }, [cmp_id]);

  // useEffect used to get voucher number
  useEffect(() => {
    if (!editData || isFor == "deliveryNote" || isFor == "sales") {
      fetchData();
    }
  }, [fetchData]);

  // Replace your existing useEffect with this improved version
  useEffect(() => {
    const handler = setTimeout(() => {
      const subtotal =
        formData?.selectedRooms?.reduce(
          (acc, item) => acc + Number(item.amountAfterTax),
          0
        ) || 0;

      if (subtotal > 0 && formData.discountAmount !== "") {
        const newPercentage =
          (Number(formData.discountAmount) / subtotal) * 100;
        setFormData((prev) => ({
          ...prev,
          discountPercentage: newPercentage.toFixed(2),
          grandTotal: (subtotal - Number(formData.discountAmount)).toFixed(2),
          totalAmount: subtotal.toFixed(2),
          balanceToPay:
            (subtotal - Number(formData.discountAmount)).toFixed(2) -
            Number(formData.totalAdvance || 0),
        }));
      }
    }, 1000);

    return () => clearTimeout(handler); // cleanup on re-run or unmount
  }, [
    formData.roomTotal,
    formData.foodPlanTotal,
    formData.paxTotal,
    formData.discountAmount,
  ]);

  const handleDiscountPercentageChange = (e) => {
    const { value } = e.target;
    const percentage = Number(value) || 0;
    const subtotal =
      Number(formData?.roomTotal || 0) +
      Number(formData?.foodPlanTotal || 0) +
      Number(formData?.paxTotal || 0);

    const calculatedAmount = (subtotal * percentage) / 100;

    setFormData((prev) => ({
      ...prev,
      discountPercentage: value,
      discountAmount: calculatedAmount.toFixed(2),
    }));
  };

  const handleDiscountAmountChange = (e) => {
    const { value } = e.target;
    const amount = Number(value) || 0;

    const subtotal =
      Number(formData?.roomTotal || 0) +
      Number(formData?.foodPlanTotal || 0) +
      Number(formData?.paxTotal || 0);

    if (amount >= 0 && amount <= subtotal) {
      const calculatedPercentage = subtotal > 0 ? (amount / subtotal) * 100 : 0;

      setFormData((prev) => ({
        ...prev,
        discountAmount: value,
        discountPercentage: calculatedPercentage.toFixed(2),
      }));
    }
  };

  const handleAdvanceAmountChange = (e) => {
    const { value } = e.target;
    const advanceAmount = Number(value);
    const previousAdvance = Number(editData?.previousAdvance || 0);
    const grandTotal = Number(formData?.grandTotal || 0);
    const totalAdvance = advanceAmount + previousAdvance;
    const maxAllowed = grandTotal - previousAdvance;

    // Validation: Advance should not exceed allowed maximum
    if (advanceAmount > maxAllowed) {
      setErrorObject((prev) => ({
        ...prev,
        advanceAmount:
          "Advance amount should be less than or equal to grand total",
      }));
      return;
    }

    // Clear error
    setErrorObject((prev) => ({
      ...prev,
      advanceAmount: "",
    }));

    // Handle different conditions based on `isFor`
    if (isFor === "deliveryNote" || isFor === "sales") {
      setFormData((prev) => ({
        ...prev,
        advanceAmount: value,
        balanceToPay: (grandTotal - previousAdvance - advanceAmount).toFixed(2),
        totalAdvance: totalAdvance,
      }));
    } else {
      // For other cases (like walk-in or generic)
      setFormData((prev) => ({
        ...prev,
        advanceAmount: value,
        balanceToPay: (grandTotal - advanceAmount).toFixed(2),
        totalAdvance: advanceAmount,
      }));
    }
  };

  // function used to handle customer selection
  const handleSelection = (selectedParty) => {
    setSelectedParty(selectedParty);
    if (!selectedParty) {
      setFormData((prev) => ({
        ...prev,
        customerId: "",
        country: "",
        state: "",
        pinCode: "",
        detailedAddress: "",
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      customerName: selectedParty.partyName,
      customerId: selectedParty._id,
      country: selectedParty.country,
      accountGroup: selectedParty?.accountGroup,
      state: selectedParty.state,
      pinCode: selectedParty.pin,
      detailedAddress: selectedParty.billingAddress,
      mobileNumber: selectedParty.mobileNumber,
    }));
  };
  // function used to handle room selection
  const handleAvailableRoomSelection = (selectedRoom) => {
    setFormData((prev) => ({
      ...prev,
      selectedRoomId: selectedRoom?._id,
      priceLevelId: selectedRoom?.priceLevel[0]?.pricelevel?._id,
      priceLevelRate: selectedRoom?.priceLevel[0]?.priceRate,
    }));
  };

  // handle change function used to update arrival and checkout time
  const handleArrivalTimeChange = (time) => {
    setFormData((prev) => ({ ...prev, arrivalTime: time }));
  };

  // handle change function used to update check in and checkout time
  const handleCheckOutTimeChange = (time) => {
    setFormData((prev) => ({ ...prev, checkOutTime: time }));
  };

  // handle additionalPax data form child
  const handleAdditionalPaxDetails = (details) => {
    const existingDetails = Array.isArray(formData?.additionalPaxDetails)
      ? formData.additionalPaxDetails
      : [];

    const filterData = existingDetails.filter(
      (item) => item.roomId !== details[0]?.roomId
    );

    const totalAmount = [...filterData, ...details].reduce(
      (acc, item) => acc + Number(item.rate),
      0
    );

    setFormData((prev) => ({
      ...prev,
      additionalPaxDetails: [...filterData, ...details],
      paxTotal: totalAmount,
    }));
  };

  // handle food plan data from the child
  const handleFoodPlanData = (details) => {
    const existingDetails = Array.isArray(formData?.foodPlan)
      ? formData.foodPlan
      : [];

    const filterData = existingDetails.filter(
      (item) => item.roomId !== details[0]?.roomId
    );
    const totalAmount = [...filterData, ...details].reduce(
      (acc, item) => acc + Number(item.rate),
      0
    );

    setFormData((prev) => ({
      ...prev,
      foodPlan: [...filterData, ...details],
      foodPlanTotal: totalAmount,
    }));
  };

  // function used to store additional pax details
  const selectedRoomData = (id, to) => {
    if (to == "addPax") {
      setDisplayAdditionalPax(true);
      setSelectedRoomId(id);
    }
    if (to == "addFoodPlan") {
      setDisplayFoodPlan(true);
      setSelectedRoomId(id);
    }
  };

  const handleAgentSelect = (selectedAgent) => {
    setHotelAgent(selectedAgent);
    if (!selectedAgent) {
      setFormData((prev) => ({
        ...prev,
        agentId: "",
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      agentId: selectedAgent?._id,
    }));
  };

  // function used to store available room details
  const handleAvailableRooms = (rooms, total) => {
    if (rooms.length > 0) {
      setFormData((prev) => ({
        ...prev,
        selectedRooms: rooms,
        roomTotal: total,
        totalAmount:
          total +
          (Number(formData.foodPlanTotal || 0) +
            Number(formData.paxTotal || 0)),
      }));
    }
  };

  // handle submit function
  const submitHandler = () => {
    console.log(Number(formData?.advanceAmount));
    if (Number(formData?.advanceAmount) <= 0) {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      const payload = {
        ...formData,
        voucherNumber,
      };
      delete payload.roomType;
      handleSubmit(payload);
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePayment = (paymentData) => {
    console.log(paymentData);
    setSaveLoader(true);
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    const payload = {
      ...formData,
      voucherNumber,
    };
    delete payload.roomType;
    handleSubmit(payload, paymentData);
  };
  const handleClose = () => {
    setShowPaymentModal(false);
  };

  return (
    <>
      {isLoading || visitOfPurposeLoading || loading ? (
        <CustomBarLoader />
      ) : (
        <>
          {showPaymentModal && (
            <PaymentModal
              selected={voucherNumber}
              totalAmount={Number(formData?.advanceAmount)}
              saveLoader={saveLoader}
              onClose={handleClose}
              onPaymentSave={handlePayment}
              cmp_id={cmp_id}
            
            />
          )}
          <>
            <HeaderTile
              title={formatVoucherType("Booking")}
              number={voucherNumber}
              selectedDate={formData.bookingDate}
              setSelectedDate={(date) =>
                setFormData((prev) => ({ ...prev, bookingDate: date }))
              }
              tab="booking"
            />
            <div className="flex-auto px-4 lg:px-10 py-10 pt-4">
              <div className="flex flex-wrap">
                {/* Booking Number */}
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Guest Name
                    </label>
                    <CustomerSearchInputBox
                      onSelect={handleSelection}
                      selectedParty={selectedParty}
                      isAgent={false}
                      placeholder="Search customers..."
                    />
                  </div>
                </div>

                {/* Bed Type */}
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Country
                    </label>
                    <input
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      PinCode
                    </label>
                    <input
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Detailed Address
                    </label>
                    <input
                      type="text"
                      name="detailedAddress"
                      value={formData.detailedAddress}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="number"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>

                {/* Room Floor */}
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Arrival Date
                    </label>
                    <input
                      type="date"
                      name="arrivalDate"
                      value={formData.arrivalDate}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Arrival Time
                    </label>
                    <TimeSelector
                      initialTime={editData?.arrivalTime}
                      onTimeChange={handleArrivalTimeChange}
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Check Out Date
                    </label>
                    <input
                      type="date"
                      name="checkOutDate"
                      value={formData.checkOutDate}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Check Out Time
                    </label>
                    <TimeSelector
                      initialTime={editData?.checkOutTime}
                      onTimeChange={handleCheckOutTimeChange}
                    />
                  </div>
                </div>

                {/* Booking Type */}
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Booking Type
                    </label>
                    <select
                      name="bookingType"
                      value={formData.bookingType}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    >
                      <option value="offline">Offline Booking</option>
                      <option value="online">Online Booking</option>
                    </select>
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Hotel Agent
                    </label>
                    <CustomerSearchInputBox
                      key={"hotelAgent"}
                      onSelect={handleAgentSelect}
                      isAgent={true}
                      selectedParty={hotelAgent}
                      placeholder="Search customers..."
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Stay Days
                    </label>
                    <input
                      type="text"
                      name="stayDays"
                      value={formData.stayDays}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Visit of purpose
                    </label>
                    <select
                      name="visitOfPurpose"
                      value={formData.visitOfPurpose}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    >
                      <option value="All">Select Room Type</option>
                      {visitOfPurpose.map((data) => (
                        <option key={data?._id} value={data?._id}>
                          {data?.visitOfPurpose}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Room Type
                    </label>
                    <select
                      name="roomType"
                      value={formData.roomType}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    >
                      <option value="All">Select Room Type</option>
                      {roomType.map((roomType) => (
                        <option key={roomType?._id} value={roomType?._id}>
                          {roomType?.brand}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Available Rooms */}
                <div className="w-full  px-4">
                  <div className="relative  mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Available Rooms
                    </label>
                    <AvailableRooms
                      onSelect={handleAvailableRoomSelection}
                      selectedParty={selectedParty}
                      placeholder="Search customers..."
                      selectedRoomData={selectedRoomData}
                      setDisplayFoodPlan={setDisplayFoodPlan}
                      sendToParent={handleAvailableRooms}
                      formData={formData}
                      selectedRoomId={selectedRoomId}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap pt-4">
                {/* Booking Number */}
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Total Amount
                    </label>
                    <input
                      type="number"
                      name="totalAmount"
                      value={formData.totalAmount}
                      readOnly
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Discount Percentage
                    </label>
                    <input
                      type="number"
                      name="discountPercentage"
                      value={formData?.discountPercentage}
                      onChange={handleDiscountPercentageChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Discount Amount
                    </label>
                    <input
                      type="number"
                      name="discountAmount"
                      value={
                        formData?.discountAmount === "0"
                          ? ""
                          : formData?.discountAmount
                      }
                      onChange={handleDiscountAmountChange}
                      min="0"
                      step="0.01"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      {isFor == "sales" ? "Amount" : "Advance Amount"}
                    </label>
                    <input
                      type="number"
                      name="advanceAmount"
                      value={formData?.advanceAmount}
                      onChange={handleAdvanceAmountChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                    {errorObject?.advanceAmount &&
                      errorObject?.advanceAmount !== "" && (
                        <span className="text-red-500">
                          {errorObject?.advanceAmount}
                        </span>
                      )}
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Previous Advance
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={formData?.previousAdvance}
                      className="text-red-500 border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Total given advance
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={Number(formData?.totalAdvance)}
                      className="text-red-500 border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Balance To Be Paid
                    </label>
                    <input
                      type="number"
                      name="balanceToPay"
                      value={formData.balanceToPay}
                      className="text-red-500 border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>

                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className=" block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Grand Total
                    </label>
                    <input
                      type="number"
                      name="grandTotal"
                      value={formData.grandTotal}
                      className=" text-green-500 border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                {outStanding.length > 0 && (
                  <button
                    className="bg-pink-500 mt-4 ml-4 w-20 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
                    type="button"
                    onClick={() => setModalOpen(true)}
                  >
                    History
                  </button>
                )}
                <button
                  className="bg-pink-500 mt-4 ml-4 w-20 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
                  type="button"
                  onClick={submitHandler}
                >
                  {editData ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </>

          <>
            {displayAdditionalPax && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
                <div className="bg-white p-6 rounded-xl shadow-xl flex">
                  <AdditionalPaxDetails
                    cmp_id={cmp_id}
                    sendDataToParent={handleAdditionalPaxDetails}
                    setDisplayAdditionalPax={setDisplayAdditionalPax}
                    selectedRoomId={selectedRoomId}
                    formData={formData}
                  />
                </div>
              </div>
            )}
            {displayFoodPlan && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
                <div className="bg-white p-6 rounded-xl shadow-xl flex">
                  <FoodPlanComponent
                    cmp_id={cmp_id}
                    sendDataToParent={handleFoodPlanData}
                    setDisplayFoodPlan={setDisplayFoodPlan}
                    selectedRoomId={selectedRoomId}
                    formData={formData}
                  />
                </div>
              </div>
            )}
          </>
        </>
      )}

      <OutStandingModal
        showModal={modalOpen}
        onClose={() => setModalOpen(false)}
        outStanding={outStanding}
      />
    </>
  );
}

export default BookingForm;
