import { useState, useRef, useEffect } from "react";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import TitleDiv from "@/components/common/TitleDiv";
import BookingForm from "../Components/BookingForm";
import { toast } from "react-toastify";
import api from "@/api/api";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import useFetch from "@/customHook/useFetch";
function CheckOut() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location?.state?.bookingData;
  const [outStanding, setOutStanding] = useState([]);
  const isSubmittingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );

  console.log(bookingData?.checkInId)

  const { data, loading: advanceLoading } = useFetch(
`/api/sUsers/getBookingAdvanceData/${bookingData?._id}?type=${"EditChecking"}`

  );

  useEffect(() => {
    if (data) {
      console.log(data?.data);
      setOutStanding(data?.data);
    }
  }, [data]);

  useEffect(() => {
    if (bookingData) {
      console.log(bookingData?.advanceAmount);

      bookingData.previousAdvance =
        Number(bookingData?.advanceAmount || 0) +
        Number(bookingData?.bookingId?.advanceAmount || 0);
      bookingData.totalAdvance =
        Number(bookingData?.advanceAmount || 0) +
        Number(bookingData?.bookingId?.advanceAmount || 0);
      bookingData.advanceAmount = 0;
    }
  }, [bookingData]);

  const handleSubmit = async (data) => {
    let updatedData = {
      ...data,
      bookingId: bookingData?.bookingDataId?._id,
      checkInId: bookingData?._id,
    };

    console.log(updatedData);
    try {
      let response = await api.post(
        `/api/sUsers/saveData/${organization._id}`,
        { data: updatedData, modal: "checkOut" },
        { withCredentials: true }
      );
      if (response?.data?.success) {
        toast.success("Check Out Saved Successfully");
        navigate("/sUsers/checkOutList");
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
            title="Check Out Page"
            from="/sUsers/hotelDashBoard"
            dropdownContents={[
              {
                title: "New Guest",
                to: "/sUsers/partyList",
              },
              {
                title: "Check In List",
                to: "/sUsers/checkOutList",
              },
            ]}
          />
          <BookingForm
            handleSubmit={handleSubmit}
            setIsLoading={setLoading}
            editData={bookingData}
            isSubmittingRef={isSubmittingRef}
            isFor="sales"
            outStanding={outStanding}
          />
        </div>
      )}
    </>
  );
}
export default CheckOut;
