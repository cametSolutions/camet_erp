import { useState } from "react";
import { FaArrowDown, FaArrowUp, FaEdit, FaTrash } from "react-icons/fa";

const ProductSubDetailsForm = () => {
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle submission logic here
  };

  return (
    <div className="  mt-1    ">
      <h1 className="text-sm font-bold mb-6  text-gray-800 px-6 pt-6 ">
        ADD YOUR DESIRED BRAND
      </h1>
      <div className="flex items-center gap-1 w-full px-6  ">
        <input
          type="text"
          placeholder="Enter your brand name"
          className="w-full md:w-1/2  p-1  border border-gray-300 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-gray-800 text-white px-4 py-1 rounded "
          >
            SUBMIT
          </button>
        </div>
      </div>
      <section className="py-1 bg-blueGray-50 px-1">
        <div className="w-full  mb-12 xl:mb-0  mt-12">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            <div className="rounded-t mb-0 px-4 py-3 border-0">
              <div className="flex flex-wrap items-center">
                <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                  <h3 className="font-semibold text-base text-blueGray-700">
                    Brands
                  </h3>
                </div>
                <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                  <button
                    className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                  >
                    See all
                  </button>
                </div>
              </div>
            </div>

            <div className="block w-full overflow-x-auto">
              <table className="items-center bg-transparent w-full border-collapse">
                <thead>
                  <tr>
                    <th className=" w-4/6  px-6 text-left bg-blueGray-50 text-blueGray-500 border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold">
                      Name
                    </th>
                    <th className="px-6 w-1/6 text-center bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold">
                      Edit
                    </th>
                    <th className="px-6 w-1/6 text-right bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold">
                      Delete
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <th className="px-6 text-left col-span-2 text-wrap border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-blueGray-700">
                      /argon/
                    </th>
                    <td className="text-center flex justify-center px-6 border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <p className="text-blue-500" ><FaEdit size={15}/></p>
                    </td>
                    <td className="text-right  px-6 border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <p className="flex justify-end mr-4 text-red-500"><FaTrash/></p>
                    </td>
                  </tr>
                  <tr>
                    <th className="px-6 text-left col-span-2 text-wrap border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-blueGray-700">
                      /argon/
                    </th>
                    <td className="text-center flex justify-center px-6 border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <p className="text-blue-500" ><FaEdit size={15}/></p>
                    </td>
                    <td className="text-right  px-6 border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <p className="flex justify-end mr-4 text-red-500"><FaTrash/></p>
                    </td>
                  </tr>
                  <tr>
                    <th className="px-6 text-left col-span-2 text-wrap border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-blueGray-700">
                      /argon/
                    </th>
                    <td className="text-center flex justify-center px-6 border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <p className="text-blue-500" ><FaEdit size={15}/></p>
                    </td>
                    <td className="text-right  px-6 border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <p className="flex justify-end mr-4 text-red-500"><FaTrash/></p>
                    </td>
                  </tr>
                  <tr>
                    <th className="px-6 text-left col-span-2 text-wrap border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-blueGray-700">
                      /argon/
                    </th>
                    <td className="text-center flex justify-center px-6 border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <p className="text-blue-500" ><FaEdit size={15}/></p>
                    </td>
                    <td className="text-right  px-6 border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <p className="flex justify-end mr-4 text-red-500"><FaTrash/></p>
                    </td>
                  </tr>
                  <tr>
                    <th className="px-6 text-left col-span-2 text-wrap border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-blueGray-700">
                      /argon/
                    </th>
                    <td className="text-center flex justify-center px-6 border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <p className="text-blue-500" ><FaEdit size={15}/></p>
                    </td>
                    <td className="text-right  px-6 border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <p className="flex justify-end mr-4 text-red-500"><FaTrash/></p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      );
    </div>
  );
};

export default ProductSubDetailsForm;
