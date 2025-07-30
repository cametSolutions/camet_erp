import { useState, useRef } from "react";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import TitleDiv from "@/components/common/TitleDiv";
import BookingForm from "../Components/BookingForm";
import { toast } from "react-toastify";
import api from "@/api/api";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function CheckInPage() {
  const navigate = useNavigate();
  const isSubmittingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );
  const handleSubmit = async (data) => {
    try {
      let response = await api.post(
        `/api/sUsers/saveData/${organization._id}`,
        { data: data, modal: "checkIn" },
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
          />
        </div>
      )}
    </>
  );
}
export default CheckInPage;
