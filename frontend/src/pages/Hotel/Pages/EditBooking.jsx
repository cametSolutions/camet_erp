import { useEffect, useState ,useRef} from "react";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import TitleDiv from "@/components/common/TitleDiv";
import BookingForm from "../Components/BookingForm";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "@/api/api";
import { useLocation } from "react-router-dom";
import useFetch from "@/customHook/useFetch";
function EditBooking() {
  const isSubmittingRef = useRef(false);
  const location = useLocation();
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );
  const editingData = location?.state;
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(editingData);
  const navigate = useNavigate();
  useEffect(() => {
    if(editingData){
      setEditData(editingData)
    }
  },[editingData])
  const { data, loading: advanceLoading } = useFetch(
    `/api/sUsers/getBookingAdvanceData/${editData._id}`    
  );

  useEffect(() => {
    if (data) {
      let totalAdvance = data?.data?.reduce((acc, curr) => {
        return curr?.source == "Booking" && acc + Number(curr.bill_amount || 0);
      }, 0);
      if (totalAdvance > 0) {
        setEditData((prev) => ({
          ...prev,
          totalAdvance: totalAdvance,
          advanceAmount: totalAdvance
        }))
    }
    }
  }, [data]);

  const handleSubmit = async (data) => {
    try {
      let response = await api.put(
        `/api/sUsers/updateRoomBooking/${editData._id}`,
        {data:data, modal:"Booking"},
        { withCredentials: true }
      );
      if (response?.data?.success) {
        toast.success(response?.data?.message);
        navigate("/sUsers/bookingList");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  console.log(editData?.bookingId)

  return (
    <>
      {loading && advanceLoading ? (
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
          <BookingForm
            handleSubmit={handleSubmit}
            setIsLoading={setLoading}
            editData={editData}
            isSubmittingRef={isSubmittingRef}
          />
        </div>
      )}
    </>
  );
}

export default EditBooking;
