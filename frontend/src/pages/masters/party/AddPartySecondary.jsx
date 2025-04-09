import { toast } from "react-toastify";
import api from "../../../api/api";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AddPartyForm from "./AddPartyForm";
import { useSelector } from "react-redux";
import TitleDiv from "@/components/common/TitleDiv";
import { useState } from "react";

function AddPartySecondary() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;

  const companyId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const submitHandler = async (formData) => {
    formData.cpm_id = companyId;

    try {
      setLoading(true);
      const res = await api.post("/api/sUsers/addParty", formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate("/sUsers/partylist");
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  console.log(loading);
  

  return (
    <div className=" ">
      <TitleDiv title={"Add Party"} from="/sUsers/partylist" loading={loading} />

      <AddPartyForm submitHandler={submitHandler} userType="secondary"  loading={loading} setLoading={setLoading} />
    </div>
  );
}

export default AddPartySecondary;
