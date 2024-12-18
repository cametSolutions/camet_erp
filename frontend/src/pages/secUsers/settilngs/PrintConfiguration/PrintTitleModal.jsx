/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import CustomBarLoader from "../../../../components/common/CustomBarLoader";

function PrintTitleModal({ isOpen, onClose, onSubmit, data = {}, loading }) {
  const [printTitle, setPrintTitle] = useState("");
  useEffect(() => {
    setPrintTitle(data?.printTitle);
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if(!printTitle) {
      window.alert("Please enter print title");
      return
    }
    onSubmit(printTitle);
    setPrintTitle("");
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="relative">
      <div className="sm:w-[calc(100%-150px)] sm:ml-[150px] justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative  my-6  w-[330px] sm:w-[400px] bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-[#0a9396] text-white">
            <h3 className="text-lg font-bold">Enter Print Title</h3>
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={onClose}
            >
              &#x2715;
            </button>
          </div>
          {loading && <CustomBarLoader />}

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <label
                htmlFor="printTitle"
                className="block text-sm font-medium text-gray-700 "
              >
                Print Title
              </label>
              <input
                type="text"
                id="printTitle"
                value={printTitle}
                onChange={(e) => setPrintTitle(e.target.value)}
                placeholder="Enter title"
                className="mt-3  block w-full p-2 rounded-md    shadow-xl sm:text-sm border border-gray-100"
              />
            </div>
            <div className="flex justify-end ">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </div>
  );
}

export default PrintTitleModal;
