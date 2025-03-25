/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-no-target-blank */
import { useSelector } from "react-redux";
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AddProductForm from "../../components/common/Forms/AddProductsForm2";
import TitleDiv from "@/components/common/TitleDiv";

function AddProductSecondary() {

  const {_id:orgId, batchEnabled:isBatchEnabledInCompany} = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const navigate = useNavigate();


  const submitHandler = async (formData) => {
    try {
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
    }
  };

  return (
    <div className="flex-1">


      <TitleDiv title="Add Product" from="/sUsers/productList"/>
      <AddProductForm
        orgId={orgId}
        submitData={submitHandler}
        userType="secondaryUser"
        isBatchEnabledInCompany={isBatchEnabledInCompany}
      />
    </div>
  );
}

export default AddProductSecondary;
