// import Sidebar from "../../components/homePage/Sidebar";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { Link } from "react-router-dom";
import AddPartyForm from "../../components/common/Forms/AddPartyForm";
// import SidebarSec from "../../components/secUsers/SidebarSec";

function EditPartySecondary() {


  const [partyDetails, setPartyDetails] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const getSinglePartyDetails = async () => {
      try {
        const res = await api.get(`/api/sUsers/getSinglePartyDetails/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
     

        console.log(res.data);

        setPartyDetails(res?.data?.data);

      } catch (error) {
        console.log(error);
      }
    };

    getSinglePartyDetails();
  }, []);

  const submitHandler = async (formData) => {
   
    try {
      const res = await api.post(`/api/sUsers/editParty/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
      navigate("/sUsers/partylist");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return (
    <div className="">
      <div className="bg-[#012A4A] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
        <Link to={"/sUsers/partyList"}>
          <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer md:hidden" />
        </Link>
        <p>Edit Party Details </p>
      </div>
      <AddPartyForm submitHandler={submitHandler} partyDetails={partyDetails }  userType ="secondary" />
    </div>
  );
}

export default EditPartySecondary;
