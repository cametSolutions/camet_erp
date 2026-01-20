import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import PaymentModal from "./PaymentModal";

function BookingForm({
  isLoading,
  setIsLoading,
  handleSubmit,
  editData,
  isSubmittingRef,
  isFor,
  outStanding = [],
  roomId,
  isTariffRateChange,
  submitLoader,
  isShowGrc = false,
}) {
  console.log(isFor);
  console.log("J");
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
  const [country, setCountry] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [saveLoader, setSaveLoader] = useState(false);
  const navigate = useNavigate();
  const { _id: cmp_id, configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg,
  );

  const { data, loading } = useFetch(
    `/api/sUsers/getProductSubDetails/${cmp_id}?type=roomType`,
  );
  useEffect(() => {
    if (data) setRoomType(data?.data);
  }, [data]);

  const { data: visitOfPurposeData, loading: visitOfPurposeLoading } = useFetch(
    `/api/sUsers/getVisitOfPurpose/${cmp_id}`,
  );
  useEffect(() => {
    if (visitOfPurposeData) setVisitOfPurpose(visitOfPurposeData?.data);
  }, [visitOfPurposeData]);

  const today = new Date();
  const isoDate = (d) => d.toISOString().split("T")[0];
  const arrivalDateDefault = isoDate(today);
  const checkOutDateObj = new Date(today);
  checkOutDateObj.setDate(today.getDate() + 1);
  const checkOutDateDefault = isoDate(checkOutDateObj);
  const currentDateDefault = isoDate(today);

  useEffect(() => {
    if (submitLoader) {
      setShowPaymentModal(true);
      setSaveLoader(true);
    }
  }, [submitLoader]);

  const [formData, setFormData] = useState({
    bookingDate: arrivalDateDefault,
    voucherNumber: voucherNumber,
    voucherId: "",
    arrivalDate: arrivalDateDefault,
    arrivalTime: "",
    checkOutDate: checkOutDateDefault,
    checkOutTime: "",
    currentDate: currentDateDefault,
    updatedDate: currentDateDefault,
    stayDays: 1,
    bookingType: "offline",
    country: "",
    state: "",
    pinCode: "",
    detailedAddress: "",
    mobileNumber: "",
    selectedRoomPrice: "",
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
    roomTotal: 0,
    paxTotal: 0,
    foodPlanTotal: 0,
    company: "",
    nextDestination: "",
    dateOfBirth: "",
    dateOfArrivalInIndia: "",
    visaNo: "",
    visaPOI: "",
    visaDOI: "",
    visaExpDt: "",
    certOfRegistrationNumber: "",
    passportNo: "",
    placeOfIssue: "",
    dateOfIssue: "",
    dateOfExpiry: "",
    grcno: "",
    addTaxWithRate: configurations[0]?.addRateWithTax?.hotelSale,
  });
  console.log(voucherNumber);
  console.log(formData);
  useEffect(() => {
    if (editData) {
      setSelectedParty(editData?.customerId);
      setHotelAgent(editData?.agentId);
      setCountry(editData?.country || "");
      setVoucherNumber(editData?.voucherNumber);
      let highestDate = editData?.checkOutDate;
      if (isTariffRateChange) {
        highestDate =
          currentDateDefault > highestDate ? currentDateDefault : highestDate;
        console.log(highestDate);
      }
      setFormData((prev) => ({
        ...prev,
        country: editData?.country,
        customerId: editData?.customerId?._id,
        voucherNumber: editData?.voucherNumber,
        state: editData?.state,
        pinCode: editData?.pinCode,
        detailedAddress: editData?.detailedAddress,
        mobileNumber: editData?.mobileNumber,
        arrivalDate: editData?.arrivalDate || prev.arrivalDate,
        arrivalTime: editData?.arrivalTime || prev.arrivalTime,
        checkOutDate: highestDate || prev.checkOutDate,
        checkOutTime: editData?.checkOutTime || prev.checkOutTime,
        stayDays: editData?.stayDays ?? prev.stayDays,
        bookingType: editData?.bookingType || prev.bookingType,
        selectedRooms: editData?.selectedRooms || [],
        additionalPaxDetails: editData?.additionalPaxDetails || [],
        foodPlan: editData?.foodPlan || [],
        paxTotal: editData?.paxTotal || 0,
        foodPlanTotal: editData?.foodPlanTotal || 0,
        roomTotal: editData?.roomTotal || 0,
        discountPercentage: editData?.discountPercentage || 0,
        discountAmount: editData?.discountAmount || 0,
        totalAdvance: editData?.totalAdvance || 0,
        visitOfPurpose: editData?.visitOfPurpose,
        voucherId: editData?.voucherId,
        customerName: editData?.customerId?.partyName,
        accountGroup: editData?.customerId?.accountGroup,
        balanceToPay: editData?.balanceToPay || 0,
        advanceAmount: editData?.advanceAmount || 0,
        previousAdvance: editData?.previousAdvance || 0,
        company: editData?.company || "",
        nextDestination: editData?.nextDestination || "",
        dateOfBirth: editData?.dateOfBirth || "",
        dateOfArrivalInIndia: editData?.dateOfArrivalInIndia || "",
        visaNo: editData?.visaNo || "",
        visaPOI: editData?.visaPOI || "",
        visaDOI: editData?.visaDOI || "",
        visaExpDt: editData?.visaExpDt || "",
        certOfRegistrationNumber: editData?.certOfRegistrationNumber || "",
        passportNo: editData?.passportNo || "",
        placeOfIssue: editData?.placeOfIssue || "",
        dateOfIssue: editData?.dateOfIssue || "",
        dateOfExpiry: editData?.dateOfExpiry || "",
        grcno: editData?.grcno || "",
        currentDate: editData?.arrivalDate || currentDateDefault,
        updatedDate: editData?.updatedDate || currentDateDefault,
      }));
    }
  }, [editData]);

  useEffect(() => {
    if (roomId) setSelectedRoomId(roomId);
  }, [roomId]);
  console.log(formData.checkOutDate);
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "country") setCountry(value);

    if (name === "arrivalDate") {
      const checkout = new Date(value);
      if (formData.stayDays) {
        checkout.setDate(checkout.getDate() + Number(formData.stayDays));
      } else {
        checkout.setDate(checkout.getDate() + 1);
      }
      const formattedCheckout = isoDate(checkout);
      setFormData((prev) => ({
        ...prev,
        checkOutDate: formattedCheckout,
        arrivalDate: value,
        updatedDate: currentDateDefault,
      }));
      return;
    }

    if (name === "checkOutDate") {
      const arrivalDate = new Date(formData.arrivalDate);
      const checkOutDate = new Date(value);
      const diffTime = checkOutDate - arrivalDate;
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // check stay the diffDays always greater than 1
      if (diffDays < 1) diffDays = 1;
      const updatedSelectedItems =
        formData.selectedRooms?.map((room) => ({
          ...room,
          stayDays: diffDays,
          totalAmount: diffDays * room.priceLevelRate,
        })) || [];
      setFormData((prev) => ({
        ...prev,
        checkOutDate: value,
        stayDays: diffDays,
        selectedRooms: updatedSelectedItems,
        updatedDate: currentDateDefault,
      }));
      return;
    }

    if (name === "stayDays") {
      const arrival = new Date(formData.arrivalDate);
      const stayDays = parseInt(value || 0);
      if (!isNaN(stayDays)) {
        const checkout = new Date(arrival);
        checkout.setDate(arrival.getDate() + stayDays);
        const updatedSelectedItems =
          formData.selectedRooms?.map((room) => ({
            ...room,
            stayDays,
            totalAmount: stayDays * room.priceLevelRate,
          })) || [];
        const formattedCheckout = isoDate(checkout);
        setFormData((prev) => ({
          ...prev,
          stayDays: value,
          checkOutDate: formattedCheckout,
          selectedRooms: updatedSelectedItems,
          updatedDate: currentDateDefault,
        }));
      } else {
        setFormData((prev) => ({ ...prev, stayDays: value }));
      }
      return;
    }

    if (name === "currentDate") {
      const current = new Date(value);
      const arrival = new Date(formData.arrivalDate);
      const checkout = new Date(formData.checkOutDate);

      // Check if currentDate is within the range
      if (current >= arrival && current < checkout) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      } else {
        // Optional: alert or toast if not valid
        toast.error(
          "Tariff applicable date must be between Arrival Date and Check-Out Date",
        );
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrivalTimeChange = (time) =>
    setFormData((prev) => ({
      ...prev,
      arrivalTime: time,
      updatedDate: currentDateDefault,
    }));

  const handleCheckOutTimeChange = (time) =>
    setFormData((prev) => ({
      ...prev,
      checkOutTime: time,
      updatedDate: currentDateDefault,
    }));

  const isForeign =
    country.trim().toLowerCase() !== "india" && country.trim() !== "";

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get(
        `/api/sUsers/getSeriesByVoucher/${cmp_id}?voucherType=${isFor}`,
        { withCredentials: true },
      );
      if (response.data) {
        const specificSeries = response.data.series?.find(
          (item) => item.under === "hotel",
        );
        console.log(specificSeries);
        if (specificSeries) {
          const {
            prefix = "",
            currentNumber = 0,
            suffix = "",
            width = 3,
          } = specificSeries;
          console.log("HHH");
          const paddedNumber = String(currentNumber).padStart(width, "0");
          console.log(currentNumber);
          console.log(paddedNumber);
          const specificNumber = `${prefix}${paddedNumber}${suffix}`;
          console.log(specificNumber);
          setFormData((prev) => ({
            ...prev,
            voucherNumber: specificNumber,
            voucherId: specificSeries._id,
            voucherType: "",
            ...(isShowGrc && {
              grcno: currentNumber.toString(),
            }),
          }));
          setVoucherNumber(specificNumber);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching data");
    } finally {
      setIsLoading(false);
    }
  }, [cmp_id, isFor, setIsLoading]);
  console.log(formData);
  console.log(isFor);
  console.log(editData);
  useEffect(() => {
    if (!editData || isFor === "deliveryNote" || isFor === "sales") {
      console.log(isFor);
      console.log("HHs");
      fetchData();
    }
  }, [fetchData, editData, isFor]);
  // Fixed calculation: Room total + Pax + Food Plan = Total Amount, then apply discount
  useEffect(() => {
    const handler = setTimeout(() => {
      const roomTotal = Number(formData?.roomTotal || 0);
      const paxTotal = Number(formData?.paxTotal || 0);
      const foodPlanTotal = Number(formData?.foodPlanTotal || 0);
      console.log(roomTotal);
      console.log(paxTotal);
      console.log(foodPlanTotal);
      console.log(roomTotal);
      // Total before discount
      const totalAmount = roomTotal;

      // Apply discount
      const discountAmount = Number(formData.discountAmount || 0);
      const grandTotal = (totalAmount - discountAmount).toFixed(2);

      // Calculate balance
      const totalAdvance = Number(formData.totalAdvance || 0);
      const balanceToPay = (grandTotal - totalAdvance).toFixed(2);

      // Calculate discount percentage
      const discountPercentage =
        totalAmount > 0 ? ((discountAmount / totalAmount) * 100).toFixed(2) : 0;
      console.log(totalAmount);
      console.log(formData);
      setFormData((prev) => ({
        ...prev,
        totalAmount: totalAmount.toFixed(2),
        discountPercentage,
        grandTotal,
        balanceToPay,
      }));
    }, 300);
    console.log("jjjj");
    return () => clearTimeout(handler);
  }, [
    formData.roomTotal,
    formData.paxTotal,
    formData.foodPlanTotal,
    formData.discountAmount,
    formData.totalAdvance,
  ]);
  console.log(formData);
  const handleDiscountPercentageChange = (e) => {
    const { value } = e.target;
    const percentage = Number(value) || 0;
    const totalAmount =
      Number(formData?.roomTotal || 0) +
      Number(formData?.paxTotal || 0) +
      Number(formData?.foodPlanTotal || 0);
    const calculatedAmount = (totalAmount * percentage) / 100;
    setFormData((prev) => ({
      ...prev,
      discountPercentage: value,
      discountAmount: calculatedAmount.toFixed(2),
      updatedDate: currentDateDefault,
    }));
  };

  const handleDiscountAmountChange = (e) => {
    const { value } = e.target;
    const amount = Number(value) || 0;
    const totalAmount =
      Number(formData?.roomTotal || 0) +
      Number(formData?.paxTotal || 0) +
      Number(formData?.foodPlanTotal || 0);
    if (amount >= 0 && amount <= totalAmount) {
      const calculatedPercentage =
        totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
      setFormData((prev) => ({
        ...prev,
        discountAmount: value,
        discountPercentage: calculatedPercentage.toFixed(2),
        updatedDate: currentDateDefault,
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

    if (advanceAmount > maxAllowed) {
      setErrorObject((prev) => ({
        ...prev,
        advanceAmount:
          "Advance amount should be less than or equal to grand total",
      }));
      return;
    }

    setErrorObject((prev) => ({ ...prev, advanceAmount: "" }));

    if (isFor === "deliveryNote" || isFor === "sales") {
      setFormData((prev) => ({
        ...prev,
        advanceAmount: value,
        balanceToPay: (grandTotal - previousAdvance - advanceAmount).toFixed(2),
        totalAdvance: totalAdvance,
        updatedDate: currentDateDefault,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        advanceAmount: value,
        balanceToPay: (grandTotal - advanceAmount).toFixed(2),
        totalAdvance: advanceAmount,
        updatedDate: currentDateDefault,
      }));
    }
  };

  const handleSelection = (party, search) => {
    setSelectedParty(party);
    if (!party) {
      setFormData((prev) => ({
        ...prev,
        customerName: search,
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
      customerName: party.partyName,
      customerId: party._id,
      country: party.country,
      accountGroup: party?.accountGroup,
      state: party.state,
      pinCode: party.pin,
      detailedAddress: party.billingAddress,
      mobileNumber: party.mobileNumber,
    }));
  };

  const handleAvailableRoomSelection = (selectedRoom) => {
    setFormData((prev) => ({
      ...prev,
      selectedRoomId: selectedRoom?._id,
      priceLevelId: selectedRoom?.priceLevel[0]?.pricelevel?._id,
      priceLevelRate: selectedRoom?.priceLevel[0]?.priceRate,
      updatedDate: currentDateDefault,
    }));
  };
  console.log(formData);

  const handleAdditionalPaxDetails = (details, room) => {
    console.log(room);
    console.log(details);
    const existingDetails = Array.isArray(formData?.additionalPaxDetails)
      ? formData.additionalPaxDetails
      : [];
    const filterData = existingDetails.filter((i) => i.roomId !== room);
    const totalAmount = [...filterData, ...details].reduce(
      (acc, item) => acc + Number(item.rate),
      0,
    );
    console.log(filterData);
    console.log(totalAmount);
    setFormData((prev) => ({
      ...prev,
      additionalPaxDetails: [...filterData, ...details],
      paxTotal: totalAmount,
      updatedDate: currentDateDefault,
    }));
  };
  console.log(formData);
  const handleFoodPlanData = (details, room) => {
    console.log(details);
    console.log(room);
    console.log(formData.foodPlan);
    const existingDetails = Array.isArray(formData?.foodPlan)
      ? formData.foodPlan
      : [];
    const filterData = existingDetails.filter((i) => i.roomId !== room);
    const totalAmount = [...filterData, ...details].reduce(
      (acc, item) => acc + Number(item.rate),
      0,
    );
    console.log(totalAmount);
    console.log(formData);
    setFormData((prev) => ({
      ...prev,
      foodPlan: [...filterData, ...details],
      foodPlanTotal: totalAmount,
      updatedDate: currentDateDefault,
    }));
  };
  console.log(formData);
  const selectedRoomData = (id, to) => {
    if (to === "addPax") {
      setDisplayAdditionalPax(true);
      setSelectedRoomId(id);
    }
    if (to === "addFoodPlan") {
      setDisplayFoodPlan(true);
      setSelectedRoomId(id);
    }
  };

  const handleAgentSelect = (agent) => {
    setHotelAgent(agent);
    setFormData((prev) => ({ ...prev, agentId: agent ? agent._id : "" }));
  };
  console.log(formData);
  const handleAvailableRooms = (rooms, total) => {
    console.log("=== handleAvailableRooms called ===");
    console.log("Incoming rooms:", rooms);
    console.log("Incoming total:", total);
    console.log("isTariffRateChange:", isTariffRateChange);
    console.log("roomId:", roomId);

    if (rooms.length > 0) {
      // ✅ CRITICAL: If in tariff rate change mode, merge with existing rooms
      if (isTariffRateChange && roomId && editData?.selectedRooms) {
        console.log("=== Tariff mode - merging rooms ===");
        console.log("Original rooms from editData:", editData.selectedRooms);

        // Get the updated room (should be rooms[0] in tariff change mode)
        const updatedRoom = rooms.find((room) => room.roomId === roomId);

        console.log("Updated room from AvailableRooms:", updatedRoom);
        console.log("Looking for roomId:", roomId);

        if (updatedRoom) {
          // Find and replace only the edited room, keep all others
          const mergedRooms = editData.selectedRooms.map((originalRoom) => {
            // Get the room ID from various possible structures
            const originalRoomId =
              originalRoom.roomId?._id?.toString() ||
              originalRoom.roomId?.toString() ||
              originalRoom._id?.toString();

            // If this is the room being edited, replace it
            if (originalRoomId === roomId?.toString()) {
              console.log("Found room to update:", originalRoom.roomName);
              return {
                ...updatedRoom,
                _id: originalRoom._id, // Preserve original _id
                roomId: originalRoom.roomId, // Preserve roomId reference
              };
            }

            // Keep all other rooms unchanged
            return originalRoom;
          });

          // Recalculate total for ALL rooms
          const newTotal = mergedRooms.reduce(
            (sum, room) =>
              sum + Number(room.amountAfterTax || room.totalAmount || 0),
            0,
          );

          console.log("Final merged rooms count:", mergedRooms);
          console.log(
            "Final rooms:",
            mergedRooms.map((r) => r.roomName),
          );
          console.log("New total:", newTotal);

          setFormData((prev) => ({
            ...prev,
            selectedRooms: mergedRooms, // ✅ Use ALL rooms
            roomTotal: newTotal,
            updatedDate: currentDateDefault,
          }));
          return;
        }
      }
      console.log(total);
      // Normal flow - replace all rooms (for non-tariff change scenarios)
      console.log("Normal mode - replacing all rooms");
      setFormData((prev) => ({
        ...prev,
        selectedRooms: rooms,
        roomTotal: total,
        updatedDate: currentDateDefault,
      }));
    } else {
      console.log("No rooms - clearing");
      setFormData((prev) => ({
        ...prev,
        selectedRooms: [],
        roomTotal: 0,
        updatedDate: currentDateDefault,
      }));
    }

    console.log("=== handleAvailableRooms end ===");
  };

 const submitHandler = async () => {
  if (!formData.customerName || formData.customerName.trim() === "") {
    toast.error("Please enter a customer name");
    return;
  }

  let customerId = formData.customerId?.trim?.() || formData.customerId || "";
  let customerName = formData.customerName.trim(); // Use trimmed name
    let country = formData.country;
    let accountGroup = formData.accountGroup;
    let state = formData.state;
    let pinCode = formData.pinCode;
    let detailedAddress = formData.detailedAddress;
    let mobileNumber = formData.mobileNumber;

    if (!customerId) {
      try {
        const dataObject = {
          accountGroup: "",
          partyName: formData.customerName,
          mobileNumber: formData.mobileNumber,
          emailID: "",
          gstNo: "",
          panNo: "",
          billingAddress: formData.detailedAddress,
          shippingAddress: formData.detailedAddress,
          creditPeriod: "",
          creditLimit: "",
          openingBalanceType: "",
          openingBalanceAmount: 0,
          country: formData.country,
          state: formData.state,
          pin: formData.pinCode,
          subGroup: "",
          isHotelAgent: false,
          cpm_id: cmp_id,
        };

        const res = await api.post("/api/sUsers/addParty", dataObject, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });

        toast.success(res.data.message);

        customerId = res.data?.result?._id;
        customerName = res.data?.result?.partyName;
        country = res.data?.result?.country;
        accountGroup = res.data?.result?.accountGroup_id;
        state = res.data?.result?.state;
        pinCode = res.data?.result?.pin;
        detailedAddress = res.data?.result?.billingAddress;
        mobileNumber = res.data?.result?.mobileNumber;
      } catch {
        toast.error("Failed to create customer");
        return;
      }
    }

    // ✅ CRITICAL: Verify we have all rooms before submission
    console.log("=== SUBMIT HANDLER - BEFORE PAYLOAD ===");
    console.log("isTariffRateChange:", isTariffRateChange);
    console.log("roomId:", roomId);
    console.log("formData.selectedRooms:", formData.selectedRooms);
    console.log(
      "formData.selectedRooms.length:",
      formData.selectedRooms?.length,
    );

    // Verify room count hasn't decreased
    if (isTariffRateChange && editData?.selectedRooms) {
      const originalCount = editData.selectedRooms.length;
      const currentCount = formData.selectedRooms?.length || 0;

      if (currentCount < originalCount) {
        console.error("❌ ROOM LOSS DETECTED!");
        console.error(`Original: ${originalCount}, Current: ${currentCount}`);
        toast.error(
          "Error: Some rooms were lost during update. Please try again.",
        );
        return;
      }
    }

    const payload = {
      ...formData,
      customerId,
      customerName,
      country,
      accountGroup,
      state,
      pinCode,
      detailedAddress,
      mobileNumber,
      voucherNumber,
      selectedRooms: formData.selectedRooms, // Should contain ALL rooms
    };

    console.log("=== FINAL PAYLOAD ===");
    console.log("Total rooms in payload:", payload.selectedRooms);
    console.log(
      "Room names:",
      payload.selectedRooms?.map((r) => r.roomName),
    );
    console.log("====================");

    if (
      Number(formData.advanceAmount) <= 0 ||
      formData.advanceAmount == editData?.advanceAmount
    ) {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      console.log("jjj");

      handleSubmit(payload);
    } else {
      setFormData((prev) => ({ ...prev, ...payload }));
      setShowPaymentModal(true);
    }
  };

  const handlePayment = (paymentData) => {
    let finalSelectedRooms = formData.selectedRooms;

    if (isTariffRateChange && roomId && editData?.selectedRooms) {
      // Same merging logic as submitHandler
    }

    const payload = {
      ...formData,
      selectedRooms: finalSelectedRooms,
    };
    console.log(payload);
    console.log(paymentData);
    let cash = 0;
    let upi = 0;
    let card = 0;
    const credit = 0;
    let bank = 0;
    console.log(paymentData);
    paymentData.payments.forEach((item) => {
      if (item.paymentType === "upi") {
        upi += item.amount;
      } else if (item.paymentType == "card") {
        card += item.amount;
      } else if (item.paymentType === "bank") {
        bank += item.amount;
      } else if (item.paymentType === "cash") {
        cash += item?.amount;
      }
    });
    console.log(cash);
    console.log(bank);
    console.log(card);
    console.log(upi);
    console.log(credit);
    const paymenttypeDetails = {
      cash: cash,
      bank: bank,
      upi: upi,
      card: card,
      credit: credit,
    };
    console.log(paymenttypeDetails);

    console.log("hhhhh");
    handleSubmit(payload, paymentData, paymenttypeDetails);
  };
  console.log(formData);
  const handleClose = () => setShowPaymentModal(false);
const handleSearchCustomer = (name) => {
  console.log("Searched name:", name);
  setFormData((prev) => ({ 
    ...prev, 
    customerName: name,
    // Clear customerId if user is typing a new name
    customerId: name && !selectedParty ? "" : prev.customerId
  }));
};

  const tariffMode = isTariffRateChange === true;
  console.log(formData?.additionalPaxDetails);

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
              customers={
                selectedParty
                  ? [
                      {
                        _id: selectedParty._id || formData.customerId,
                        partyName:
                          selectedParty.partyName || formData.customerName,
                      },
                    ]
                  : []
              }
            />
          )}

          {!tariffMode ? (
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
                <div className="flex flex-wrap gap-6">
                  {/* Booking Number */}
                  <div className="w-full bg-gray-50 border rounded-xl shadow-md p-6">
                    {/* Title */}
                    <h2 className="text-lg font-semibold text-blueGray-800 mb-6">
                      Guest Details
                    </h2>

                    {/* Main Guest Fields */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                      {/* Guest Name */}
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          Guest Name
                        </label>
                        <CustomerSearchInputBox
                          onSelect={handleSelection}
                          selectedParty={selectedParty}
                          isAgent={false}
                          placeholder="Search customers..."
                          sendSearchToParent={handleSearchCustomer}
                        />
                      </div>

                      {/* Country */}
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          Country
                        </label>
                        <input
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded text-sm shadow focus:outline-none focus:ring focus:ring-blue-200 bg-white"
                        />
                      </div>

                      {/* State */}
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded text-sm shadow focus:outline-none focus:ring focus:ring-blue-200 bg-white"
                        />
                      </div>

                      {/* PinCode */}
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          PinCode
                        </label>
                        <input
                          name="pinCode"
                          value={formData.pinCode}
                          onChange={handleChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded text-sm shadow focus:outline-none focus:ring focus:ring-blue-200 bg-white"
                        />
                      </div>

                      {/* Detailed Address */}
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          Detailed Address
                        </label>
                        <input
                          type="text"
                          name="detailedAddress"
                          value={formData.detailedAddress}
                          onChange={handleChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded text-sm shadow focus:outline-none focus:ring focus:ring-blue-200 bg-white"
                        />
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          Mobile Number
                        </label>
                        <input
                          type="number"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded text-sm shadow focus:outline-none focus:ring focus:ring-blue-200 bg-white"
                        />
                      </div>
                    </div>

                    {/* Foreign Guest Fields */}
                    {isForeign && (
                      <>
                        <hr className="my-8" />
                        <h3 className="text-base font-semibold text-gray-700 mb-4">
                          Foreign Guest Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          {/* Company */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Company
                            </label>
                            <input
                              type="text"
                              name="company"
                              value={formData.company || ""}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring focus:ring-blue-200 focus:outline-none"
                            />
                          </div>
                          {/* Next Destination */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Next Destination
                            </label>
                            <input
                              type="text"
                              name="nextDestination"
                              value={formData.nextDestination || ""}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring focus:ring-blue-200 focus:outline-none"
                            />
                          </div>
                          {/* Date of Birth */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              name="dateOfBirth"
                              value={formData.dateOfBirth || ""}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring focus:ring-blue-200 focus:outline-none"
                            />
                          </div>
                          {/* Date of Arrival in India */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Date of Arrival in India
                            </label>
                            <input
                              type="date"
                              name="dateOfArrivalInIndia"
                              value={formData.dateOfArrivalInIndia || ""}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring focus:ring-blue-200 focus:outline-none"
                            />
                          </div>
                          {/* Visa No. */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Visa No.
                            </label>
                            <input
                              type="text"
                              name="visaNo"
                              value={formData.visaNo || ""}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring focus:ring-blue-200 focus:outline-none"
                            />
                          </div>
                          {/* Visa POI */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Visa POI
                            </label>
                            <input
                              type="text"
                              name="visaPOI"
                              value={formData.visaPOI || ""}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring focus:ring-blue-200 focus:outline-none"
                            />
                          </div>
                          {/* Visa DOI */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Visa DOI
                            </label>
                            <input
                              type="date"
                              name="visaDOI"
                              value={formData.visaDOI || ""}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring focus:ring-blue-200 focus:outline-none"
                            />
                          </div>
                          {/* Visa Exp. Dt */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Visa Exp. Dt
                            </label>
                            <input
                              type="date"
                              name="visaExpDt"
                              value={formData.visaExpDt || ""}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring focus:ring-blue-200 focus:outline-none"
                            />
                          </div>
                          {/* Registration No. */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Cert. of Registration Number
                            </label>
                            <input
                              type="text"
                              name="certOfRegistrationNumber"
                              value={formData.certOfRegistrationNumber || ""}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring focus:ring-blue-200 focus:outline-none"
                            />
                          </div>
                          {/* Passport No. */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Passport No.
                            </label>
                            <input
                              type="text"
                              name="passportNo"
                              value={formData.passportNo || ""}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring focus:ring-blue-200 focus:outline-none"
                            />
                          </div>
                          {/* Place of Issue */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Place of Issue
                            </label>
                            <input
                              type="text"
                              name="placeOfIssue"
                              value={formData.placeOfIssue || ""}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring focus:ring-blue-200 focus:outline-none"
                            />
                          </div>
                          {/* Date of Issue */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Date of Issue
                            </label>
                            <input
                              type="date"
                              name="dateOfIssue"
                              value={formData.dateOfIssue || ""}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring focus:ring-blue-200 focus:outline-none"
                            />
                          </div>
                          {/* Date of Expiry */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Date of Expiry
                            </label>
                            <input
                              type="date"
                              name="dateOfExpiry"
                              value={formData.dateOfExpiry || ""}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring focus:ring-blue-200 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              GRC Number
                            </label>
                            <input
                              type="text"
                              name="grcno"
                              value={formData.grcno || ""}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring focus:ring-blue-200 focus:outline-none"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Guest Info Box */}

                  {/* Booking/Room Fields Box */}
                  <div className="w-full bg-gray-50 border rounded-xl shadow-md ">
                    <h2 className="text-lg  font-semibold text-blueGray-800 mb-6 p-2">
                      Booking & Room Details
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 p-3">
                      {/* Arrival Date */}
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          Arrival Date
                        </label>
                        <input
                          type="date"
                          name="arrivalDate"
                          value={formData.arrivalDate}
                          onChange={handleChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded text-sm shadow focus:outline-none focus:ring focus:ring-blue-200 bg-white"
                        />
                      </div>
                      {/* Arrival Time */}
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          Arrival Time
                        </label>
                        <TimeSelector
                          initialTime={editData?.arrivalTime}
                          onTimeChange={handleArrivalTimeChange}
                        />
                      </div>
                      {/* Check Out Date */}
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          Check Out Date
                        </label>
                        <input
                          type="date"
                          name="checkOutDate"
                          value={formData.checkOutDate}
                          onChange={handleChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded text-sm shadow focus:outline-none focus:ring focus:ring-blue-200 bg-white"
                        />
                      </div>
                      {/* Check Out Time */}
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          Check Out Time
                        </label>
                        <TimeSelector
                          initialTime={editData?.checkOutTime}
                          onTimeChange={handleCheckOutTimeChange}
                        />
                      </div>
                      {/* Booking Type */}
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          Booking Type
                        </label>
                        <select
                          name="bookingType"
                          value={formData.bookingType}
                          onChange={handleChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded text-sm shadow focus:outline-none focus:ring focus:ring-blue-200 bg-white"
                        >
                          <option value="offline">Offline Booking</option>
                          <option value="online">Online Booking</option>
                        </select>
                      </div>
                      {/* Hotel Agent */}
                      <div>
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
                      {/* Stay Days */}
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          Stay Days
                        </label>
                        <input
                          type="text"
                          name="stayDays"
                          value={formData.stayDays}
                          onChange={handleChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded text-sm shadow focus:outline-none focus:ring focus:ring-blue-200 bg-white"
                        />
                      </div>
                      {/* Visit of Purpose */}
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          Visit of purpose
                        </label>
                        <select
                          name="visitOfPurpose"
                          value={formData.visitOfPurpose}
                          onChange={handleChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded text-sm shadow focus:outline-none focus:ring focus:ring-blue-200 bg-white"
                        >
                          <option value="All">Select Room Type</option>
                          {visitOfPurpose.map((data) => (
                            <option key={data?._id} value={data?._id}>
                              {data?.visitOfPurpose}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Room Type */}
                      <div>
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          Room Type
                        </label>
                        <select
                          name="roomType"
                          value={formData.roomType}
                          onChange={handleChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded text-sm shadow focus:outline-none focus:ring focus:ring-blue-200 bg-white"
                        >
                          <option value="All">Select Room Type</option>
                          {roomType.map((roomType) => (
                            <option key={roomType?._id} value={roomType?._id}>
                              {roomType?.brand}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="flex items-center gap-4">
                          {isShowGrc && (
                            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                              GRC NO
                            </label>
                          )}
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                            Add Tax With Rate
                          </label>
                        </div>
                        <div className="flex items-center gap-4">
                          {/* GRC Input */}
                          {isShowGrc && (
                            <input
                              type="text"
                              name="grcno"
                              value={formData.grcno || ""}
                              onChange={handleChange}
                              placeholder="GRC %"
                              className="w-24 border px-2 py-1 rounded text-sm focus:outline-none focus:ring bg-white border-gray-200"
                            />
                          )}
                          {/* Toggle */}
                          <button
                            type="button"
                            onClick={() =>
                              handleChange({
                                target: {
                                  name: "addTaxWithRate",
                                  value: !formData.addTaxWithRate,
                                },
                              })
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition
        ${formData.addTaxWithRate ? "bg-green-600" : "bg-gray-300"}`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white transition
          ${formData.addTaxWithRate ? "translate-x-5" : "translate-x-1"}`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Available Rooms (spans both columns if needed) */}
                      <div className="col-span-2">
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
                          isTariffRateChange={isTariffRateChange}
                          roomIdToUpdate={roomId}
                          addTaxWithRate={formData.addTaxWithRate}
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
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          Grand Total
                        </label>
                        <div className="space-y-2">
                          {/* Original Amount */}
                          {/* <div className="text-xs text-gray-500">
        Original: ₹(Number{formData?.grandTotal?.toFixed(2)})
      </div> */}
                          {/* Rounded Amount */}
                          <input
                            type="number"
                            name="grandTotal"
                            value={Math.round(formData.grandTotal)}
                            className="text-green-500 border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            readOnly
                          />
                        </div>
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
              </div>
            </>
          ) : (
            //t
            <div className="flex-auto px-4 lg:px-10 py-8">
              <div className="w-full bg-gray-50 border rounded-xl shadow-md p-4 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <Field
                    label="Check-in Number"
                    value={voucherNumber}
                    readOnly
                  />
                  <FieldDate
                    name="currentDate"
                    label="Tariff Applicable Date"
                    value={formData.currentDate}
                    onChange={handleChange}
                  />
                  <div>
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Updated Date (Last Rate Update)
                    </label>
                    <input
                      type="date"
                      name="updatedDate"
                      value={formData.updatedDate}
                      readOnly
                      className="w-full border border-gray-300 px-3 py-2 rounded text-sm bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Arrival Time
                    </label>
                    <TimeSelector
                      initialTime={editData?.arrivalTime}
                      onTimeChange={handleArrivalTimeChange}
                    />
                  </div>
                  <div>
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      CheckIn Date
                    </label>
                    <input
                      type="date"
                      name="arrivalDate"
                      value={formData.arrivalDate}
                      readOnly
                      className="w-full border border-gray-300 px-3 py-2 rounded text-sm bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      CheckOut Date
                    </label>
                    <input
                      type="date"
                      name="checkOutDate"
                      value={formData.checkOutDate}
                      readOnly
                      className="w-full border border-gray-300 px-3 py-2 rounded text-sm bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full bg-gray-50 border rounded-xl shadow-md p-4 mb-6">
                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                  Available Rooms
                </label>
                <AvailableRooms
                  onSelect={handleAvailableRoomSelection}
                  selectedParty={selectedParty}
                  selectedRoomData={selectedRoomData}
                  setDisplayFoodPlan={setDisplayFoodPlan}
                  sendToParent={handleAvailableRooms}
                  formData={formData}
                  selectedRoomId={selectedRoomId}
                  isTariffRateChange={isTariffRateChange}
                  roomIdToUpdate={roomId}
                  addTaxWithRate={formData.addTaxWithRate}
                />
              </div>

              <TotalsSection
                formData={formData}
                handleDiscountAmountChange={handleDiscountAmountChange}
                handleDiscountPercentageChange={handleDiscountPercentageChange}
                handleAdvanceAmountChange={handleAdvanceAmountChange}
                roomIdToUpdate={roomId}
                errorObject={errorObject}
              />

              <div className="flex justify-end">
                {/* {outStanding.length > 0 && (
                  <button
                    className="bg-pink-500 mt-4 ml-4 w-24 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md"
                    type="button"
                    onClick={() => setModalOpen(true)}
                  >
                    History
                  </button>
                )} */}
                <button
                  className="bg-pink-500 mt-4 ml-4 w-24 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md"
                  type="button"
                  onClick={submitHandler}
                >
                  Update
                </button>
              </div>
            </div>
          )}

          {displayAdditionalPax && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
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
            <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
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
      )}

      <OutStandingModal
        showModal={modalOpen}
        onClose={() => setModalOpen(false)}
        outStanding={outStanding}
      />
    </>
  );
}

const tariffRelatedCalculation = (type, formData, roomId) => {
  console.log(formData?.selectedRooms);
  // 1. Room Total
  const roomTotal =
    formData?.selectedRooms?.find((item) => item.roomId === roomId)
      ?.totalAmount || 0;

  // 2. Additional Pax Total
  const additionalPaxTotal =
    formData?.additionalPaxDetails
      ?.filter((item) => item.roomId === roomId)
      ?.reduce((acc, item) => acc + item.rate, 0) || 0;

  // 3. Food Plan Total
  const foodPlanTotal =
    formData?.foodPlan
      ?.filter((item) => item.roomId === roomId)
      ?.reduce((acc, item) => acc + item.rate, 0) || 0;

  // 4. Total Without Tax (from selectedRooms)
  const totalWithTax =
    formData?.selectedRooms?.find((item) => item.roomId === roomId)
      ?.amountAfterTax || 0;

  // 5. Total With Tax (sum of all)
  const totalWithoutTax = roomTotal + additionalPaxTotal + foodPlanTotal;

  // 6. Return based on type
  switch (type) {
    case "roomTotal":
      return roomTotal;

    case "additionalPaxTotal":
      return additionalPaxTotal;

    case "foodPlanTotal":
      return foodPlanTotal;

    case "totalWithoutTax":
      return totalWithoutTax;

    case "totalWithTax":
      return totalWithTax;

    default:
      return 0;
  }
};

function TotalsSection({
  formData,
  handleDiscountAmountChange,
  handleDiscountPercentageChange,
  handleAdvanceAmountChange,
  roomIdToUpdate,
  errorObject,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-gray-50 border rounded-xl shadow-md p-4">
        <h3 className="text-sm font-semibold text-blueGray-800 mb-3">
          Charges
        </h3>
        <div className="space-y-3">
          <FieldRO
            label="Room Total"
            value={tariffRelatedCalculation(
              "roomTotal",
              formData,
              roomIdToUpdate,
            )}
          />
          <FieldRO
            label="Additional Pax"
            value={tariffRelatedCalculation(
              "additionalPaxTotal",
              formData,
              roomIdToUpdate,
            )}
          />

          <FieldRO
            label="Food Plan"
            value={tariffRelatedCalculation(
              "foodPlanTotal",
              formData,
              roomIdToUpdate,
            )}
          />
          {/* <FieldRO
            label="Total Amount (Before Discount)"
            value={formData?.totalAmount || 0}
          />
          <LabeledInputNumber
            label="Discount %"
            name="discountPercentage"
            value={formData?.discountPercentage}
            onChange={handleDiscountPercentageChange}
            min="0"
            max="100"
            step="0.01"
          />
          <LabeledInputNumber
            label="Discount Amount"
            name="discountAmount"
            value={
              formData?.discountAmount === "0" ? "" : formData?.discountAmount
            }
            onChange={handleDiscountAmountChange}
            min="0"
            step="0.01"
          /> */}
        </div>
      </div>

      <div className="bg-gray-50 border rounded-xl shadow-md p-4">
        <h3 className="text-sm font-semibold text-blueGray-800 mb-3">
          Summary
        </h3>
        <div className="space-y-3">
          {/* <FieldRO
            label="Previous Advance"
            value={formData?.previousAdvance || 0}
          />
          <LabeledInputNumber
            label="Advance Amount"
            name="advanceAmount"
            value={formData?.advanceAmount}
            onChange={handleAdvanceAmountChange}
          />
          {errorObject?.advanceAmount && errorObject?.advanceAmount !== "" && (
            <span className="text-red-500 text-xs">
              {errorObject?.advanceAmount}
            </span>
          )}
          <FieldRO
            label="Total Advance"
            value={Number(formData?.totalAdvance || 0)}
          /> */}
          <div>
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-1">
              Total Without Tax
            </label>
            <input
              type="number"
              name="grandTotal"
              value={tariffRelatedCalculation(
                "totalWithoutTax",
                formData,
                roomIdToUpdate,
              )}
              readOnly
              className="w-full border-0 px-3 py-2 rounded text-sm bg-white text-green-600 font-bold"
            />
          </div>
          <div>
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-1">
              Total With Tax
            </label>
            <input
              type="number"
              name="grandTotal"
              value={tariffRelatedCalculation(
                "totalWithTax",
                formData,
                roomIdToUpdate,
              )}
              readOnly
              className="w-full border-0 px-3 py-2 rounded text-sm bg-white text-green-600 font-bold"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, name, readOnly = false }) {
  return (
    <div>
      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full border border-gray-300 px-3 py-2 rounded text-sm ${
          readOnly ? "bg-gray-100" : "bg-white"
        }`}
      />
    </div>
  );
}

function FieldDate({ label, value, onChange, name }) {
  return (
    <div>
      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
        {label}
      </label>
      <input
        type="date"
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full border border-gray-300 px-3 py-2 rounded text-sm bg-white"
      />
    </div>
  );
}

function LabeledInputNumber({ label, value, onChange, name, min, max, step }) {
  return (
    <div>
      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-1">
        {label}
      </label>
      <input
        type="number"
        name={name}
        value={value ?? ""}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="w-full border border-gray-300 px-3 py-2 rounded text-sm bg-white"
      />
    </div>
  );
}

function FieldRO({ label, value, accent = false }) {
  return (
    <div>
      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-1">
        {label}
      </label>
      <input
        value={Number(value || 0).toFixed(2)}
        readOnly
        className={`w-full border-0 px-3 py-2 rounded text-sm bg-white ${
          accent ? "text-red-600 font-bold" : "text-blueGray-700"
        }`}
      />
    </div>
  );
}

export default BookingForm;
