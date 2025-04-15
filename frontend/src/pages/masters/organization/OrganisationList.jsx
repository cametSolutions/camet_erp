import { useEffect, useState } from "react";
import api from "../../../api/api";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { removeAll } from "../../../../slices/invoice";
import { removeAllSales } from "../../../../slices/sales";
import { useDispatch } from "react-redux";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import CustomBarLoader from "../../../components/common/CustomBarLoader";

function OrganisationList() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganiszations = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/sUsers/getOrganizations", {
          withCredentials: true,
        });
        setOrganizations(res.data.organizationData);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganiszations();
    dispatch(removeAll());
    dispatch(removeAllSales());
  }, []);

  return (
    <section className="flex-1 text-gray-600">
      <div className="sticky top-0 bg-[#201450] text-white p-3 flex items-center gap-3 text-lg">
        <IoIosArrowRoundBack
          onClick={() => {
            navigate("/sUsers/dashboard");
          }}
          className="block cursor-pointer  text-3xl"
        />
        <div className="flex items-center justify-between w-full  font-bold">
          <p>Your Companies</p>
          <Link to="/sUsers/addOrganization">
            <button className="flex gap-2 bg-[#3f2e81] shadow-lg px-2 py-1 rounded-xs text-sm hover:scale-105 duration-100 ease-in-out hover:bg-[#553fae] mr-3">
              Add Company
            </button>
          </Link>
        </div>
      </div>

      {loading && <CustomBarLoader />}

      <div className="    text-sm p-2  ">
        {organizations.length > 0 ? (
          <div className="space-y-2 p-2 ">
            {organizations.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-sm shadow-md p-4 px-5"
              >
                <div className="flex justify-between ">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900">
                      {item?.name}
                    </h3>
                    <p className="text-gray-500 mt-3 font-semibold text-xs  ">
                      {item?.country} / ({item?.state})
                    </p>
                    <div className="flex items-center mt-1 text-gray-500 font-semibold text-xs ">
                      <span>Mobile: </span>
                      <span className="ml-1 ">{item?.mobile}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 sm:text-lg ">
                    <Link to={`/sUsers/editOrg/${item?._id}`}>
                      <div className="flex items-center space-x-3 ">
                        <button className="text-blue-500 hover:text-green-700">
                          <FaEdit />
                        </button>
                      </div>
                    </Link>

                    {/* <RiDeleteBin5Fill className="text-red-800 cursor-pointer hover:text-red-900 hover:scale-105" /> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="flex items-center justify-center h-full mt-36">
              <h1 className="text-gray-400 font-bold">No Data Found</h1>
            </div>
          )
        )}
      </div>
    </section>
  );
}

export default OrganisationList;
