import TitleDiv from "@/components/common/TitleDiv";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import RoomSubDetailsManagement from "../Components/RoomSubDetailsManagement";
import { toast } from "react-toastify";
import api from "@/api/api";
import useFetch from "@/customHook/useFetch";
import Swal from "sweetalert2";
function AddAdditionalPax() {
  const [loading, setLoading] = useState(false);
  const [additionalPaxData, setAdditionalPaxData] = useState([]);
  let organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );

  const { data, error, refreshHook } = useFetch(
    `/api/sUsers/getAdditionalPax/${organization._id}`
  );
  useEffect(() => {
    if (data) {
      setAdditionalPaxData(data?.data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  }, [error]);

  const handleLoader = (data) => {
    setLoading(data);
  };
  const handleSubmit = async (isEdit, value, price , id) => {
    try {
      setLoading(true);
      handleLoader(true);

      let res;
      if (isEdit) {
        res = await api.put(
          `/api/sUsers/updateAdditionalPax/${organization._id}`,
          {
            additionalPaxName: value,
            amount: price,
            additionalPaxId: id,

          },
          { withCredentials: true }
        );
      } else {
        res = await api.post(
          `/api/sUsers/saveAdditionalPax/${organization._id}`,
          {
            additionalPaxName: value,
            amount: price,

          },
          { withCredentials: true }
        );
      }
      toast.success(res.data.message);
      refreshHook();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete=async (id) => {
       try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete this Additional Pax. This action cannot be undone!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });
      if (result.isConfirmed) {
        setLoading(true);
        handleLoader(true);
        await api.delete(
          `/api/sUsers/deleteAdditionalPax/${organization._id}/${id}`,
          { withCredentials: true }
        );
        Swal.fire("Deleted!", `The Additional Pax has been deleted.`, "success");
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "An error occurred while deleting",
        "error"
      );
    } finally {
      setLoading(false);
      refreshHook();
    }
  }



  return (
    <div className="flex h-screen overflow-y-hidden ">
      <div className="flex-1  ">
        <TitleDiv
          title={"Add additional pax"}
          from="/sUsers/stockItemSettings"
          loading={loading}
        />

        <RoomSubDetailsManagement
          tab={"Additional pax"}
          handleLoader={handleLoader}
          sendToParent={handleSubmit}
          displayData={additionalPaxData}
          loading={loading}
          handleDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default AddAdditionalPax;
