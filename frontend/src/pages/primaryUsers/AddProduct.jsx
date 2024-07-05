/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-no-target-blank */

import Sidebar from "../../components/homePage/Sidebar";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { toast } from "react-toastify";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, Link } from "react-router-dom";
import AddProductForm from "../../components/common/Forms/AddProductForm";

function AddProduct() {


  const orgId = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );
  

  const navigate = useNavigate();

  const submitHandler = async (formData) => {

    console.log(formData);
   
    try {
      const res = await api.post("/api/pUsers/addProduct", formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log(res.data);
      toast.success(res.data.message);
      navigate("/pUsers/productList");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  // const navigate=useNavigate()

  return (
    <div className="flex ">
      <div>
        <Sidebar TAB={"product"} />
      </div>
      <div className="flex-1 h-screen overflow-y-scroll">
        <div className="bg-[#012A4A] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
          <Link to={"/pUsers/productList"}>
            <IoIosArrowRoundBack className="block md:hidden text-3xl" />
          </Link>
          <p>Add Product</p>
        </div>
     <AddProductForm orgId={orgId}  submitData={submitHandler}/>
      </div>
    </div>
  );
}

export default AddProduct;
