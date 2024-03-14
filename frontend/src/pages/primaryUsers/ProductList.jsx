import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import Sidebar from "../../components/homePage/Sidebar";
import { IoReorderThreeSharp } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { HashLoader } from "react-spinners";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(5);
  const [showSidebar, setShowSidebar] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/pUsers/getProducts", {
          withCredentials: true,
        });
        setLoader(true);

        setTimeout(() => {
          setProducts(res.data.productData);
        }, 1000);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    fetchProducts();
  }, [refresh]);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };

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
      try {
        const res = await api.delete(`/api/pUsers/deleteProduct/${id}`, {
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
      }
    }
  };

  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const productData = products.slice(firstPostIndex, lastPostIndex);

  return (
    <div className="flex">
      <div className="" style={{ height: "100vh" }}>
        <Sidebar TAB={"productList"} showBar={showSidebar} />
      </div>

      {
        products.length == 0 && loader ? (
          <div className="h-screen flex items-center justify-center w-full">
          <HashLoader color="#3636d6" />
         </div>
        ) : (
          <section className=" flex-1 antialiased bg-gray-100 text-gray-600 h-screen py-0 md:p-6 overflow-y-scroll">
          <div className="block md:hidden bg-[#201450] text-white mb-2 p-3 flex items-center gap-3  text-lg">
            <IoReorderThreeSharp
              onClick={handleToggleSidebar}
              className="block md:hidden text-3xl"
            />
            <div className="flex justify-between items-center w-full">
              <p> Products </p>
              <Link to={"/pUsers/addProduct"}>
                <button className="flex gap-2 bg-green-500 px-2 py-1 rounded-md text-sm  hover:scale-105 duration-100 ease-in-out hover:bg-green-600 mr-3">
                  Add Product
                </button>
              </Link>
            </div>
          </div>
          <div className="flex flex-col h-full px-[5px]">
            {/* <!-- Table --> */}
            <div className="w-full max-w-[59rem] mx-auto  bg-white shadow-lg rounded-sm border  border-gray-200   ">
              <header className=" hidden md:block px-5 py-4 border-b border-gray-100 bg bg-[#261b56] text-white ">
                <div className="flex  justify-between items-center">
                  <h2 className="font-semibold ">Products</h2>
  
                  <Link to={"/pUsers/addProduct"}>
                    <button className="flex gap-2 bg-green-500 px-2 py-1 rounded-md text-sm  hover:scale-105 duration-100 ease-in-out hover:bg-green-600">
                      Add Product
                    </button>
                  </Link>
                </div>
              </header>
              <div className="p-3 pb-1   ">
                <div className="overflow-x-auto">
                  <table className="table-auto w-full">
                    <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                      <tr>
                        <th className="p-2 whitespace-nowrap">
                          <div className="font-semibold text-left">Name</div>
                        </th>
                        <th className="p-2 whitespace-nowrap">
                          <div className="font-semibold text-left">HSN</div>
                        </th>
                        <th className="p-2 whitespace-nowrap">
                          <div className="font-semibold text-left">GST</div>
                        </th>
                        <th colSpan={2} className="p-2 whitespace-nowrap ">
                          <div className="font-semibold text-left">ACTIONS</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm leading-[40px] divide-y divide-gray-100 ">
                      {productData.length > 0 ? (
                        productData.map((item, index) => (
                          <tr key={index}>
                            <td className="p-2 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="font-medium text-gray-800">
                                  {item?.product_name}
                                </div>
                              </div>
                            </td>
                            {/* <td className="p-2 whitespace-nowrap">
                              <div className="text-left"> {item.place}</div>
                            </td> */}
                            <td className="p-2 whitespace-nowrap">
                              <div className="text-left"> {item?.hsn_code}</div>
                            </td>
                            <td className="p-2 whitespace-nowrap">
                              <div className="text-left"> {item?.igst}</div>
                            </td>
  
                            <td className="p-2 whitespace-nowrap ">
                              <div className=" text-center">
                                {" "}
                                <Link to={`/pUsers/editProduct/${item._id}`}>
                                  <FaEdit className="hover:scale-125 cursor-pointer duration-100 ease-in-out" />
                                </Link>
                              </div>
                            </td>
                            <td className="p-2 whitespace-nowrap ">
                              <div className=" text-center">
                                {" "}
                                <MdDelete
                                  onClick={() => {
                                    handleDelete(item._id);
                                  }}
                                  className="hover:scale-125 cursor-pointer duration-100 ease-in-out"
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            className="text-center  "
                            style={{ marginTop: "20px" }}
                            colSpan={5}
                          >
                            No products found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="mt-5 mb-5">
              <Pagination
                postPerPage={postPerPage}
                totalPosts={products.length}
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
              />
            </div>
          </div>
        </section>

        )
      }

    
    </div>
  );
}

export default ProductList;
