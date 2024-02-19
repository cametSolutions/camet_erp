/* eslint-disable react/no-unknown-property */
import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";

function OrganisationsBlocked() {
  const [organizations, setOrganizations] = useState([]);
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(6);
  const [refresh, setRefresh] = useState(false);


  console.log(selectedOwner);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await api.get("/api/admin/getOrganizationsAdmin", {
          withCredentials: true,
        });

        setOrganizations(res.data.data);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    fetchOrganizations();
  }, [refresh]);

  console.log(organizations);
  useEffect(() => {
    // Ensure organizations is not empty before processing
    if (organizations.length > 0) {
      const ownerNames = Array.from(
        new Set(organizations.map((org) => org.owner.userName))
      );
      setOwners(ownerNames);
    }
  }, [organizations]);

  // Filter organizations based on selected owner
  const filteredOrganizations = organizations.filter((org) => {
    const live=org.isApproved=== false;
    const ownerFilter =
      selectedOwner === "" || org.owner.userName === selectedOwner;
    const searchFilter = org.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return ownerFilter && searchFilter && live;
  });


  const handleApprove = async (orgId) => {
    try {
      const res = await api.post(
        `/api/admin/handleOrganizationApprove/${orgId}`,
        {},
        {
          withCredentials: true,
        }
      );
      console.log(res);
      setRefresh(!refresh);
      toast.success(res.data.message);
    } catch (error) {
      console.error(error);
    }
  };

  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const finalOrganizations = filteredOrganizations.slice(
    firstPostIndex,
    lastPostIndex
  );

  return (
    <div>
      <body className="antialiased font-sans h-screen">
        <div className="container mx-auto px-4 sm:px-8 ">
          <div className="py-8">
            <div>
              <h2 className="text-2xl font-bold leading-tight mb-9">
                Organizations
              </h2>
            </div>
            <div className="my-2 flex sm:flex-row flex-col">
              <div className="flex flex-row mb-1 sm:mb-0">
                <div className="relative">
                  <select
                    value={selectedOwner}
                    onChange={(e) => setSelectedOwner(e.target.value)}
                    className="appearance-none h-full rounded-l border block w-full bg-white border-gray-400 text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  >
                    <option value={""}>All</option>

                    {owners.map((item, index) => (
                      <option key={index}>{item}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="block relative">
                <span className="h-full absolute inset-y-0 left-0 flex items-center pl-2">
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
                  className="appearance-none rounded-r rounded-l sm:rounded-l-none border border-gray-400 border-b block pl-8 pr-6 py-2 w-full bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"
                />
              </div>
            </div>
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
              <div className="inline-block min-w-full shadow-xl  overflow-hidden">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#aee9f3] text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#aee9f3]  text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Place
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#aee9f3]  text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#aee9f3]  text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#aee9f3]  text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Gst No.
                      </th>

                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#aee9f3]  text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Pin
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#aee9f3]  text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#aee9f3]  text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        State
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#aee9f3]  text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Approve
                      </th>

                      {/* <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Action
                      </th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {finalOrganizations.length > 0 ? (
                      finalOrganizations.map((item, index) => (
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
                                  {item.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {item.place}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {item.email}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {item.mobile}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {item.gstNum}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {item.pin}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {item.country}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {item.state}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <div
                            onClick={() => {
                              handleApprove(item._id);
                            }}
                            class="toggle-button-cover"
                          >
                            <div id="button-4" class="button r">
                              <input
                                checked={item.isApproved === true}
                                className="checkbox"
                                type="checkbox"
                              />
                              <div className="knobs"></div>
                              <div className="layer"></div>
                            </div>
                          </div>
                        </td>
                          {/* <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                              <span
                                aria-hidden
                                className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
                              ></span>
                              <span className="relative">Activo</span>
                            </span>
                          </td> */}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between          ">
                  <span className="text-xs xs:text-sm text-gray-900">
                    Showing {firstPostIndex+1} to {lastPostIndex} of {filteredOrganizations.length} Entries
                  </span>
                  <div className="inline-flex mt-2 xs:mt-0">
                    <Pagination
                      postPerPage={postPerPage}
                      totalPosts={filteredOrganizations.length}
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

export default OrganisationsBlocked;
