
/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "sonner";
import Swal from "sweetalert2";
import Pagination from "../../components/common/Pagination";

function SecUsersListAdminBlocked() {
  const [organizations, setOrganizations] = useState([]);
  const [organizationNames, setOrganizationNames] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [secondaryUsers, setSecondaryUsers] = useState([]);
  const [primaryUsers, setPrimaryUsers] = useState([]);
  const [selectedPrimary, setSelectedPrimary] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(25);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await api.get("/api/admin/getOrganizations", {
          withCredentials: true,
        });

        setOrganizations(res.data.organizationData);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    fetchOrganizations();

    const fetchPrimaryUsers = async () => {
      try {
        const res = await api.get("/api/admin/getPrimaryUsers", {
          withCredentials: true,
        });
        setPrimaryUsers(res.data.priUsers);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    fetchPrimaryUsers();
  }, []);

  useEffect(() => {
    const fetchSecondaryUsers = async () => {
      try {
        const res = await api.get("/api/admin/fetchSecondaryUsers", {
          withCredentials: true,
        });

        setSecondaryUsers(res.data.secondaryUsers);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    fetchSecondaryUsers();
  }, [refresh]);

  // console.log(primaryUsers);

  // console.log(organizations);
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
    const live=user.isBlocked===true

    const orgFilter =
      selectedOrg === "" ||
      user.organization.some((org) => org.name === selectedOrg);

    const primaryUserFilter =
      selectedPrimary === "" || user.primaryUser.userName === selectedPrimary;

    const searchFilter = user.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    return orgFilter && searchFilter && primaryUserFilter && live;
  });

  const handleBlock = async (userId) => {
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
        const res = await api.post(
          `/api/admin/handleSecondaryBlock/${userId}`,
          {},
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
          text: `${error.response.message}`,
          icon: "error",
        });
      }
    }
  };

  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const finalSecUsers = filteredSecUsers?.slice(firstPostIndex, lastPostIndex);

  return (
    <div>
      <body className="antialiased font-sans bg-white h-screen">
        <div className="container mx-auto px-4 sm:px-8 ">
          <div className="py-8">
            <div>
              <h2 className="text-2xl font-bold leading-tight mb-8">
                Secondary Users
              </h2>
            </div>
            <div className="my-2 flex sm:flex-row flex-col">
              <div className="flex flex-row mb-1 sm:mb-0">
                <div className="relative">
                  <select
                    value={selectedOrg}
                    onChange={(e) => setSelectedOrg(e.target.value)}
                    className="appearance-none h-full rounded-l border block w-full bg-white border-gray-400 text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  >
                    <option value={""}>All</option>

                    {organizationNames?.map((item, index) => (
                      <option key={index} value={item}>{item}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                
                  </div>
                </div>?
              </div>

              {/* p users */}
              <div className="flex flex-row mb-1 sm:mb-0 ml-2">
                <div className="relative">
                  <select
                    value={selectedPrimary}
                    onChange={(e) => setSelectedPrimary(e.target.value)}
                    className="appearance-none h-full rounded-l border block w-full bg-white border-gray-400 text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  >
                    <option value={""}>Primary Users</option>

                    {primaryUsers?.map((item, index) => (
                      <option key={index} value={item?.userName}>{item?.userName}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                   
                  </div>
                </div>
              </div>
              <div className="block relative">
                <span className="h-full absolute inset-y-0 left-2 flex items-center pl-2">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 fill-current text-gray-500"
                  >
                    <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z"></path>
                  </svg>
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className=" ml-2  appearance-none rounded-r rounded-l sm:rounded-l-none border border-gray-400 border-b block pl-8 pr-6 py-2 w-full bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"
                />
              </div>
            </div>
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
              <div className="inline-block min-w-full shadow-lg  overflow-hidden">
                <table className="min-w-full leading-normal">
                  <thead className="text-[#727ada]">
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-blue-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>

                      <th className="px-5 py-3 border-b-2 border-gray-200  bg-blue-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200  bg-blue-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200  bg-blue-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Organzations
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200  bg-blue-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Block
                      </th>

                      {/* <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Action
                      </th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {finalSecUsers?.length > 0 ? (
                      finalSecUsers?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <div className="flex items-center">
                              {/* <div className="flex-shrink-0 w-10 h-10">
                                <img
                                  className="w-full h-full rounded-full"
                                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80"
                                  alt=""
                                />
                              </div> */}
                              <div className="ml-3">
                                <p className="text-gray-900 whitespace-nowrap">
                                  {item?.name}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {item?.email}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-green-500 whitespace-no-wrap">
                              {item?.mobile}
                            </p>
                          </td>

                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <select className="text-gray-900 whitespace-no-wrap p-2 text-base border rounded-md focus:outline-none focus:ring focus:border-blue-300">
                              {item?.organization?.map((org, index) => (
                                <option
                                  key={index}
                                  value="option1"
                                  className="bg-white hover:bg-gray-100 text-gray-900"
                                >
                                  {org?.name}
                                </option>
                              ))}
                              {/* Add more options as needed */}
                            </select>
                          </td>

                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <span
                              onClick={() => {
                                handleBlock(item?._id);
                              }}
                              className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight duration-150  transform hover:scale-110 cursor-pointer"
                            >
                              <span
                                aria-hidden
                                className={` ${
                                  item?.isBlocked
                                    ? " bg-green-200 text-white"
                                    : " bg-red-500"
                                } absolute inset-0 opacity-90 rounded-full  `}
                              ></span>
                              <span
                                className={`relative ${
                                  item?.isBlocked
                                    ? "  text-black "
                                    : " text-white"
                                } `}
                              >
                                {item?.isBlocked ? "Unblock " : "Block"}
                              </span>
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td> No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row sm:items-start md:items-center xs:justify-between          ">
                  <span className="text-xs xs:text-sm text-gray-900">
                  Showing {firstPostIndex+1} to {lastPostIndex >filteredSecUsers?.length? filteredSecUsers?.length:lastPostIndex} of {filteredSecUsers?.length} Entries

                  </span>
                  <div className="inline-flex mt-2 xs:mt-0">
                    <Pagination
                      postPerPage={postPerPage}
                      totalPosts={filteredSecUsers?.length}
                      setCurrentPage={setCurrentPage}
                      currentPage={currentPage}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </div>
  );
}

export default SecUsersListAdminBlocked;
