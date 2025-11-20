import { useState, useRef } from "react";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import TitleDiv from "@/components/common/TitleDiv";
import BookingForm from "../Components/BookingForm";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import api from "@/api/api";
import { useQueryClient } from "@tanstack/react-query";
function BookingPage() {
  const location = useLocation();
console.log(location)
  const isSubmittingRef = useRef(false);
  const roomId = location?.state?.roomId;
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );
  const [loading, setLoading] = useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handleSubmit = async (data, paymentData) => {
  
    try {
      let response = await api.post(
        `/api/sUsers/saveData/${organization._id}`,
        { data: data, modal: "bookingPage", paymentData: paymentData },
        { withCredentials: true }
      );
      if (response?.data?.success) {
        toast.success(response?.data?.message);
        queryClient.invalidateQueries({
        queryKey: ["todaysTransaction", organization._id, false],
      });
        navigate("/sUsers/bookingList");
      }
      isSubmittingRef.current = false;
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
      isSubmittingRef.current = false;
    } finally {
      setSubmitLoader(false);
    }
  };
  return (
    <>
      {loading ? (
        <CustomBarLoader />
      ) : (
        <div className="">
          <TitleDiv
            title="Room Booking"
            from="/sUsers/hotelDashBoard"
            dropdownContents={[
              {
                title: "New Guest",
                to: "/sUsers/addParty",
                from: "/sUsers/bookingPage",
              },
              {
                title: "Booking List",
                to: "/sUsers/bookingList",
              },
            ]}
          />
          <BookingForm
            handleSubmit={handleSubmit}
            setIsLoading={setLoading}
            isSubmittingRef={isSubmittingRef}
            isFor="saleOrder"
            roomId={roomId}
            submitLoader={submitLoader}
          />
        </div>
      )}
    </>
  );
}

export default BookingPage;
