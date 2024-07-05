/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-no-target-blank */

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { toast } from "react-toastify";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, Link, useParams } from "react-router-dom";
import SidebarSec from "../../components/secUsers/SidebarSec";
import AddProductForm from "../../components/common/Forms/AddProductForm";

function EditProductSecondary() {
  const { id } = useParams();
  const [productData, setProductData] = useState({});

  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  ////fetching data for edit
  useEffect(() => {
    const getProductDetails = async () => {
      try {
        const res = await api.get(`/api/sUsers/productDetails/${id}`, {
          withCredentials: true,
        });

        setProductData(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    getProductDetails();
  }, [id]);

  const navigate = useNavigate();

  const submitHandler = async (formData) => {
    try {
      const res = await api.post(`/api/sUsers/editProduct/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log(res.data);
      toast.success(res.data.message);
      navigate("/sUsers/productList");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return (
    <div className="flex ">
      <div>
        <SidebarSec />
      </div>
      <div className="flex-1 h-screen overflow-y-scroll">
        <div className="bg-[#012A4A] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
          <Link to={"/sUsers/productList"}>
            <IoIosArrowRoundBack className="block md:hidden text-3xl" />
          </Link>
          <p>Edit Product</p>
        </div>
        <AddProductForm
          orgId={orgId}
          submitData={submitHandler}
          productData={productData}
        />
      </div>
    </div>
  );
}

export default EditProductSecondary;
