import { toast } from "react-toastify";
import api from "../../api/api";
import { IoIosArrowRoundBack } from "react-icons/io";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AddPartyForm from "../../components/common/Forms/AddPartyForm";
import { useSelector } from "react-redux";

function AddPartySecondary() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;


  const companyId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const submitHandler = async (formData) => {
    formData.cpm_id = companyId;
    // console.log(formData);

    try {
      const res = await api.post("/api/sUsers/addParty", formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
      if (from) {
        navigate(from,{replace:true});
      } else {
        navigate("/sUsers/partylist");
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return (
    <div className=" ">
      <div className="bg-[#012A4A] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
        <Link to={-1}>
          <IoIosArrowRoundBack className="block  text-3xl" />
        </Link>
        <p>Add Party Details </p>
      </div>

      <AddPartyForm submitHandler={submitHandler}   userType ="secondary"/>
    </div>
  );
}

export default AddPartySecondary;
