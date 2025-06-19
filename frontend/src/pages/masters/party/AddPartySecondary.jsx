import { toast } from "react-toastify";
import api from "../../../api/api";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AddPartyForm from "./AddPartyForm";
import { useDispatch, useSelector } from "react-redux";
import TitleDiv from "@/components/common/TitleDiv";
import { useState } from "react";
import { addParty as addPartyInCommonVouchers } from "../../../../slices/voucherSlices/commonVoucherSlice";
import { addParty as addPartyInAccountingVouchers } from "../../../../slices/voucherSlices/commonAccountingVoucherSlice";

function AddPartySecondary() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const from = location.state?.from;

  console.log("AddPartySecondary location state:", location.state);

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
      console.log("AddPartySecondary response:", res?.data?.result);

      console.log(from);

      if (from) {
        if (from === "accountingVoucher") {
          dispatch(addPartyInAccountingVouchers(res.data.result));
        } else if (from === "commonVoucher") {
          dispatch(addPartyInCommonVouchers(res.data.result));
        }
        navigate(-2, { replace: true });
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

  return (
    <div className=" ">
      <TitleDiv
        title={"Add Party"}
        from="/sUsers/partylist"
        loading={loading}
      />

      <AddPartyForm
        submitHandler={submitHandler}
        userType="secondary"
        loading={loading}
        setLoading={setLoading}
      />
    </div>
  );
}

export default AddPartySecondary;
