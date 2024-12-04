import { useEffect, useState } from "react";
import api from "../../api/api";
import Pagination from "../../components/common/Pagination";
import { IoReorderThreeSharp } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { removeAll } from "../../../slices/invoiceSecondary";
import { useDispatch } from "react-redux";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

function AddChargesListSecondary() {
  const [additional, setAdditional] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(6);
  const [showSidebar, setShowSidebar] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [org, setOrg] = useState([]);

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const navigate = useNavigate();

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAdditionalCharges = async () => {
      try {
        const res = await api.get(
          `/api/sUsers/getSingleOrganization/${cmp_id}`,
          {
            withCredentials: true,
          }
        );
        setOrg(res?.data?.organizationData);
        setAdditional(res?.data?.organizationData?.additionalCharges);

        // console.log(res.data.organizationData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAdditionalCharges();
    dispatch(removeAll());
  }, [cmp_id, refresh]);

  console.log(org);

  console.log(additional);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };

  const handleDelete = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      // text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, do it!",
      cancelButtonText: "Cancel it",
    });
    if (confirmResult.isConfirmed) {
      try {
        const res = await api.delete(
          `/api/sUsers/deleteAdditionalCharge/${id}/${cmp_id}`,

          {
            withCredentials: true,
          }
        );
        console.log(res);
        setRefresh(!refresh);
        Swal.fire({
          title: "Done!",
          text: `${res.data.message}`,
          icon: "success",
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: "Error!",
          text: `${error.response.data.message}`,
          icon: "error",
        });
      }
    }
  };
  console.log(org);

  return (
    <div className="flex">
      {/* <div className="" style={{ height: "100vh" }}>
        <SidebarSec TAB={"additionalCharge"} showBar={showSidebar} />
      </div> */}

      <section className=" flex-1 antialiased bg-gray-100 text-gray-600 h-screen overflow-hidden    ">
        <header className=" flex items-center justify-between  gap-2 px-5 py-4 border-b border-gray-100 bg bg-[#261b56] text-white sticky top-0">
          <div className="flex items-center gap-2">
            <IoIosArrowRoundBack
              onClick={() => navigate("/sUsers/dashboard")}
              className="text-3xl"
            />
            <h2 className="font-semibold ">Additional Charges</h2>
          </div>
          <div className="flex justify-between items-center">
            {org.type === "self" && (
              <Link to={"/sUsers/additionalCharges"}>
                <button className="flex gap-2 bg-green-500 px-2 py-1 rounded-md text-sm  hover:scale-105 duration-100 ease-in-out hover:bg-green-600">
                  Add
                </button>
              </Link>
            )}
          </div>
        </header>

        <div className="flex flex-col h-full ">
          {/* <!-- Table --> */}
          <div className="w-full  mx-auto  bg-white shadow-lg rounded-sm border  border-gray-200">
            <div className="p-3">
              <div className="overflow-x-auto">
                <table className="table-auto w-full">
                  <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                    <tr>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Name</div>
                      </th>
                      {/* <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Place</div>
                      </th> */}
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">HSN</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Tax</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Edit</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Delete</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm leading-[40px] divide-y divide-gray-100 ">
                    {additional.length > 0 ? (
                      additional.map((item, index) => (
                        <tr key={index}>
                          {/* <td className="p-2 whitespace-nowrap">
                            <div className="text-left"> {item.place}</div>
                          </td> */}
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-left"> {item?.name}</div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-left">
                              {" "}
                              {item?.hsn || "Nil"}
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-left">
                              {" "}
                              {`  ${item?.taxPercentage || "0"} %`}
                            </div>
                          </td>
                          {/* 
                          <Link to={`/sUsers/editOrg/${item._id}`}> */}
                          {/* <td className="flex items-center justify-center">
                              <div className="h-full flex justify-center items-center">
                                
                              </div>
                            </td> */}
                          <td className="p-2 whitespace-nowrap">
                            <div
                              className={` ${
                                org?.type !== "self" &&
                                "pointer-events-none opacity-55"
                              } text-center cursor-pointer`}
                            >
                              {" "}
                              <Link
                                to={`/sUsers/editAdditionalCharge/${item?._id}`}
                              >
                                <FaEdit />
                              </Link>
                            </div>
                          </td>
                          {/* </Link> */}

                          <td className="p-2 whitespace-nowrap">
                            <div
                              onClick={() => {
                                handleDelete(item?._id);
                              }}
                              className={` ${
                                org?.type !== "self" &&
                                "pointer-events-none opacity-55"
                              } text-center cursor-pointer`}
                            >
                              {" "}
                              <MdDelete />
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
                          No Additional Charges Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <Pagination
              postPerPage={postPerPage}
              totalPosts={additional?.length}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default AddChargesListSecondary;
