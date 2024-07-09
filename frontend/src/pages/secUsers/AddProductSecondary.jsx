/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-no-target-blank */

import { useSelector } from "react-redux";
import api from "../../api/api";

import { toast } from "react-toastify";

import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate,Link } from "react-router-dom";
import AddProductForm from "../../components/common/Forms/AddProductForm";

function AddProductSecondary() {
  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
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
      navigate("/sUsers/productList");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return (
   
      <div className="flex-1">
        <div className="bg-[#012A4A] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
          <Link to={"/sUsers/productList"}>
            <IoIosArrowRoundBack className="block md:hidden text-3xl" />
          </Link>
          <p>Add Product</p>
        </div>
        <AddProductForm orgId={orgId} submitData={submitHandler} userType="secondaryUser" />
      </div>
  );
}

export default AddProductSecondary;
