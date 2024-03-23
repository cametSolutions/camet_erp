import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import Sidebar from "../../components/homePage/Sidebar";
import { FaEdit } from "react-icons/fa";
import { IoReorderThreeSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { removeAll } from "../../../slices/invoice";

import { useDispatch } from "react-redux";

function BankList() {
  const [banks, setBanks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(6);
  const [showSidebar, setShowSidebar] = useState(false);

  const cmp_id = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );
  const type = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg.type
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await api.get(`api/pUsers/bankList/${cmp_id}`, {
          withCredentials: true,
        });

        setBanks(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchBanks();
    dispatch(removeAll());
  }, [cmp_id]);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };

  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const bankData = banks.slice(firstPostIndex, lastPostIndex);

  console.log(bankData);

  return (
    <div className="flex">
      <div className="" style={{ height: "100vh" }}>
        <Sidebar TAB={"bankList"} showBar={showSidebar} />
      </div>

      <section className=" flex-1 antialiased bg-gray-100 text-gray-600 h-screen py-0 md:p-6 overflow-y-scroll   ">
        <div className="block md:hidden bg-[#201450] text-white mb-2 p-3 flex items-center gap-3 text-lg justify-between ">
          <div className="flex items-center justify-center gap-2">
            <IoReorderThreeSharp
              onClick={handleToggleSidebar}
              className="block md:hidden text-3xl"
            />
            <p> Your Banks</p>
          </div>
          {type === "self" && (
            <Link to={"/pUsers/addBank"}>
              <button className="  flex gap-2 bg-green-500 px-2 py-1 rounded-md text-sm  hover:scale-105 duration-100 ease-in-out hover:bg-green-600">
                Add Bank
              </button>
            </Link>
          )}
        </div>
        <div className="flex flex-col h-full px-[5px]">
          {/* <!-- Table --> */}
          <div className="w-full max-w-[59rem] mx-auto  bg-white shadow-lg rounded-sm border  border-gray-200">
            <header className=" hidden md:block px-5 py-4 border-b border-gray-100 bg bg-[#261b56] text-white">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold ">Your Banks</h2>
                {type === "self" && (
                  <Link to={"/pUsers/addBank"}>
                    <button className="  flex gap-2 bg-green-500 px-2 py-1 rounded-md text-sm  hover:scale-105 duration-100 ease-in-out hover:bg-green-600">
                      Add Bank
                    </button>
                  </Link>
                )}
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
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Acc No</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">IFSC</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Edit</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm leading-[40px] divide-y divide-gray-100 ">
                    {bankData.length > 0 ? (
                      bankData.map((item, index) => (
                        <tr key={index}>
                          <td className="p-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="font-medium text-gray-800">
                                {item.bank_name}
                              </div>
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-left"> {item.ac_no}</div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-left"> {item.ifsc}</div>
                          </td>
                          <Link to={`/pUsers/editBank/${item._id}`}>
                            <td className="p-2 whitespace-nowrap">
                              <div className="text-left">
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
                          No banks found
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
              totalPosts={banks.length}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default BankList;
