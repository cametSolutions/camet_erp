import React, { useState, useCallback, useEffect } from "react";
import ItemRegisterComponent from "../components/ItemRegisterComponent";
import api from "@/api/api";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import { useNavigate, useLocation } from "react-router-dom";
import TitleDiv from "@/components/common/TitleDiv";
function EditItem() {
  const location = useLocation();
  const navigate = useNavigate();
  let editData = location?.state
  const [loading, setLoading] = useState(false);
  const [optionData, setOptionsData] = useState({});

  const orgId = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg?._id
  );
  // Fetch all required data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);

      const subDetailsPromise = api.get(
        `/api/sUsers/getAllSubDetails/${orgId}`,
        {
          withCredentials: true,
        }
      );
      const hsnResPromise = api.get(`/api/sUsers/fetchHsn/${orgId}`, {
        withCredentials: true,
      });

      const [subDetailsRes, hsnRes] = await Promise.all([
        subDetailsPromise,
        hsnResPromise,
      ]);

      const { brands, categories, subcategories, priceLevels } =
        subDetailsRes.data.data;

      setOptionsData((prev) => ({
        ...prev,
        brand: brands,
        category: categories,
        subcategory: subcategories,
        priceLevel: priceLevels,
        hsn: hsnRes.data.data,
      }));
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleSubmit = async (formData, tableData) => {
    try {
    let url 
    if(editData){
      url = `/api/sUsers/editItem/${orgId}/${editData._id}`
    }else{
      url = `/api/sUsers/addItem/${orgId}`
    }
      await api.post(
       url,
        {
          formData,
          tableData,
        },
        {
          withCredentials: true,
        }
      );
      toast.success("item Added Successfully");
      navigate("/sUsers/itemList");
    } catch (error) {
      console.error("Failed to add room:", error);
      toast.error(error.response?.data?.message || "Failed to add room");
    }
  };

  return (
    <>
      {loading ? (
        <CustomBarLoader />
      ) : (
        <div className="">
          <TitleDiv
            loading={loading}
            title="Edit Item"
            from="/sUsers/itemList"
          />
          <ItemRegisterComponent
            pageName="Edit Item"
            optionsData={optionData}
            sendToParent={handleSubmit}
            editData={editData}
          />
        </div>
      )}
    </>
  );
}

export default EditItem;
