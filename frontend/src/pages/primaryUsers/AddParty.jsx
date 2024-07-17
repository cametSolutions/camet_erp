import { toast } from "react-toastify";
import api from "../../api/api";
import { IoIosArrowRoundBack } from "react-icons/io";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AddPartyForm from "../../components/common/Forms/AddPartyForm";

function AddParty() {
  const navigate = useNavigate();

  const submitHandler = async (formData) => {
    console.log(formData);

    try {
      const res = await api.post("/api/pUsers/addParty", formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
      navigate("/pUsers/partylist");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return (
    <div className="flex-1 flex flex-col ">
      <div className="bg-[#012A4A] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
        <Link to={"/pUsers/partyList"}>
          <IoIosArrowRoundBack className="block md:hidden text-3xl" />
        </Link>
        <p>Add Customers Details </p>
      </div>

      <AddPartyForm submitHandler={submitHandler} />
    </div>
  );
}

export default AddParty;
