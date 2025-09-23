import React, { useState, useCallback, useEffect } from "react";
import RoomRegisterComponent from "../Components/RoomRegisterComponent";
import api from "@/api/api";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import { useNavigate } from "react-router-dom";
import TitleDiv from "@/components/common/TitleDiv";
function RoomRegistration() {
  const navigate = useNavigate();
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
      await api.post(
        `/api/sUsers/addRoom/${orgId}`,
        {
          formData,
          tableData,
        },
        {
          withCredentials: true,
        }
      );
      toast.success("Room Added Successfully");
      navigate("/sUsers/roomList");
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
            title="Add Room"
            from="/sUsers/roomList"
          />
          <RoomRegisterComponent
            pageName="Room Registration"
            optionsData={optionData}
            sendToParent={handleSubmit}
          />
        </div>
      )}
    </>
  );
}

export default RoomRegistration;
