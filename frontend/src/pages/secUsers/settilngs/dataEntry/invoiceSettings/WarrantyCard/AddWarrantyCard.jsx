import TitleDiv from "@/components/common/TitleDiv";
import { WarrantyCardForm } from "./WarrantyCardForm ";
import api from "@/api/api";
import { toast } from "sonner";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function AddWarrantyCard() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const handleCreate = async (formData) => {

    try {
      setLoading(true);
      const res = await api.post(
        `/api/sUsers/createWarrantyCard/${cmp_id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success(res.data.message);
      navigate(-1,{replace:true});
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      localStorage.removeItem("tempProductData");
      setLoading(false);
    }
    // Your create API call here
  };
  return (
    <div>
      <TitleDiv title={"Add Warranty Card"} loading={loading} />
      <div className="p-5">
        <WarrantyCardForm onSubmit={handleCreate} isEditMode={false} loading={loading}/>
      </div>
    </div>
  );
}

export default AddWarrantyCard;
