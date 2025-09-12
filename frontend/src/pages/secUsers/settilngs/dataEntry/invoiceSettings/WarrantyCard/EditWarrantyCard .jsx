import TitleDiv from "@/components/common/TitleDiv";
import { WarrantyCardForm } from "./WarrantyCardForm ";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import api from "@/api/api";
import { toast } from "sonner";

const EditWarrantyCard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const [loading, setLoading] = useState(false);
  const existingData = location?.state?.card || {};

  const handleUpdate = async (formData) => {
    try {
      setLoading(true);
      const res = await api.put(
        `/api/sUsers/updateWarrantyCard/${existingData._id}/${cmp_id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      toast.success(res.data.message);
      navigate(-1, { replace: true });
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
    <>
      <TitleDiv title="Edit Warranty Card"  loading={loading}/>
      <WarrantyCardForm
        initialData={existingData}
        onSubmit={handleUpdate}
        isEditMode={true}
        loading={loading}
      />
    </>
  );
};

export default EditWarrantyCard;
