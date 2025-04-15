// import Sidebar from "../../components/homePage/Sidebar";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../../api/api";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AddPartyForm from "./AddPartyForm";
import TitleDiv from "@/components/common/TitleDiv";
// import SidebarSec from "../../components/secUsers/SidebarSec";

function EditPartySecondary() {
  const [partyDetails, setPartyDetails] = useState({});
  const [loading, setLoading] = useState(false);

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

        setPartyDetails(res?.data?.data);
      } catch (error) {
        console.log(error);
      }
    };

    getSinglePartyDetails();
  }, []);

  const submitHandler = async (formData) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const accountGroupName = partyDetails?.accountGroup?.accountGroup;
  /// don't allow edit if account group is other than sundry debtor or creditor
  const allowEditing =
    accountGroupName === "Sundry Debtors" ||
    accountGroupName === "Sundry Creditors";

  return (
    <div className="">
      <TitleDiv
        title={"Edit Party"}
        from="/sUsers/partylist"
        loading={loading}
      />
      <AddPartyForm
        submitHandler={submitHandler}
        partyDetails={partyDetails}
        userType="secondary"
        loading={loading}
        setLoading={setLoading}
        allowEditing={allowEditing}
      />
    </div>
  );
}

export default EditPartySecondary;
