/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-no-target-blank */
import { useSelector } from "react-redux";
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AddProductForm from "../../components/common/Forms/AddProductsForm";
import TitleDiv from "@/components/common/TitleDiv";
import { useState } from "react";

function AddProductSecondary() {
  const [loading, setLoading] = useState(false);

  const { _id: orgId } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const navigate = useNavigate();

  const submitHandler = async (formData) => {
    try {
      setLoading(true);
      const res = await api.post("/api/sUsers/addProduct", formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
      navigate(-1);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1">
      <TitleDiv
        title="Add Product"
        from="/sUsers/productList"
        loading={loading}
      />
      <AddProductForm
        orgId={orgId}
        submitData={submitHandler}
        userType="secondaryUser"
        setLoading={setLoading}
        loading={loading}
      />
    </div>
  );
}

export default AddProductSecondary;
