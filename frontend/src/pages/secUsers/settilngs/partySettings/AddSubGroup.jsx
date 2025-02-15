import { useSelector } from "react-redux";
import TitleDiv from "../../../../components/common/TitleDiv";
import { useEffect, useState } from "react";
import api from "../../../../api/api";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import Swal from "sweetalert2";

const AddSubGroup = () => {
  const [accountGroups, setAccountGroups] = useState([]);
  const [subGroups, setSubGroups] = useState([]);
  const [edit, setEdit] = useState({
    id: "",
    enabled: false,
  });
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAccountGroup, setSelectedAccountGroup] = useState("");

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accountGroupsRes, subGroupsRes] = await Promise.all([
        api.get(`/api/sUsers/getAccountGroups/${cmp_id}`, {
          withCredentials: true,
        }),
        api.get(`/api/sUsers/getSubGroup/${cmp_id}`, {
          withCredentials: true,
        }),
      ]);

      setAccountGroups(accountGroupsRes.data.data);
      setSubGroups(subGroupsRes.data.data);

      if (accountGroupsRes.data.data.length > 0) {
        setSelectedAccountGroup(accountGroupsRes.data.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cmp_id]);

  const handleSubmit = async (value) => {
    if (value.trim() === "" || !selectedAccountGroup) {
      toast.error("Please select an account group and enter a subgroup name.");
      return;
    }

    const formData = {
      accountGroup: selectedAccountGroup,
      subGroup: value,
    };

    try {
      setLoading(true);

      await api.post(`/api/sUsers/addSubGroup/${cmp_id}`, formData, {
        withCredentials: true,
      });

      setValue(""); // Clear input after submission
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to add subgroup");
    } finally {
      setLoading(false);
    }
  };

  const editSubGroup = async (id, value) => {
    const formData = {
      accountGroup: selectedAccountGroup,
      subGroup: value,
    };

    try {
      setLoading(true);

      await api.patch(`/api/sUsers/editSubGroup/${id}/${cmp_id}`, formData, {
        withCredentials: true,
      });

      setValue(""); // Clear input after submission
      fetchData();
      setEdit({
        id: "",
        enabled: false,
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to add subgroup");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, subGroup, acc_id) => {
    setEdit({
      id,

      enabled: true,
    });
    setValue(subGroup);

    setSelectedAccountGroup(acc_id);
  };

  const deleteSubDetails = async (id) => {
    try {
      // Show a confirmation dialog
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete this . This action cannot be undone!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      // If the user confirms the deletion
      if (result.isConfirmed) {
        setLoading(true);
        const res = await api.delete(
          `/api/sUsers/deleteSubGroup/${id}/${cmp_id}`,
          {
            withCredentials: true,
          }
        );

        // Show a success message
        Swal.fire("Deleted!", `The sub group has been deleted.`, "success");
        fetchData();

        // You might want to update your local state here
      }
    } catch (error) {
      console.log(error);

      // Show an error message
      Swal.fire(
        "Error",
        error.response?.data?.message || "An error occurred while deleting",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      <TitleDiv
        title="Add Sub Group"
        from="/sUsers/partySettings"
        loading={loading}
      />
      <div
        className={`${
          loading && "opacity-90 pointer-events-none "
        }  sticky top-0`}
      >
        <div className="flex flex-col justify-center sticky top-0 z-10">
          <div className="flex justify-center items-center flex-col bg-[#457b9d] py-20 sm:py-14">
            <h2 className="font-bold uppercase text-white">
              ADD YOUR DESIRED Sub group
            </h2>

            <div className="absolute left-2 top-2">
              <select
                value={selectedAccountGroup}
                onChange={(e) => setSelectedAccountGroup(e.target.value)}
                className="w-full bg-[#457b9d] text-white sm:max-w-sm md:max-w-sm text-sm font-bold py-2 px-3 cursor-pointer no-focus-box border-none !border-b"
              >
                {accountGroups.length > 0 ? (
                  accountGroups.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item?.accountGroup}
                    </option>
                  ))
                ) : (
                  <option value="">Select account group</option>
                )}
              </select>
            </div>

            <div className="relative w-4/6 sm:w-2/6">
              <input
                type="text"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(value);
                  }
                }}
                placeholder="Enter your sub group name"
                className="w-full p-1 text-black border border-gray-300 rounded-full mt-3 text-center px-7"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />

              {value && (
                <button
                  onClick={() => {
                    setValue("");
                    setEdit({ id: "", enabled: false });
                  }}
                  className="absolute right-3 top-1/2 bottom-1/2 transform -translate-y-1/2  text-black rounded-full text-xs"
                >
                  <IoIosCloseCircle />
                </button>
              )}
            </div>

            <button
              disabled={loading}
              onClick={
                edit?.enabled
                  ? () => editSubGroup(edit.id, value)
                  : () => handleSubmit(value)
              }
              className="bg-gray-800 text-white px-6 py-1 rounded-full mt-3 text-sm font-bold"
            >
              {edit?.enabled ? "Update" : "Submit"}{" "}
            </button>
          </div>
          <div className="h-3 bg-gray-100"></div>
        </div>
      </div>

      <section
        className={` ${
          loading && "opacity-50 "
        }  overflow-y-scroll h-[calc(100vh-337px)] sm:h-[calc(100vh-291px)] px-4 scrollbar-thin`}
      >
        <div className="mt-2">
          {subGroups?.length > 0 && !loading ? (
            subGroups.map((el) => (
              <div
                key={el._id}
                className="flex items-center justify-between border-t-0 align-middle  whitespace-nowrap px-2 py-4 mb-2 border-b cursor-pointer hover:bg-slate-100 hover:translate-y-[1px]"
              >
                <div className=" text-left text-wrap text-blueGray-700 text-sm font-bold text-gray-500">
                  {el?.subGroup}
                  <p className="text-xs font-semibold mt-1">
                    {el?.accountGroup_id?.accountGroup}
                  </p>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div className=" cursor-pointer text-center flex justify-center ">
                    <p
                      onClick={() =>
                        handleEdit(
                          el._id,
                          el?.subGroup,
                          el?.accountGroup_id?._id
                        )
                      }
                      className="text-blue-500"
                    >
                      <FaEdit size={15} />
                    </p>
                  </div>
                  <div className=" cursor-pointer text-right ">
                    <button
                      disabled={loading || edit?.id === el._id}
                      onClick={() => deleteSubDetails(el._id)}
                      className="flex justify-end mr-4 text-red-500"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 font-bold  whitespace-nowrap p-4 ">
              {!loading && <p>Data not found</p>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AddSubGroup;
