import api from "../../api/api";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import SecUserCreationForm from "../../components/common/Forms/SecUserCreationForm";

function EditSecUsers() {
  const navigate = useNavigate();

  const { id } = useParams();

  const submitHandler = async (formData) => {
    const { name, email, mobile, password, selectedOrg } = formData;

    const postData = {
      name,
      email,
      mobile,
      password,
      organization: selectedOrg,
    };

    console.log("formData edit", formData);

    try {
      const res = await api.put(`/api/sUsers/editSecUSer/${id}`, postData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
      navigate("/sUsers/retailers");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return <SecUserCreationForm submitHandler={submitHandler} tab="edit" />;
}

export default EditSecUsers;
