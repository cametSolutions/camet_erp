import { useState , useRef} from "react";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import TitleDiv from "@/components/common/TitleDiv";
import BookingForm from "../Components/BookingForm";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "@/api/api";

function BookingPage() {
  const isSubmittingRef = useRef(false);
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const handleSubmit = async (data) => {
    try {
      let response = await api.post(
        `/api/sUsers/saveData/${organization._id}`,
        {data: data, modal:"bookingPage"},
        { withCredentials: true }
      );
      if (response?.data?.success) {
        toast.success(response?.data?.message);
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
            title="Room Booking"
            from="/sUsers/hotelDashBoard"
            dropdownContents={[
            {
             title: "New Guest",
              to: "/sUsers/addParty",
              from:"/sUsers/bookingPage"
            },
            {
              title: "Booking List",
              to: "/sUsers/bookingList",
            },
          ]}
          />
          <BookingForm handleSubmit={handleSubmit} setIsLoading={setLoading} isSubmittingRef={isSubmittingRef} isFor="saleOrder" />
        </div>
      )}
    </>
  );
}

export default BookingPage;
