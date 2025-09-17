import api from "../../../api/api";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import SecUserCreationForm from "../../../components/common/Forms/SecUserCreationForm";
import { useDispatch } from "react-redux";
import { refreshCompanies } from "../../../../slices/secSelectedOrgSlice";

function EditSecUsers() {
  const navigate = useNavigate();

  const { id } = useParams();
  const dispatch = useDispatch();

  const currentSecondaryUserId = JSON.parse(
    localStorage.getItem("sUserData")
  )._id;
  const isCurrentUser = currentSecondaryUserId === id;

  const submitHandler = async (formData) => {
    const { name, email, mobile, password, selectedOrg } = formData;

    const postData = {
      name,
      email,
      mobile,
      password,
      organization: selectedOrg,
    };

    try {
      const res = await api.put(`/api/sUsers/editSecUSer/${id}`, postData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (isCurrentUser) {
        dispatch(refreshCompanies());
      }

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
