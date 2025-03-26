/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-no-target-blank */

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import AddProductForm from "../../components/common/Forms/AddProductsForm";
import TitleDiv from "@/components/common/TitleDiv";

function EditProductSecondary() {
  const { id } = useParams();
  const [productData, setProductData] = useState({});
  const [loading, setLoading] = useState(false);

  const { _id: orgId } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  ////fetching data for edit
  useEffect(() => {
    const getProductDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/sUsers/productDetails/${id}`, {
          withCredentials: true,
        });

        setProductData(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getProductDetails();
  }, [id]);

  const navigate = useNavigate();

  const submitHandler = async (formData) => {
    try {
      setLoading(true);
      const res = await api.post(`/api/sUsers/editProduct/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
      navigate("/sUsers/productList", { replace: true });
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
        title="Edit Product"
        from="/sUsers/productList"
        loading={loading}
      />
      <AddProductForm
        orgId={orgId}
        submitData={submitHandler}
        productData={productData}
        userType="secondaryUser"
        loading={loading}
        setLoading={setLoading}
      />
    </div>
  );
}

export default EditProductSecondary;
