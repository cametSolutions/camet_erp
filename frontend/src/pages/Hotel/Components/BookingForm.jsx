import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "@/api/api";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import HeaderTile from "@/pages/voucher/voucherCreation/HeaderTile";
import { formatVoucherType } from "/utils/formatVoucherType";
import CustomerSearchInputBox from "./customerSearchInPutBox";
import TimeSelector from "./TimeSelector";
import AvailableRooms from "./AvailableRooms";
import AdditionalPaxDetails from "./additionalPaxDetails";
function BookingForm({ isLoading, setIsLoading }) {
  const [voucherNumber, setVoucherNumber] = useState("");
  const [selectedParty, setSelectedParty] = useState("");

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const today = new Date();
  const arrivalDate = today.toISOString().split("T")[0];

  const checkOutDateObj = new Date(today);
  checkOutDateObj.setDate(today.getDate() + 1); // Add 1 day
  const checkOutDate = checkOutDateObj.toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    bookingDate: arrivalDate,
    bookingNumber: "",
    arrivalDate: arrivalDate,
    arrivalTime: "",
    checkOutDate: checkOutDate,
    selectedRoomId: "",
    checkOutTime: "",
    stayDays: 1,
    bookingType: "offline",
    bedType: "",
    roomFloor: "",
    unit: "",
    hsn: "",
    country: "",
    state: "",
    pinCode: "",
    detailedAddress: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "stayDays") {
      console.log("stayDays", value);
      const arrival = new Date(formData.arrivalDate); // '2025-07-09'
      const stayDays = parseInt(value); // assume value = 2

      if (!isNaN(stayDays)) {
        const checkout = new Date(arrival);
        checkout.setDate(arrival.getDate() + stayDays);

        // Format checkout date to 'YYYY-MM-DD'
        const formattedCheckout = checkout.toISOString().split("T")[0];

        setFormData({
          ...formData,
          stayDays: value,
          checkOutDate: formattedCheckout,
        });
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
  }, [cmp_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelection = (selectedParty) => {
    setSelectedParty(selectedParty);
    console.log(selectedParty);
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
      customerId: selectedParty._id,
      country: selectedParty.country,
      state: selectedParty.state,
      pinCode: selectedParty.pin,
      detailedAddress: selectedParty.billingAddress,
    }));
  };

  const handleAvailableRoomSelection = (selectedRoom) => {
    setFormData((prev) => ({ ...prev, selectedRoomId: selectedRoom?._id }));
  };
  const handleArrivalTimeChange = (time) => {
    setFormData((prev) => ({ ...prev, arrivalTime: time }));
  };

  const handleCheckOutTimeChange = (time) => {
    setFormData((prev) => ({ ...prev, checkOutTime: time }));
  };

  const submitHandler = () => {
    // Submit logic here
    console.log("Form submitted:", formData);
  };

  console.log(formData);
  return (
    <>
      {isLoading ? (
        <CustomBarLoader />
      ) : (
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
                    Country
                  </label>
                  <input
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
                    name="detailedAddress"
                    value={formData.detailedAddress}
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
                  <TimeSelector onTimeChange={handleArrivalTimeChange} />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    Stay Days
                  </label>
                  <input
                    type="number"
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
                  <TimeSelector onTimeChange={handleCheckOutTimeChange} />
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

              {/* Available Rooms */}
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    Available Rooms
                  </label>
                  <AvailableRooms
                    onSelect={handleAvailableRoomSelection}
                    selectedParty={selectedParty}
                    placeholder="Search customers..."
                  />
                </div>
              </div>
            </div>
            <AdditionalPaxDetails cmp_id={cmp_id} />

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                className="bg-pink-500 mt-4 ml-4 w-20 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
                type="button"
                onClick={submitHandler}
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default BookingForm;
