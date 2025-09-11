import { useEffect, useState, useRef } from "react";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import TitleDiv from "@/components/common/TitleDiv";
import BookingForm from "../Components/BookingForm";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "@/api/api";
import { useLocation } from "react-router-dom";
import useFetch from "@/customHook/useFetch";
function EditCheckOut() {
  const isSubmittingRef = useRef(false);
  const location = useLocation();
  const editData = location?.state;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [outStanding, setOutStanding] = useState([]);
  
  const { data, loading: advanceLoading } = useFetch(
    `/api/sUsers/getBookingAdvanceData/${editData?._id}?type=${"EditCheckOut"}`
  );

  useEffect(() => {
    if (data) {
      console.log(data?.data);
      setOutStanding(data?.data);
    }
  }, [data]);

  useEffect(() => {
    if (editData) {
      editData.previousAdvance = Math.abs(
        Number(editData?.checkInId?.grandTotal) -
          (Number(editData?.checkInId?.balanceToPay) +
            Number(editData?.checkInId?.discountAmount))
      );
      editData.totalAdvance = editData?.previousAdvance;
    }

    console.log(editData?.previousAdvance);
  }, [editData]);

  const handleSubmit = async (data) => {
    console.log(data);
    try {
      let response = await api.put(
        `/api/sUsers/updateRoomBooking/${editData._id}`,
        { data: data, modal: "checkOut" },
        { withCredentials: true }
      );
      if (response?.data?.success) {
        toast.success(response?.data?.message);
        navigate("/sUsers/checkOutList");
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
            title="Edit CheckOut"
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
            outStanding={outStanding}
          />
        </div>
      )}
    </>
  );
}

export default EditCheckOut;
