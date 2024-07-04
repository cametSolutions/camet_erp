/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-no-target-blank */

import Sidebar from "../../components/homePage/Sidebar";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";

import { toast } from "react-toastify";

import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, Link, useParams } from "react-router-dom";
import AddProductForm from "../../components/common/Forms/AddProductForm";

function EditProduct() {
  const { id } = useParams();

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [altUnit, setAltUnit] = useState("");
  const [product_name, setProduct_name] = useState("");
  const [product_code, setProduct_code] = useState("");
  const [balance_stock, setBalance_stock] = useState("");
  const [alt_unit_conversion, setAlt_unit_conversion] = useState("");
  const [unit_conversion, setUnit_conversion] = useState("");
  const [hsn_code, setHsn_code] = useState("");
  const [purchase_price, setPurchase_price] = useState("");
  const [purchase_stock, set_Purchase_stock] = useState("");



  const [productData, setProductData] = useState({})


  ///////////// levelname table ///////////////////

  const [rows, setRows] = useState([
    { id: Math.random(), pricelevel: "", pricerate: "" },
  ]);
  const [levelNameData, setLevelNameData] = useState([]);

  useEffect(() => {
    // Update levelNameData whenever rows change
    setLevelNameData(
      rows.map((row) => ({
        pricelevel: row.pricelevel,
        pricerate: row.pricerate,
      }))
    );
  }, [rows]);

  ///////////// location table ///////////////////

  const [locationRows, setLocationRows] = useState([
    { id: Math.random(), godown: "", balance_stock: "" },
  ]);
  const [locationData, setLocationData] = useState([]);

  useEffect(() => {
    // Update levelNameData whenever rows change
    setLocationData(
      locationRows.map((row) => ({
        godown: row.godown,
        balance_stock: row.balance_stock,
      }))
    );
  }, [locationRows]);

  ////////////////////////treble enddddd///////////////////////////////////////////////////////////

  const orgId = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );





  ////fetching data for edit
  useEffect(() => {
    const getProductDetails = async () => {
      try {
        const res = await api.get(`/api/pUsers/productDetails/${id}`, {
          withCredentials: true,
        });

       

        setProductData(res.data.data)

      } catch (error) {
        console.log(error);
      }
    };
    getProductDetails();
  }, []);

  const navigate = useNavigate();

  console.log(productData);

  const submitHandler = async (formData) => {
   

  

    console.log(formData);
    try {
      const res = await api.post(`/api/pUsers/editProduct/${id}`, formData, {
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
          <p>Edit Product</p>
        </div>
        <AddProductForm orgId={orgId} submitData={submitHandler} productData={productData} />
      </div>
    </div>
  );
}

export default EditProduct;
