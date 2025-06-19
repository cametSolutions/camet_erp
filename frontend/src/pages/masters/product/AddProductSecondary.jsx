/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-no-target-blank */
import { useSelector } from "react-redux";
import api from "../../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AddProductForm from "./AddProductsForm";
import TitleDiv from "@/components/common/TitleDiv";
import { useEffect, useState } from "react";

function AddProductSecondary() {
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    product_name: "",
    product_code: "",
    unit: "",
    altUnit: "",
    balance_stock: "",
    alt_unit_conversion: "",
    unit_conversion: "",
    hsn_code: "",
    cgst: 0,
    sgst: 0,
    igst: 0,
    cess: 0,
    addl_cess: 0,
    purchase_price: "",
    purchase_cost: "",
    item_mrp: 0,
    selectedBrand: null,
    selectedCategory: null,
    selectedSubcategory: null,
    batchEnabled: false,
  });

  useEffect(() => {
    const tempProductData = localStorage.getItem("tempProductData");
    if (tempProductData) {
      setFormState(JSON.parse(tempProductData));
    }
  }, []);

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
      localStorage.removeItem("tempProductData");
      setLoading(false);
    }
  };

  /// before navigating back, we remove the temporary product data from localStorage

  const customNavigate = () => {
    localStorage.removeItem("tempProductData");
    navigate(-1);
  };

  return (
    <div className="flex-1">
      <TitleDiv
        title="Add Product"
        loading={loading}
        dropdownContents={[
          {
            title: "Add Hsn",
            to: "/sUsers/hsn",
            data: formState,
            savingName: "tempProductData",
            from: "/sUsers/addProduct",
          },
        ]}
        customNavigate={customNavigate}
      />
      <AddProductForm
        formState={formState}
        setFormState={setFormState}
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
