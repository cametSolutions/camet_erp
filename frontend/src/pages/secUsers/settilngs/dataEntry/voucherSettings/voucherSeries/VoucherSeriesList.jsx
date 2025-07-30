import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import TitleDiv from "@/components/common/TitleDiv";
import { formatVoucherType } from "../../../../../../../utils/formatVoucherType";
import { useSelector } from "react-redux";
import useFetch from "@/customHook/useFetch";
import { MdOutlineInsertLink } from "react-icons/md";

import { RiDeleteBin6Fill } from "react-icons/ri";
import DeleteDialog from "@/components/common/modal/DeleteDialog";
import api from "@/api/api";

function VoucherSeriesList() {
  const [series, setSeries] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const voucherType = location?.state?.from;
 


  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const { data: apiData, loading } = useFetch(
    `/api/sUsers/getSeriesByVoucher/${cmp_id}?voucherType=${voucherType}`
  );

  useEffect(() => {
    if (apiData) {
      setSeries(apiData?.series || []);
    }
  }, [apiData]);

  // Inside the component
  const handleDelete = async (series) => {
    const { _id: seriesId, isDefault } = series;

    if (isDefault) {
      alert("Cannot delete default series");
      return;
    }
    try {
      const payload = {
        voucherType,
        seriesId,
      };
      await api.delete(`/api/sUsers/deleteVoucherSeriesById/${cmp_id}`, {
        data: payload,
        withCredentials: true,
      });
      setSeries((prev) => prev.filter((s) => s._id !== seriesId));
    } catch (error) {
      console.error("Failed to delete series:", error);
    }
  };

  const handleEditClick = (series) => {
    navigate(`/sUsers/editVoucherSeries`, {
      state: {
        series,
        from: voucherType,
        mode: "edit",
      },
    });
  };

  const formatNumber = (num, width) => {
  return num.toString().padStart(width, '0');
};

  return (
    <section className="flex-1 text-gray-600">
      <TitleDiv
        title={`${formatVoucherType(voucherType)} Series List`}
        from="/sUsers/VoucherSeriesSettings"
        dropdownContents={[
          {
            title: "Add Series",
            to: "/sUsers/createVoucherSeries",
            from: voucherType,
          },
        ]}
        loading={loading}
      />

      <div className="    text-sm p-2  ">
        {series.length > 0 ? (
          <div className="space-y-2 p-2 ">
            {series.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-sm shadow-md py-6 px-5 border"
              >
                <div className="flex justify-between ">
                  <div className="flex items-center  ">
                    <div className="flex items-start gap-4">
                      <h3 className="text-sm font-bold text-gray-900 flex justify-center items-center gap-4">
                        <MdOutlineInsertLink rotate={90} size={23} />
                      </h3>
                      <div>
                        <p className="font-bold">{item?.seriesName}</p>
                        <p className="text-xs font-bold mt-1 text-gray-400">
                          {item?.prefix}
                         {formatNumber(item?.currentNumber, item?.widthOfNumericalPart)}
                          {item?.suffix}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 sm:text-lg ">
                    <div className="flex items-center space-x-3 ">
                      <button
                        onClick={() => {
                          handleEditClick(item);
                        }}
                        className="text-blue-500 hover:text-green-700"
                      >
                        <FaEdit />
                      </button>

                      <DeleteDialog
                        onConfirm={() => handleDelete(item)}
                        title="Delete this series?"
                        description={`This will permanently delete "${item.seriesName}".`}
                      >
                        <button className="text-red-500 hover:text-green-700">
                          <RiDeleteBin6Fill />
                        </button>
                      </DeleteDialog>
                    </div>
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

export default VoucherSeriesList;
