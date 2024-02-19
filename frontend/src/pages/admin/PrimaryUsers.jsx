/* eslint-disable react/no-unknown-property */

import { useEffect, useState } from "react";
import api from "../../api/api";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import SecUserPopup from "../../components/admin/SecUserPopup";
import Pagination from "../../components/common/Pagination";
import { RiDeleteBin5Fill } from "react-icons/ri";

function PrimaryUsers() {
  const [data, setData] = useState([]);
  const [org, setOrg] = useState([]);
  const [secUsers, setSecUsers] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [search, setSearch] = useState("");
  // const [selectedUSer, setSelectedUser] = useState("");
  const [showSecUSers, setShowSecUSers] = useState(false);
  const [filteredSecUsers, setFilteredSecUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(5);
  const [option, setOption] = useState("");

  console.log(option);

  useEffect(() => {
    const getPrimaryUsers = async () => {
      try {
        const res = await api.get("/api/admin/getPrimaryUsers", {
          withCredentials: true,
        });
        console.log(res);
        setData(res.data.priUsers);
        setOrg(res.data.org);
        setSecUsers(res.data.secUsers);
      } catch (error) {
        console.log(error);
      }
    };
    getPrimaryUsers();
  }, [refresh]);

  // console.log(secUsers);
  // console.log(org);

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
          `/api/admin/handlePrimaryBlock/${userId}`,
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

  const handleSecBlock = async (userId) => {
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
  const handleDelete = async (userId) => {
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
          `/api/admin/handlePrimaryDelete/${userId}`,
          
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

  const filteredData = data.filter((item) => {
    const isBlocked = item.isBlocked;

    return (
      (item.userName.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase())) &&
      (option === "" ||
        (option === "blocked" && isBlocked) ||
        (option === "unblocked" && !isBlocked))
    );
  });

  const calculateExpiresAt = (createdAt, period) => {
    let expirationDate = dayjs(createdAt);

    if (period === "monthly") {
      expirationDate = expirationDate.add(30, "days"); // create a new instance
    } else if (period === "yearly") {
      expirationDate = expirationDate.add(1, "year"); // create a new instance
    }

    return expirationDate.format("DD/MM/YYYY");
  };

  const handleSubscriptionToggle = async (userId) => {
    try {
      const res = await api.post(
        `/api/admin/handleSubscription/${userId}`,
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

  const handleSms = async (userId) => {
    try {
      const res = await api.post(
        `/api/admin/handleSms/${userId}`,
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

  const handleWhatsApp = async (userId) => {
    try {
      const res = await api.post(
        `/api/admin/handleWhatsApp/${userId}`,
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

  const disablePageScroll = () => {
    console.log("hai");
    document.body.style.overflowY = "hidden";
  };

  const enablePageScroll = () => {
    document.body.style.overflow = "";
  };

  useEffect(() => {
    // Enable or disable page scroll based on the chat state
    if (showSecUSers) {
      disablePageScroll();
    } else {
      enablePageScroll();
    }
  }, [showSecUSers]);

  const handleSecUsersPopup = (id) => {
    setShowSecUSers(true);
    // setSelectedUser(id);

    const filtered = secUsers.filter((user) => user.primaryUser === id);
    setFilteredSecUsers(filtered);
    //  document.body.style.overflow = 'hidden';
  };

  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const currentUsers = filteredData.slice(firstPostIndex, lastPostIndex);

  console.log(filteredSecUsers);

  return (
    <div className="relative">
      {/* <!-- component --> */}
      <div
        className="bg-white p-8 rounded-md w-full h-screen overflow-y-scroll"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "transparent transparent",
        }}
      >
        <div className=" flex items-center  pb-6">
          <div>
            <h2 className="text-gray-600 font-semibold">Primary Users</h2>
            <span className="text-xs">Camet</span>
          </div>
          <div className="flex items-center justify-between ml-10 gap-3 ">
            <div className="flex bg-gray-50 items-center p-2 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"
                />
              </svg>
              <input
                className="bg-gray-50 outline-none ml-1 block "
                type="text"
                name=""
                id=""
                placeholder="search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center">
              <select
                className="px-2 py-1 border border-gray-300 rounded"
                value={option}
                onChange={(e) => setOption(e.target.value)}
              >
                <option value="">All</option>
                <option value="blocked">Blocked</option>
                <option value="unblocked">Un Blocked</option>
                {/* Add more options as needed */}
              </select>
            </div>
          </div>
        </div>
        <div>
          <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
            <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      No.Org
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      No.Users
                    </th>

                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created at
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Expires at
                    </th>
                    {/* <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Approve
                    </th> */}

                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Block
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      SMS
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Whatsapp
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((item, index) => (
                      <tr key={index}>
                        <td className="  px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <div className="flex">
                            <div className="">
                              <p className="text-gray-900 whitespace-nowrap">
                                {item.userName}
                              </p>
                            </div>
                          </div>
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
                            {org.filter((ele) => ele.owner === item._id).length}
                          </p>
                        </td>
                        <td
                          onClick={() => handleSecUsersPopup(item._id)}
                          className="px-5 py-5 border-b border-gray-200 bg-white text-sm cursor-pointer "
                        >
                          <p className="text-gray-900 whitespace-no-wrap ">
                            {
                              secUsers.filter(
                                (ele) => ele.primaryUser === item._id
                              ).length
                            }
                          </p>
                        </td>

                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <p className="text-gray-900 whitespace-no-wrap">
                            {dayjs(item.createdAt).format("DD/MM/YYYY")}
                          </p>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <p className="text-red-700 whitespace-no-wrap">
                            {calculateExpiresAt(
                              item.createdAt,
                              item.subscription
                            )}
                            {/* {calculateExpiresAt('16/01/2024',"monthly")} */}
                          </p>
                        </td>
                        {/* <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <span
                            onClick={() => {
                              handleApprove(item._id);
                            }}
                            className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight duration-150  transform hover:scale-110 cursor-pointer"
                          >
                            <span
                              aria-hidden
                              className={` ${
                                item.isApproved
                                  ? " bg-red-500 text-white"
                                  : " bg-green-200"
                              } absolute inset-0 opacity-90 rounded-full  `}
                            ></span>
                            <span
                              className={`relative ${
                                item.isApproved
                                  ? "  text-white"
                                  : " bg-green-200"
                              } `}
                            >
                              {item.isApproved ? "Disapprove" : "Approve"}
                            </span>
                          </span>
                        </td> */}
                        {/* <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <span
                            onClick={() => {
                              handleBlock(item._id);
                            }}
                            className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight duration-150  transform hover:scale-110 cursor-pointer"
                          >
                            <span
                              aria-hidden
                              className={` ${
                                item.isBlocked
                                  ? " bg-green-200 text-white"
                                  : " bg-red-500"
                              } absolute inset-0 opacity-90 rounded-full  `}
                            ></span>
                            <span
                              className={`relative ${
                                item.isBlocked ? "  text-black " : " text-white"
                              } `}
                            >
                              {item.isBlocked ? "Unblock " : "Block"}
                            </span>
                          </span>
                        </td> */}

                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <div
                            class="toggle-button-cover"
                            onClick={() => {
                              handleBlock(item._id);
                            }}
                          >
                            <div id="button-5" class="button r">
                              <input
                                className="checkbox"
                                type="checkbox"
                                checked={item.isBlocked === true}
                              />
                              <div className="knobs"></div>
                              <div className="layer"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <div
                            class="toggle-button-cover"
                            onClick={() => {
                              handleSubscriptionToggle(item._id);
                            }}
                          >
                            <div id="button-3" class="button r">
                              <input
                                className="checkbox"
                                type="checkbox"
                                checked={item.subscription === "yearly"}
                              />
                              <div className="knobs"></div>
                              <div className="layer"></div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <div
                            onClick={() => {
                              handleSms(item._id);
                            }}
                            class="toggle-button-cover"
                          >
                            <div id="button-4" class="button r">
                              <input
                                checked={item.sms === true}
                                className="checkbox"
                                type="checkbox"
                              />
                              <div className="knobs"></div>
                              <div className="layer"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <div
                            onClick={() => {
                              handleWhatsApp(item._id);
                            }}
                            class="toggle-button-cover"
                          >
                            <div id="button-4" class="button r">
                              <input
                                checked={item.whatsApp === true}
                                className="checkbox"
                                type="checkbox"
                              />
                              <div className="knobs"></div>
                              <div className="layer"></div>
                            </div>
                          </div>
                        </td>

                        <td className="flex justify-center items-center">
                          <RiDeleteBin5Fill onClick={()=>{handleDelete(item._id)}} className="cursor-pointer mt-4 text-[#72283b] transform duration-100 hover:scale-125 text-lg" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row sm:items-start md:items-center xs:justify-between ">
                <span className="text-xs xs:text-sm text-gray-900">
                  Showing {firstPostIndex + 1} to {lastPostIndex} of{" "}
                  {filteredData.length} Entries
                </span>
                <div className="inline-flex mt-2 xs:mt-0">
                  <Pagination
                    postPerPage={postPerPage}
                    totalPosts={filteredData.length}
                    setCurrentPage={setCurrentPage}
                    currentPage={currentPage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="">
        <div
          className={` ${
            showSecUSers ? "backdrop-filter backdrop-blur-[2px]" : ""
          } ${
            showSecUSers ? "block" : "hidden"
          } fixed inset-0 z-10 bg-gray-500 bg-opacity-50 flex items-center justify-center h-screen`}
        >
          <SecUserPopup
            filteredSecUsers={filteredSecUsers}
            handleSecBlock={handleSecBlock}
            setShowSecUSers={setShowSecUSers}
            refresh={refresh}
          />
        </div>
      </div>
    </div>
  );
}

export default PrimaryUsers;
