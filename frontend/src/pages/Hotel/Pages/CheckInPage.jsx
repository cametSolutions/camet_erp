import { useState, useRef, useEffect } from "react";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import TitleDiv from "@/components/common/TitleDiv";
import BookingForm from "../Components/BookingForm";
import { toast } from "sonner";
import api from "@/api/api";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import useFetch from "@/customHook/useFetch";
function CheckInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location?.state?.bookingData;
  const isSubmittingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );
  useEffect(() => {
    if (bookingData) {
      bookingData.previousAdvance = Number(bookingData?.advanceAmount || 0);
      bookingData.totalAdvance = Number(bookingData?.advanceAmount || 0);
      bookingData.advanceAmount = 0;
    }
  }, [bookingData]);

  const handleSubmit = async (data) => {
    let updatedData;
    if (bookingData) {
      updatedData = { ...data, bookingId: bookingData._id };
    } else {
      updatedData = data;
    }

    console.log(updatedData._id);

    try {
      let response = await api.post(
        `/api/sUsers/saveData/${organization._id}`,
        { data: updatedData, modal: "checkIn" },
        { withCredentials: true }
      );
      if (response?.data?.success) {
        toast.success("Check In Successfully");
        navigate("/sUsers/hotelDashBoard");
      }
      isSubmittingRef.current = false;
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
      isSubmittingRef.current = false;
    }
  };

  return (
    <>
      {loading ? (
        <CustomBarLoader />
      ) : (
        <div className="">
          <TitleDiv
            title="Check In"
            from="/sUsers/hotelDashBoard"
            dropdownContents={[
              {
                title: "New Guest",
                to: "/sUsers/partyList",
              },
              {
                title: "Check In List",
                to: "/sUsers/checkInList",
              },
            ]}
          />
          <BookingForm
            handleSubmit={handleSubmit}
            setIsLoading={setLoading}
            isSubmittingRef={isSubmittingRef}
            isFor="deliveryNote"
            editData={bookingData}
          />
        </div>
      )}
    </>
  );
}
export default CheckInPage;
