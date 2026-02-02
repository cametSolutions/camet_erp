import { useEffect, useState } from "react";
import api from "../../../api/api";
import { toast } from "sonner";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import CustomBarLoader from "../../../components/common/CustomBarLoader";
import TitleDiv from "@/components/common/TitleDiv";

function OrganisationList() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
console.log("H")
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
  }, []);

  return (
    <section className="flex-1 text-gray-600">
      <TitleDiv
        title="Your Companies"
        from="/sUsers/dashboard"
        dropdownContents={[
          {
            title: "Add Company",
            to: "/sUsers/addOrganization",
          },
        ]}
      />

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
