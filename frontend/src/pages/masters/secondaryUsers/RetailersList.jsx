import { useEffect, useState } from "react";
import api from "../../../api/api";
import { toast } from "react-toastify";
import { FaEdit, FaPhone } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { removeAll } from "../../../../slices/invoice";
import { removeAllSales } from "../../../../slices/sales";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import CustomBarLoader from "../../../components/common/CustomBarLoader";
import CompanyFilter from "../../../components/Filters/CompanyFilter";
import { RiUser2Fill } from "react-icons/ri";
import { AiFillSetting } from "react-icons/ai";

function RetailersList() {
  const [secondaryUsers, setSecondaryUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate=useNavigate();

  const companyFilter = useSelector(
    (state) => state?.companyFilter?.selectedCompany || {}
  );

  // Fetch users on initial mount
  useEffect(() => {
    const fetchSecondaryUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/sUsers/fetchSecondaryUsers", {
          withCredentials: true,
        });
        setSecondaryUsers(res.data.secondaryUsers);
        setFilteredUsers(res.data.secondaryUsers); // Initially show all users
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSecondaryUsers();
    dispatch(removeAll());
    dispatch(removeAllSales());
  }, []);

  // Filter users based on selected company
  useEffect(() => {
    if (Object.keys(companyFilter).length > 0) {
      const filtered = secondaryUsers.filter((user) =>
        user.organization.some((el) => el?._id === companyFilter?._id)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(secondaryUsers); // Reset to all users if no filter is selected
    }
  }, [companyFilter, secondaryUsers]);


  const handleConfigNavigation = (user) => {
    console.log(user);
    
    navigate(`/sUsers/configureUser/${user._id}`,{
      state:user
    });
  };



  return (
    <section className="flex-1 text-gray-600  ">
      <div className="flex flex-col sticky top-0 z-50">
        <div className=" bg-[#201450] text-white p-3 flex items-center gap-3 text-lg">
          <Link to={"/sUsers/dashboard"}>
            <IoIosArrowRoundBack className="block cursor-pointer text-3xl" />
          </Link>
          <div className="flex items-center justify-between w-full font-bold">
            <p>Your Users</p>
            <Link to={"/sUsers/addSecUsers"}>
              <button className="flex gap-2 bg-[#2b1b6b] shadow-lg px-2 py-1 rounded-xs text-sm hover:scale-105 duration-100 ease-in-out hover:bg-[#2f245a] mr-3">
                Add User
              </button>
            </Link>
          </div>
        </div>
        <div className="">
          <CompanyFilter setLoading={setLoading} />
        </div>
      </div>
      {loading && <CustomBarLoader />}
      <div className=" ">
        {filteredUsers.length > 0 && !loading ? (
          <div className="space-y-2 p-2">
            {filteredUsers.map((user, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-sm  font-bold text-gray-900">
                      {user.name}
                    </h3>
                    <div className="flex items-center mt-3 text-gray-500 text-xs">
                      <MdEmail className=" mr-1 " />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center mt-1 text-gray-500 text-xs">
                      <FaPhone className=" mr-1 " />
                      <span>{user.mobile}</span>
                    </div>
                    <div className="flex items-center mt-1 text-gray-500 text-xs">
                      <RiUser2Fill className=" mr-1 " />
                      <span>{user?._id}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-5">
                    {/* <Link to={`/sUsers/configureUser/${user._id}`}> */}

                      <button
                      onClick={() => handleConfigNavigation(user)}
                       className="hover:text-gray-500 mt-1 ">
                        <AiFillSetting className="text-lg" />
                      </button>
                    {/* </Link> */}
                    <Link to={`/sUsers/editUser/${user._id}`}>
                      <button className="text-blue-600 hover:text-blue-700 ">
                        <FaEdit className="text-base" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="flex items-center justify-center h-full mt-36">
              <h1 className="text-gray-400 font-bold">No Users Found</h1>
            </div>
          )
        )}
      </div>
    </section>
  );
}

export default RetailersList;
