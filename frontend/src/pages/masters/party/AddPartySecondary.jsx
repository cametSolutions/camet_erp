import { toast } from "sonner";
import api from "../../../api/api";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AddPartyForm from "./AddPartyForm";
import { useDispatch, useSelector } from "react-redux";
import TitleDiv from "@/components/common/TitleDiv";
import { useState } from "react";
import { addParty as addPartyInCommonVouchers } from "../../../../slices/voucherSlices/commonVoucherSlice";
import { addParty as addPartyInAccountingVouchers } from "../../../../slices/voucherSlices/commonAccountingVoucherSlice";
import { useQueryClient } from "@tanstack/react-query";

function AddPartySecondary() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const from = location.state?.from;
console.log(from);
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
      queryClient.invalidateQueries({
        queryKey: ["dashboardCounts", companyId],
      });

      if (from) {
        if(from == "/sUsers/bookingPage"){
          navigate("/sUsers/bookingPage", { replace: true });
          return
        }
         if(from == "/sUsers/checkInPage"){
          navigate("/sUsers/bookingPage", { replace: true });
          return
        }

        if (from === "accountingVoucher") {
          dispatch(addPartyInAccountingVouchers(res.data.result));
        } else if (from === "commonVoucher") {
          dispatch(addPartyInCommonVouchers(res.data.result));
        }
        navigate(-2, { replace: true });
      } else {
        navigate("/sUsers/partylist", { replace: true });
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
        from={from}
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
