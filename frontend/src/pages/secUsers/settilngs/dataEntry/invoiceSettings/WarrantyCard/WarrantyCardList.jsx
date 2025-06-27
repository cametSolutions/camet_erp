import TitleDiv from "@/components/common/TitleDiv";
import useFetch from "@/customHook/useFetch";
import { useSelector } from "react-redux";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import DeleteDialog from "@/components/common/modal/DeleteDialog";
import api from "@/api/api";
import { useState } from "react";

const WarrantyCardList = () => {

  const [submitLoading, setSubmitLoading] = useState(false);
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const { data, loading, refreshHook } = useFetch(
    `/api/sUsers/getWarrantyCards/${cmp_id}`
  );
  const warrantyCards = data?.data || [];
  const navigate = useNavigate();

  const handleDelete = async (cardId) => {
    try {
      setSubmitLoading(true);
      await api.delete(
        `/api/sUsers/deleteWarrantyCard/${cardId}/${cmp_id}`,
        {
          withCredentials: true,
        }
      );
      refreshHook();
    } catch (error) {
      console.error("Failed to delete series:", error);
    }finally{
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <TitleDiv
        loading={loading || submitLoading}
        title="Warranty Cards"
        dropdownContents={[
          {
            title: "Add warranty card",
            to: "/sUsers/addWarrantyCard",
          },
        ]}
      />

      {warrantyCards.length === 0 ? (
        <div className="text-center text-gray-500 p-8 mt-20  font-bold">
          <p>!OOps.. No warranty cards found.</p>
        </div>
      ) : (
        <div className="">
          {warrantyCards.map((card) => (
            <div
              key={card._id}
              className="bg-white mb-3 rounded-xs shadow-md border border-gray-200 p-4 py-5 cursor-pointer hover:shadow-lg transition-shadow duration-200 flex items-center space-x-3 mx-1 mt-2 justify-between"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className=" font-medium text-gray-600">{card.name}</h3>
              </div>

              <div className="flex items-center gap-5">
                <FaEdit
                  onClick={() =>
                    navigate(`/sUsers/editWarrantyCard`, {
                      state: { card },
                    })
                  }
                  color="blue"
                />

                <DeleteDialog
                  onConfirm={() => handleDelete(card._id)}
                  title="Delete this warranty card?"
                  description={`This will permanently delete "${card.name}".`}
                >
                  <button className="text-red-500 hover:text-green-700">
                    <MdDelete color="red" />
                  </button>
                </DeleteDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default WarrantyCardList;
