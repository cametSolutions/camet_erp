import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import Sidebar from "../../components/homePage/Sidebar";
import { IoReorderThreeSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

function RetailersList() {
  const [organizations, setOrganizations] = useState([]);
  const [organizationNames, setOrganizationNames] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [secondaryUsers, setSecondaryUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(5);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const fetchOrganizations = async () => {
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
    fetchOrganizations();
    const fetchSecondaryUsers = async () => {
      try {
        const res = await api.get("/api/pUsers/fetchSecondaryUsers", {
          withCredentials: true,
        });

        setSecondaryUsers(res.data.secondaryUsers);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    fetchSecondaryUsers();
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };

  console.log(organizations);
  console.log(secondaryUsers);
  useEffect(() => {
    // Ensure organizations is not empty before processing
    if (organizations?.length > 0) {
      const organizationNames = organizations.map((org) => org.name);
      setOrganizationNames(organizationNames);
    }
  }, [organizations]);

  //   Filter organizations based on selected owner
  const filteredSecUsers = secondaryUsers.filter((user) => {
    const orgFilter =
      selectedOrg === "" ||
      user.organization.some((org) => org.name === selectedOrg);

    const searchFilter = user.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    return orgFilter && searchFilter;
  });

  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const finalSecUsers = filteredSecUsers.slice(firstPostIndex, lastPostIndex);

  return (
    <div className="flex">
      <div className="" style={{ height: "100vh" }}>
        <Sidebar TAB={"agentLIst"} showBar={showSidebar} />
      </div>

      <section className=" flex-1 antialiased bg-gray-100 text-gray-600 h-screen py-0 md:p-6 overflow-y-scroll   ">
        <div className="block md:hidden bg-[#201450] text-white mb-2 p-3 flex items-center gap-3 text-lg ">
          <IoReorderThreeSharp
            onClick={handleToggleSidebar}
            className="block md:hidden text-3xl"
          />
          <div className="flex items-center justify-between w-full">
            <p>Your Retailers</p>
            <Link to={"/pUsers/addSecUsers"}>
              <button className="flex gap-2 bg-green-500 px-2 py-1 rounded-md text-sm  hover:scale-105 duration-100 ease-in-out hover:bg-green-600 mr-3">
                Add Retailers
              </button>
            </Link>
          </div>
        </div>
        <div className="flex flex-col h-full px-[5px]">
          {/* <!-- Table --> */}
          <div className="w-full max-w-[59rem] mx-auto  bg-white shadow-lg rounded-sm border  border-gray-200 ">
            <header className=" hidden md:block px-5 py-4 border-b border-gray-100 bg bg-[#261b56] text-white">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold ">Your Retailers</h2>
                <Link to={"/pUsers/addSecUsers"}>
                  <button className="flex gap-2 bg-green-500 px-2 py-1 rounded-md text-sm  hover:scale-105 duration-100 ease-in-out hover:bg-green-600">
                    Add Retailers
                  </button>
                </Link>
              </div>
            </header>
            <div className="bg-gray-300  w-full p-1 md:p-2  flex gap-2   ">
              <div className="">
                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="appearance-none h-full  border block  bg-gray-300  w-full text-black py-1 md:py-2 px-4 pr-8 leading-tight text-sm "
                >
                  <option value={""}>All</option>

                  {organizationNames.map((item, index) => (
                    <option key={index}>{item}</option>
                  ))}
                </select>
               
              </div>
              <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className=" w-full appearance-none rounded-r rounded-l sm:rounded-l-none border border-gray-400 border-b block pl-8 pr-6 py-2  bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"
                  />
            </div>
            <div className="p-3">
              <div className="overflow-x-auto">
                <table className="table-auto w-full">
                  <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                    <tr>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Name</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Email</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Mobile</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">
                          Organzations
                        </div>
                      </th>
                      {/* <th colSpan={2} className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Action</div>
                      </th> */}
                    </tr>
                  </thead>
                  <tbody className="text-sm leading-[40px] divide-y divide-gray-100 ">
                    {finalSecUsers.length > 0 ? (
                      finalSecUsers.map((item, index) => (
                        <tr key={index}>
                          <td className="p-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="font-medium text-gray-800">
                                {item.name}
                              </div>
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-left"> {item.email}</div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-left"> {item.mobile}</div>
                          </td>

                          <td className="p-2 whitespace-nowrap">
                            <select className="text-gray-900 whitespace-no-wrap border-none  text-sm border rounded-md  ">
                              {item.organization?.map((org, index) => (
                                <option
                                  key={index}
                                  value="option1"
                                  className="bg-white hover:bg-gray-100 text-gray-900"
                                >
                                  {org.name}
                                </option>
                              ))}
                              {/* Add more options as needed */}
                            </select>
                          </td>
                          {/* <td className="p-2 whitespace-nowrap">
                            <div className="text-left">
                              {" "}
                              <MdDelete
                                onClick={() => {
                                  deleteHandler(item._id);
                                }}
                                className="hover:scale-125 duration-150 ease-in-out cursor-pointer "
                              />
                            </div>
                          </td> */}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className="text-center  "
                          style={{ marginTop: "20px" }}
                          colSpan={5}
                        >
                          No Retailers were found
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
              totalPosts={filteredSecUsers.length}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default RetailersList;
