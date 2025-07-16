import { useState } from "react";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import TitleDiv from "@/components/common/TitleDiv";
import BookingForm from "../Components/BookingForm";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "@/api/api";
function BookingPage() {
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const handleSubmit = async (data) => {
    console.log(data);
    try {
      let response = await api.post(
        `/api/sUsers/roomBooking/${organization._id}`,
        data,
        { withCredentials: true }
      );
      if (response?.data?.success) {
        toast.success(response?.data?.message);
        navigate("/sUsers/hotelDashBoard");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
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
                onClick: () => {
                  navigate("sUsers/partyList");
                },
              },
            ]}
          />
          <BookingForm handleSubmit={handleSubmit} setIsLoading={setLoading} />
        </div>
      )}
    </>
  );
}

export default BookingPage;
