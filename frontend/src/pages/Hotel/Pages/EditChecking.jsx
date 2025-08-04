import { useEffect, useState, useRef } from "react";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import TitleDiv from "@/components/common/TitleDiv";
import BookingForm from "../Components/BookingForm";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import api from "@/api/api";
import { useLocation } from "react-router-dom";
function EditChecking() {
  const isSubmittingRef = useRef(false);
  const location = useLocation();
  const editData = location?.state;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    if (editData) {
      editData.previousAdvance = Number(
        editData?.bookingId?.advanceAmount || 0
      );
      editData.totalAdvance =
        Number(editData?.bookingId?.advanceAmount || 0) +
        Number(editData?.advanceAmount || 0);
    }
  }, [editData]);


  const handleSubmit = async (data) => {
    console.log(data)
    try {
      let response = await api.put(
        `/api/sUsers/updateRoomBooking/${editData._id}`,
        {data : data, modal:"checkIn"},
        { withCredentials: true }
      );
      if (response?.data?.success) {
        toast.success(response?.data?.message);
        navigate("/sUsers/checkInList");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  return (
    <>
      {loading && advanceLoading ? (
        <CustomBarLoader />
      ) : (
        <div className="">
          <TitleDiv
            title="Edit Checking"
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
          <BookingForm
            handleSubmit={handleSubmit}
            setIsLoading={setLoading}
            editData={editData}
            isSubmittingRef={isSubmittingRef}
            isFor={"deliveryNote"}
          />
        </div>
      )}
    </>
  );
}

export default EditChecking;
