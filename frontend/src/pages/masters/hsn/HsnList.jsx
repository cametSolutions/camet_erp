import { useEffect, useState } from "react";
import api from "../../../api/api";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";

import TitleDiv from "@/components/common/TitleDiv";

function HsnList() {
  const [hsn, setHsn] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);

  ///secondary organization id
  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg?._id
  );

  useEffect(() => {
    const fetchHsn = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/sUsers/fetchHsn/${orgId}`, {
          withCredentials: true,
        });

        setHsn(res.data.data);

      } catch (error) {
        console.log(error);
      }finally {
        setLoading(false);
      }
    };
    fetchHsn();
  }, [orgId, refresh]);

  const handleDelete = async (hsnId) => {
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
          `/api/sUsers/deleteHsn/${hsnId}`,

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
          text: `${error.response.data.message}`,
          icon: "error",
        });
      }
    }
  };

  return (
    <section className=" antialiased  text-gray-600     ">
      <div className="flex flex-col h-full ">
        {/* <!-- Table --> */}
        <div className="w-full   bg-white shadow-lg rounded-sm ">
          <TitleDiv
          loading={loading}
            title={"HSN List"}
            from="/sUsers/StockItem"
            dropdownContents={[
              {
                title: "Add Hsn",
                to: "/sUsers/hsn",
              },
            ]}
          />
          {/* <div className="p-5 mt-2"> */}
            <div className="overflow-x-auto ">
              {hsn.length > 0 ? (
                <div className="text-sm divide-y-4 divide-gray-100   ">
                  {hsn.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-6 shadow-lg p-5 bg-slate-50 mb-2 "
                    >
                      <div className="flex-1 flex items-center gap-2">
                        <div className="font-bold">{item.hsn}</div>
                        <div className="text-gray-500 font-semibold">({item.igstRate}%)</div>
                      </div>
                      <div className="flex gap-5">
                        <Link
                          to={`/sUsers/editHsn/${item._id}`}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FaEdit />
                        </Link>
                        <span
                          onClick={() => handleDelete(item._id)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <MdDelete />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">No HSN found</div>
              )}
            </div>
          {/* </div> */}
        </div>
      </div>
    </section>
  );
}

export default HsnList;
