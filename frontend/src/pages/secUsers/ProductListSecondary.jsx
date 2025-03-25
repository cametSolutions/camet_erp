/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";

import { FixedSizeList as List } from "react-window";
import { useSelector } from "react-redux";

import SearchBar from "../../components/common/SearchBar";
import { PiBarcode } from "react-icons/pi";
import BarcodeModal from "../../components/common/BarcodeModal";
import TitleDiv from "@/components/common/TitleDiv";

function ProductListSecondary() {
  const [products, setProducts] = useState([]);

  const [refresh, setRefresh] = useState(false);
  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [listHeight, setListHeight] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProductForPrint, setSelectedProductForPrint] = useState(null);

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );

  const searchData = (data) => {
    setSearch(data);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoader(true);
      try {
        const res = await api.get(`/api/sUsers/getProducts/${cmp_id}`, {
          withCredentials: true,
        });
        setLoader(true);

        setProducts(res.data.productData);
        // setProducts([]);
      } catch (error) {
        console.log(error);
      } finally {
        setLoader(false);
      }
    };
    fetchProducts();
  }, [refresh, cmp_id]);

  useEffect(() => {
    if (search === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((el) =>
        el.product_name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [search, products, refresh]);

  const handleDelete = async (id) => {
    // Show confirmation dialog
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    // If user confirms deletion
    if (confirmation.isConfirmed) {
      setLoader(true);
      try {
        const res = await api.delete(`/api/sUsers/deleteProduct/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        // Display success message
        await Swal.fire({
          title: "Deleted!",
          text: res.data.message,
          icon: "success",
          timer: 2000, // Auto close after 2 seconds
          timerProgressBar: true,
          showConfirmButton: false,
        });

        // Refresh the page
        setRefresh(!refresh);
      } catch (error) {
        toast.error(error.response.data.message);
        console.log(error);
      } finally {
        setLoader(false);
      }
    }
  };

  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 95;
      setListHeight(newHeight);
    };

    // Calculate the height on component mount and whenever the window is resized
    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  const handlePrint = (el) => {
    setOpenModal(true);
    setSelectedProductForPrint(el);
  };

  const Row = ({ index, style }) => {
    const el = filteredProducts[index];

    const adjustedStyle = {
      ...style,
      marginTop: "16px",
      height: "128px",
    };

    return (
      <>
        <div
          key={index}
          style={adjustedStyle}
          className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex flex-col  rounded-sm cursor-pointer hover:bg-slate-100    "
        >
          <div className="">
            <p className="font-bold text-sm">{el?.product_name}</p>
          </div>
          <hr className="mt-4" />
          <div className="flex justify-between items-center w-full gap-3 mt-4 text-sm  ">
            <div className="flex flex-col ">
              <div className=" flex   gap-2 text-sm ">
                <div className="flex gap-2 text-nowrap">
                  <p className=" text-gray-500 uppercase ">Hsn :</p>
                  <p className=" text-gray-500"> {el?.hsn_code}</p>
                </div>
                <div className="flex gap-2 ">
                  <p className=" text-gray-500">Tax :</p>
                  <p className=" text-gray-500"> {`${el?.igst} %`}</p>
                </div>
              </div>

              {el?.item_mrp && (
                <div className="flex gap-2 text-nowrap">
                  <p className=" text-gray-500 uppercase ">MRP :</p>
                  <p className=" text-gray-500"> {el?.item_mrp}</p>
                </div>
              )}
            </div>

            {/* buttons */}

            <div className="flex items-center ">
              <div
                className={`
                 ${type !== "self" ? "pointer-events-none opacity-50" : ""}  


              flex gap-3  px-4`}
              >
                <Link to={`/sUsers/editProduct/${el._id}`}>
                  <FaEdit className="text-blue-500" />
                </Link>

                <MdDelete
                  onClick={() => {
                    handleDelete(el._id);
                  }}
                  className="text-red-500"
                />
              </div>
              <PiBarcode onClick={() => handlePrint(el)} />
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <BarcodeModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        product={selectedProductForPrint}
      />
      <div className="flex-1 bg-slate-50  h-screen overflow-hidden  ">
        <div className="sticky top-0 z-20 ">
          <TitleDiv
            loading={loader}
            title="Your Products"
            dropdownContents={[
              {
                title: "Add Products",
                to: "/sUsers/addProduct",
              },
            ]}
          />

          <SearchBar onType={searchData} />
        </div>

        {/* adding party */}

        {!loader && products.length === 0 && (
          <div className="flex justify-center items-center mt-20 overflow-hidden font-bold text-gray-500">
            {" "}
            Oops!!.No Products Found
          </div>
        )}

        <div className="">
          <List
            className="pb-4"
            height={listHeight} // Specify the height of your list
            itemCount={filteredProducts.length} // Specify the total number of items
            itemSize={140} // Specify the height of each item
          >
            {Row}
          </List>
        </div>
      </div>
    </>
  );
}

export default ProductListSecondary;
