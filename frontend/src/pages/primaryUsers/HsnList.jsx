import { useEffect, useState } from "react";
import api from "../../api/api";
import Pagination from "../../components/common/Pagination";
import {  IoReorderThreeSharp } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { removeAll } from "../../../slices/invoice";
import { removeAllSales } from "../../../slices/sales";
import { useSidebar } from "../../layout/Layout";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

function HsnList() {
  const [hsn, setHsn] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(6);
  const [refresh, setRefresh] = useState(false);

  //primary organization id
  const orgPrimary = useSelector((state) => state.setSelectedOrganization.selectedOrg);
  ///secondary organization id
  const orgSecondary = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const dispatch=useDispatch()
  const location = useLocation();
  let user;
  let orgId;
  let org;
  
  if (location?.pathname?.startsWith("/pUsers")) {
    user = "pUsers";
    orgId = orgPrimary._id;
    org = orgPrimary;
  } else {
    user = "sUsers";
    orgId = orgSecondary._id;
    org = orgSecondary;
  }
  




  useEffect(() => {
    const fetchHsn = async () => {
      try {
        const res = await api.get(`/api/${user}/fetchHsn/${orgId}`, {
          withCredentials: true,
        });

        setHsn(res.data.data);

        // console.log(res.data.organizationData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchHsn();
    dispatch(removeAll())
    dispatch(removeAllSales())

  }, [orgId, refresh]);

  const {  handleToggleSidebar } = useSidebar();


  const handleDelete = async (hsnId) => {
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
          `/api/${user}/deleteHsn/${hsnId}`,

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


  return (
     

      <section className="  antialiased  text-gray-600     ">
        <div className=" md:hidden sticky top-0 bg-[#201450] text-white mb-2 p-3 flex items-center gap-3  text-lg">
          <IoReorderThreeSharp
            onClick={handleToggleSidebar}
            className="block md:hidden text-3xl cursor-pointer"
          />

          <div className="flex items-center justify-between w-full">
            <p>HSN</p>
            <Link to={`/${user}/hsn`}>
              <button className="flex gap-2 bg-green-500 px-2 py-1 rounded-md text-sm  hover:scale-105 duration-100 ease-in-out hover:bg-green-600 mr-3">
                Add HSN
              </button>
            </Link>
          </div>
        </div>
        <div className="flex flex-col h-full ">
          {/* <!-- Table --> */}
          <div className="w-full   bg-white shadow-lg rounded-sm border  border-gray-200">
            <header className=" hidden md:block px-5 py-4 border-b border-gray-100 bg bg-[#261b56] text-white">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold ">HSN</h2>
                {/* {org.type === "self" && ( */}
                  <Link to={`/${user}/hsn`}>
                    <button className="flex gap-2 bg-green-500 px-2 py-1 rounded-md text-sm  hover:scale-105 duration-100 ease-in-out hover:bg-green-600">
                      Add HSN
                    </button>
                  </Link>
                {/* )} */}
              </div>
            </header>
            <div className="p-3">
              <div className="overflow-x-auto">
                <table className="table-auto w-full">
                  <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                    <tr>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left"> HSN Name</div>
                      </th>
                      {/* <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Place</div>
                      </th> */}
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">IGST Rate</div>
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
                    {hsn.length > 0 ? (
                      hsn.map((item, index) => (
                        <tr key={index}>
                          {/* <td className="p-2 whitespace-nowrap">
                            <div className="text-left"> {item.place}</div>
                          </td> */}
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-left"> {item.hsn}</div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-left">
                              {" "}
                              {`  ${item.igstRate} %`}
                            </div>
                          </td>
                          {/* 
                          <Link to={`/pUsers/editOrg/${item._id}`}> */}
                          {/* <td className="flex items-center justify-center">
                              <div className="h-full flex justify-center items-center">
                                
                              </div>
                            </td> */}
                          <td className="p-2 whitespace-nowrap">
                              <div className={` text-center cursor-pointer`}>
                                {" "}
                            <Link to={`/${user}/editHsn/${item._id}`}>
                                <FaEdit />
                            </Link>
                              </div>
                          </td>
                          {/* </Link> */}

                          <td className="p-2 whitespace-nowrap">
                            <div
                              onClick={() => {
                                handleDelete(item._id);
                              }}
                              className={` text-center cursor-pointer`}
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
                          No HSN found
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
              totalPosts={hsn.length}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          </div>
        </div>
      </section>
  );
}

export default HsnList;
