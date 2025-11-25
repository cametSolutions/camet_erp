import { useEffect, useState, useRef } from "react";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import TitleDiv from "@/components/common/TitleDiv";
import BookingForm from "../Components/BookingForm";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import api from "@/api/api";
import useFetch from "@/customHook/useFetch";

function EditChecking() {
  const isSubmittingRef = useRef(false);
  const location = useLocation();
  const editData = location?.state;
  const isTariffRateChange = location?.state?.fromDashboard === true;
const roomIdToEdit = location?.state?.roomId; 
console.log("h")
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [outStanding, setOutStanding] = useState([]);

  const { data, loading: advanceLoading } = useFetch(
    `/api/sUsers/getBookingAdvanceData/${editData?._id}?type=${"EditChecking"}`
  );

  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );

  useEffect(() => {
    if (data) {
      setOutStanding(data?.data);
    }
  }, [data]);

  useEffect(() => {
    if (editData) {
      editData.previousAdvance = Number(editData?.bookingId?.advanceAmount || 0);
      editData.totalAdvance =
        Number(editData?.bookingId?.advanceAmount || 0) +
        Number(editData?.advanceAmount || 0);
    }
  }, [editData]);

  const handleSubmit = async (payload, paymentData) => {
    try {
console.log(payload)

      const response = await api.put(
        `/api/sUsers/updateRoomBooking/${editData._id}`,
        {
          data: payload,
          modal: "checkIn",
          paymentData: paymentData,
          orgId: organization._id,
          isTariffRateChange: isTariffRateChange, // ✅ Pass flag
          roomIdToEdit: roomIdToEdit,
        },
        { withCredentials: true }
      );
      if (response?.data?.success) {
        toast.success(isTariffRateChange 
            ? `Room tariff updated successfully. ${response.data.roomsCount} room(s) in check-in.`
            : response?.data?.message
        );
        navigate("/sUsers/checkInList");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    }
       finally {
    // Reset the submitting flag
    isSubmittingRef.current = false;
  }
  };

  return (
    <>
      {loading && advanceLoading ? (
        <CustomBarLoader />
      ) : (
        <div>
          <TitleDiv
            title={isTariffRateChange ? "Edit Tariff Rate" : "Edit Checking"}
            from="/sUsers/hotelDashBoard"
            dropdownContents={
              !isTariffRateChange
                ? [
                    {
                      title: "New Guest",
                      onClick: () => navigate("sUsers/partyList"),
                    },
                  ]
                : []
            }
          />
          <BookingForm
            handleSubmit={handleSubmit}
            setIsLoading={setLoading}
            editData={editData}
            isSubmittingRef={isSubmittingRef}
            // isFor={"deliveryNote"}
            outStanding={outStanding}
            isTariffRateChange={isTariffRateChange}
             roomId={roomIdToEdit}
          />
        </div>
      )}
    </>
  );
}

export default EditChecking;