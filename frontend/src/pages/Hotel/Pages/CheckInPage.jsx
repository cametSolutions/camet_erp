import {useState} from "react";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import TitleDiv from "@/components/common/TitleDiv";
import CheckinForm from "../Components/CheckinForm";

function CheckInPage() {
    const [loading, setLoading] = useState(false);
    const handleSubmit = async () => {};
    return (
        <>
            {loading ? (
                <CustomBarLoader />
            ) : (
                <div className="">
                    <TitleDiv
                        title="Check In"
                        from="/sUsers/hotelDashBoard"
                    />
                    <CheckinForm />
                </div>
            )}
        </>
    );
}
 export default CheckInPage