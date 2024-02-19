import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import Sidebar from "../../components/homePage/Sidebar";
import { IoReorderThreeSharp } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";

function OrganisationList() {
  const [organizations, setOrganizations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(6);
  const [showSidebar, setShowSidebar] = useState(false);

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
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };

  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const organizationData = organizations.slice(firstPostIndex, lastPostIndex);

  console.log(organizations);
  return (
    <div className="flex">
      <div className="" style={{ height: "100vh" }}>
        <Sidebar TAB={"orgList"} showBar={showSidebar} />
      </div>

      <section className=" flex-1 antialiased bg-gray-100 text-gray-600 h-screen py-0 md:p-6 overflow-y-scroll   ">
        <div className="block md:hidden bg-[#201450] text-white mb-2 p-3 flex items-center gap-3  text-lg">
          <IoReorderThreeSharp
            onClick={handleToggleSidebar}
            className="block md:hidden text-3xl"
          />
          <p> Companies </p>
        </div>
        <div className="flex flex-col h-full px-[5px]">
          {/* <!-- Table --> */}
          <div className="w-full max-w-[59rem] mx-auto  bg-white shadow-lg rounded-sm border  border-gray-200">
            <header className=" hidden md:block px-5 py-4 border-b border-gray-100 bg bg-[#261b56] text-white">
              <h2 className="font-semibold ">Organizations</h2>
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
                                {item.name}
                              </div>
                            </div>
                          </td>
                          {/* <td className="p-2 whitespace-nowrap">
                            <div className="text-left"> {item.place}</div>
                          </td> */}
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-left"> {item.email}</div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-left"> {item.mobile}</div>
                          </td>
                         

                          <td className="p-2 whitespace-nowrap">
                            <div className="text-left"> {item.gstNum}</div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-left font-medium text-green-500">
                              {item.pin}
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className=" text-center">{item.state}</div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className=" text-center">{item.country}</div>
                          </td>

                          <Link to={`/pUsers/editOrg/${item._id}`}>
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
    </div>
  );
}

export default OrganisationList;
