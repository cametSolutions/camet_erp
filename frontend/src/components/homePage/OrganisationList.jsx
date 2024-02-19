import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import Pagination from "../common/Pagination";

function OrganisationList() {
  const [organizations, setOrganizations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(6);

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

  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const organizationData = organizations.slice(firstPostIndex, lastPostIndex);

  console.log(organizations);
  return (
    <div>
      {/* <!-- component --> */}
      <section className="antialiased bg-gray-100 text-gray-600 h-screen px-4 overflow-scroll   ">
        <div className="flex flex-col h-full">
          {/* <!-- Table --> */}
          <div className="w-full max-w-[59rem] mx-auto  bg-white shadow-lg rounded-sm border border-gray-200">
            <header className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Organizations</h2>
            </header>
            <div className="p-3">
              <div className="overflow-x-auto">
                <table className="table-auto w-full">
                  <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                    <tr>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Name</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Place</div>
                      </th>
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
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-left"> {item.place}</div>
                          </td>
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
