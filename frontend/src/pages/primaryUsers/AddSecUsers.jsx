import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import SecUserCreationForm from "../../components/common/Forms/SecUserCreationForm";

function AddSecUsers() {
  const navigate = useNavigate();

  const submitHandler = async (formData) => {
    try {
      const res = await api.post("/api/pUsers/addSecUsers", formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
      navigate("/pUsers/retailers");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return <SecUserCreationForm submitHandler={submitHandler} />;
}

export default AddSecUsers;
