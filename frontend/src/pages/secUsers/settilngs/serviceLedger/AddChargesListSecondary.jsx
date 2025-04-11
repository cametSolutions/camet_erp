import { useEffect, useState } from "react";
import api from "../../../../api/api";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import TitleDiv from "@/components/common/TitleDiv";
import useFetch from "@/customHook/useFetch";

function AddChargesListSecondary() {
  const [additional, setAdditional] = useState([]);

  const { _id: cmp_id, type } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const { data, loading, refreshHook } = useFetch(
    `/api/sUsers/additionalcharges/${cmp_id}`
  );

  useEffect(() => {
    if (data) {
      setAdditional(data?.additionalCharges);
    }
  }, [data]);

  const handleDelete = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
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
          `/api/sUsers/deleteAdditionalCharge/${id}/${cmp_id}`,
          {
            withCredentials: true,
          }
        );
        refreshHook();
        Swal.fire({
          title: "Done!",
          text: `${res.data.message}`,
          icon: "success",
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: "Error!",
          text: `${error.response.data.message}`,
          icon: "error",
        });
      }
    }
  };

  return (
    <div className="">
      <TitleDiv
        loading={loading}
        title={"Additional Charges"}
        dropdownContents={[
          {
            title: "Add Charges",
            to: "/sUsers/additionalCharges",
            typeSpecific: true,
          },
        ]}
        from="/sUsers/settings"
      />
      <section
        className={`${
          loading && "pointer-events-none opacity-70"
        }  flex-1 antialiased  text-gray-600 h-screen overflow-hidden`}
      >
        <div className="flex flex-col h-full mt-3 mx-2 ">
          <div className="w-full ">
            {additional.length > 0 ? (
              <div className="space-y-2 shadow-lg">
                {additional.map((item, index) => (
                  <div key={index} className="bg-slate-100 p-4 rounded-md">
                    <div className="flex items-center justify-between border-b pb-2 mb-2">
                      <div className="font-bold text-sm">{item?.name}</div>
                      <div className="flex space-x-3">
                        <Link
                          to={`/sUsers/editAdditionalCharge/${item?._id}`}
                          className={`${
                            type !== "self" && "pointer-events-none opacity-55"
                          } text-blue-500 hover:text-blue-700`}
                        >
                          <FaEdit size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item?._id)}
                          className={`${
                            type !== "self" && "pointer-events-none opacity-55"
                          } text-red-500 hover:text-red-700`}
                        >
                          <MdDelete size={15} />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-4  text-sm">
                      <div>
                        <span className="text-gray-500">Tax:</span>{" "}
                        <span>{`${item?.taxPercentage || "0"} %`}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">HSN:</span>{" "}
                        <span>{item?.hsn || "Nil"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-8 text-gray-500">
                  No Additional Charges Found
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AddChargesListSecondary;
