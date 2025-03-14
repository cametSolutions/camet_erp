/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import useFetch from "../../../../../customHook/useFetch";
import { useSelector } from "react-redux";
import { BarLoader } from "react-spinners";
import api from "../../../../../api/api";
import { useDispatch } from "react-redux";
import { updateConfiguration } from "../../../../../../slices/secSelectedOrgSlice";
import { IoIosCloseCircleOutline } from "react-icons/io";


export default function SelectBankModal({ showModal = true, setShowModal }) {
  const [selectedBank, setSelectedBank] = React.useState("");
  const [bankList, setBankList] = React.useState([]);
  const [submitLoading, setSubmitLoading] = React.useState(false);

  const dispatch = useDispatch();

  const { _id: cmp_id, configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  

  const { data, loading, error } = useFetch(`/api/sUsers/fetchBanks/${cmp_id}`);

  useEffect(() => {
    if (data) {
      setBankList(data.data);
    }
    if (configurations?.length > 0) {
      setSelectedBank(configurations[0].bank || "");
    }
  }, [data, configurations]);

  const handleBankChange = (event) => {
    setSelectedBank(event.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedBank) {
      toast.error("Please select a bank account.");
      return;
    }

    const data = { bankAccount: selectedBank };

    try {
    setSubmitLoading(true);

      const res = await api.put(
        `/api/sUsers/updateBankAccount/${cmp_id}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success(res.data.message);
      setShowModal(false);
      dispatch(updateConfiguration(res.data.data));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update bank account."
      );
      console.error(error);
    }finally{
      setSubmitLoading(false);
    }
  };

  return (
    <>
      {showModal ? (
        <div className="relative">
          <div className="sm:w-[calc(100%-250px)] sm:ml-[250px] justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-md">
              {loading || submitLoading && (
                <BarLoader
                  color="#9900ff"
                  width="100%"
                  className="absolute top-1 z-50 rounded-lg"
                />
              )}
              <div className="border-0 rounded-b-lg shadow-lg relative flex flex-col w-full bg-gray-100 outline-none focus:outline-none">
                <div className=" relative font-bold p-2 px-4 bg-[#46a9c1] text-sm text-white ">
                  Select a Bank Account
                <IoIosCloseCircleOutline className="cursor-pointer absolute top-2 right-1" onClick={() => setShowModal(false)} size={20} color="white "/>
                </div>
                <div className="p-6  ">
                  {error && (
                    <p className="text-red-500 text-sm mb-4">
                      {error.response?.data?.message ||
                        "Failed to fetch banks."}
                    </p>
                  )}
                  <div className="mb-4">
                    <label
                      htmlFor="bankSelect"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Bank Account
                    </label>
                    <select
                      id="bankSelect"
                      value={selectedBank || ""}
                      onChange={handleBankChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      disabled={loading || error}
                    >
                      <option value="" disabled>
                        {loading
                          ? "Loading bank accounts..."
                          : "Select a bank account"}
                      </option>
                      {bankList?.length > 0 ? (
                        bankList
                          ?.filter((bank) => bank?.bank_name !== "null")
                          ?.map((bank, index) => (
                            <option key={index} value={bank?._id}>
                              {bank?.bank_name?.length > 30
                                ? bank?.bank_name?.substring(0, 30) + "..."
                                : bank?.bank_name}
                            </option>
                          ))
                      ) : (
                        <option value="" disabled>
                          No banks found.
                        </option>
                      )}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end p-4 border-t border-solid border-gray-200 rounded-b">
              
                  <button
                    className=" w-full bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || bankList.length === 0}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </div>
      ) : null}
    </>
  );
}
