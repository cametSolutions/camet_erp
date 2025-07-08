import { useState } from "react";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import TitleDiv from "@/components/common/TitleDiv";
import BookingForm from "../Components/BookingForm";

function BookingPage() {
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {};
  return (
    <>
      {loading ? (
        <CustomBarLoader />
      ) : (
        <div className="">
          <TitleDiv
            title="Add Room"
            from="/sUsers/hotelDashBoard"
          />
          <BookingForm />
        </div>
      )}
    </>
  );
}

export default BookingPage;
