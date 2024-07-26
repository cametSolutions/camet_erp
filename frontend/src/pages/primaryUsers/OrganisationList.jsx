import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import { IoReorderThreeSharp } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { removeAll } from "../../../slices/invoice";
import { removeAllSales } from "../../../slices/sales";
import { useDispatch } from "react-redux";
import { useSidebar } from "../../layout/Layout";

function OrganisationList() {
  const [organizations, setOrganizations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(6);



  const dispatch = useDispatch();
const { handleToggleSidebar } = useSidebar();


  useEffect(() => {
    const fetchOrganiszations = async () => {
      try {
        const res = await api.get("/api/pUsers/getOrganizations", {
          withCredentials: true,
        });

        setOrganizations(res.data.organizationData);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    fetchOrganiszations();
    dispatch(removeAll());
    dispatch(removeAllSales());
  }, []);



  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const organizationData = organizations.slice(firstPostIndex, lastPostIndex);

  console.log(organizations);
  return (
    <section className=" flex-1  text-gray-600   ">
      <div className="block sticky top-0 md:hidden bg-[#201450] text-white mb-2 p-3 flex items-center gap-3  text-lg">
        <IoReorderThreeSharp
          onClick={handleToggleSidebar}
          className="block md:hidden text-3xl"
        />
        <div className="flex items-center justify-between w-full">
          <p>Your Companies</p>
          <Link to={"/pUsers/addOrganization"}>
            <button className="flex gap-2 bg-green-500 px-2 py-1 rounded-md text-sm  hover:scale-105 duration-100 ease-in-out hover:bg-green-600 mr-3">
              Add Company
            </button>
          </Link>
        </div>
      </div>
      <div className=" h-full ">
        {/* <!-- Table --> */}
        <div className="w-full  mx-auto  bg-white shadow-lg rounded-sm border  border-gray-200">
          <header className=" hidden md:block px-5 py-4 border-b border-gray-100 bg bg-[#261b56] text-white">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold ">Your Companies</h2>
              <Link to={"/pUsers/addOrganization"}>
                <button className="flex gap-2 bg-green-500 px-2 py-1 rounded-md text-sm  hover:scale-105 duration-100 ease-in-out hover:bg-green-600">
                  Add Company
                </button>
              </Link>
            </div>
          </header>
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
                      <div className="font-semibold text-left">Email</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-left">Mobile</div>
                    </th>

                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-left">Gst No.</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-left">Pin</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">State</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Country</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Edit</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm leading-[40px] divide-y divide-gray-100 ">
                  {organizationData.length > 0 ? (
                    organizationData.map((item, index) => (
                      <tr key={index}>
                        <td className="p-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="font-medium text-gray-800">
                              {item?.name}
                            </div>
                          </div>
                        </td>
                        {/* <td className="p-2 whitespace-nowrap">
                            <div className="text-left"> {item.place}</div>
                          </td> */}
                        <td className="p-2 whitespace-nowrap">
                          <div className="text-left"> {item?.email}</div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="text-left"> {item?.mobile}</div>
                        </td>

                        <td className="p-2 whitespace-nowrap">
                          <div className="text-left"> {item?.gstNum}</div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="text-left font-medium text-green-500">
                            {item?.pin}
                          </div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className=" text-center">{item?.state}</div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className=" text-center">{item?.country}</div>
                        </td>

                        <Link to={`/pUsers/editOrg/${item?._id}`}>
                          {/* <td className="flex items-center justify-center">
                              <div className="h-full flex justify-center items-center">
                                
                              </div>
                            </td> */}
                          <td className="p-2 whitespace-nowrap">
                            <div className=" text-center">
                              {" "}
                              <FaEdit />
                            </div>
                          </td>
                        </Link>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="text-center  "
                        style={{ marginTop: "20px" }}
                        colSpan={5}
                      >
                        No organizations found
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
            totalPosts={organizations.length}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
      </div>
    </section>
  );
}

export default OrganisationList;
