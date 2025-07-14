import {useState} from "react";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import TitleDiv from "@/components/common/TitleDiv";
import CheckOutForm from "../Components/CheckOutForm";

function CheckOut() {
    const [loading, setLoading] = useState(false);
    const handleSubmit = async () => {};
    return (
        <>
            {loading ? (
                <CustomBarLoader />
            ) : (
                <div className="">
                    <TitleDiv
                        title="Check Out"
                        from="/sUsers/hotelDashBoard"
                    />
                    <CheckOutForm />
                </div>
            )}
        </>
    );
}
 export default CheckOut;