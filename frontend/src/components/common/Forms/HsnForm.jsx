/* eslint-disable react/prop-types */

import { MdOutlinePlaylistAdd } from "react-icons/md";
import { MdDeleteSweep } from "react-icons/md";
import { RiArrowRightSFill } from "react-icons/ri";
import { IoIosArrowRoundBack } from "react-icons/io";

function HsnForm({
  navigate,
  hsn,
  setHsn,
  description,
  setDescription,
  tab,
  setTab,
  taxabilityType,
  setTaxabilityType,
  igstRate,
  setIgstRate,
  cgstRate,
  setCgstRate,
  sgstUtgstRate,
  setSgstUtgstRate,
  onValue,
  setOnValue,
  onQuantity,
  setOnQuantity,
  isRevisedChargeApplicable,
  rows,
  handleDeleteRow,
  handleAddRow,
  submitHandler,
  checkedValue,
  handleChangeCheck,
  handleRevisedChargeChange,
  isExemptOrNilRatedOrNonGST,
  handleChange,
}) {
  return (
    <div>
      <div className="flex-1 flex flex-col">
        <div className="bg-[#012A4A] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
          <IoIosArrowRoundBack
            onClick={() => navigate(-1)}
            className=" text-3xl cursor-pointer"
          />
          <p>Tax classification</p>
        </div>
        <section className=" bg-blueGray-50  ">
          <div className="w-full  px-4 mx-auto  pb-[30px] mt-5  ">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
              <div className="rounded-t bg-white mb-0 px-6 py-2">
                <div className="text-center flex justify-between">
                  {/* <h6 className="text-blueGray-700 text-xl font-bold">
                    Organization Information
                  </h6> */}
                  {/* <button
                    className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
                    type="button"
                    onClick={submitHandler}
                  >
                    Add
                  </button> */}
                </div>
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <form encType="multipart/form-data">
                  <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                    HSN / SAC Creation
                  </h6>
                  <div className="flex flex-wrap">
                    <div className="w-full lg:w-12/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          HSN & SAC
                        </label>
                        <input
                          value={hsn}
                          onChange={(e) => setHsn(e.target.value)}
                          type="text"
                          placeholder="HSN & SAC"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        />
                      </div>
                    </div>
                    <div className="w-full lg:w-12/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          Description
                        </label>
                        <input
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          type="email"
                          placeholder="Description"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center mt-8">
                    <div className="flex items-center mr-4">
                      <input
                        type="checkbox"
                        id="valueCheckbox"
                        className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                        checked={checkedValue === "onValue"}
                        onChange={() => {
                          handleChangeCheck("onValue");
                          setTab("onValue");
                        }}
                      />
                      <label
                        htmlFor="valueCheckbox"
                        className="ml-2 text-gray-700"
                      >
                        On Value
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="itemRateCheckbox"
                        className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                        checked={checkedValue === "onItemRate"}
                        onChange={() => {
                          handleChangeCheck("onItemRate");
                          setTab("onItemRate");
                        }}
                      />
                      <label
                        htmlFor="itemRateCheckbox"
                        className="ml-2 text-gray-700"
                      >
                        On Item Rate
                      </label>
                    </div>
                  </div>

                  {tab === "onValue" && (
                    <>
                      <div className="flex flex-wrap mt-12">
                        <div className="w-full lg:w-6/12 px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                              htmlFor="dr-cr"
                            >
                              Taxability Type
                            </label>
                            <select
                              value={taxabilityType}
                              onChange={(e) =>
                                setTaxabilityType(e.target.value)
                              }
                              id="dr-cr"
                              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            >
                              <option value="">Select Taxability Type</option>
                              <option value="exempt">Exempt </option>
                              <option value="nilRated">Nil Rated </option>
                              <option value="nonGst">Non GST</option>
                              <option value="taxable">Taxable </option>
                            </select>
                          </div>
                        </div>

                        <div className="w-full lg:w-6/12 px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              IGST Rate
                            </label>
                            <input
                              disabled={taxabilityType !== "taxable"}
                              type="number"
                              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                              value={igstRate}
                              onChange={(e) => setIgstRate(e.target.value)}
                              placeholder=" IGST Rate"
                            />
                          </div>
                        </div>
                        <div className="w-full lg:w-6/12 px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              CGST Rate
                            </label>
                            <input
                              disabled={taxabilityType !== "taxable"}
                              type="number"
                              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                              value={cgstRate}
                              onChange={(e) => setCgstRate(e.target.value)}
                              placeholder="CGST Rate"
                            />
                          </div>
                        </div>
                        <div className="w-full lg:w-6/12 px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              SGST/UTGST Rate
                            </label>
                            <input
                              disabled={taxabilityType !== "taxable"}
                              type="text"
                              className={`${
                                taxabilityType !== "taxable"
                                  ? "pointer-events-none"
                                  : ""
                              }border-0  px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150`}
                              value={sgstUtgstRate}
                              onChange={(e) => setSgstUtgstRate(e.target.value)}
                              placeholder="SGST/UTGST Rate"
                            />
                          </div>
                        </div>
                      </div>
                      <hr className="mt-2 mb-4 border-b-1 border-blueGray-300" />
                      <h3 className="text-blueGray-400 text-xs px-4 mt-3 mb-6 font-bold uppercase">
                        Cess Rate Details
                      </h3>
                      <div className="flex flex-wrap mt-2">
                        <div className="w-full lg:w-6/12 px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              Based On Value
                            </label>
                            <input
                              disabled={taxabilityType !== "taxable"}
                              value={onValue}
                              onChange={(e) => setOnValue(e.target.value)}
                              type="number"
                              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                              placeholder="0%"
                            />
                          </div>
                        </div>
                        <div className="w-full lg:w-6/12 px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              Based on Quantity
                            </label>
                            <input
                              disabled={taxabilityType !== "taxable"}
                              value={onQuantity}
                              onChange={(e) => setOnQuantity(e.target.value)}
                              type="number"
                              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                              placeholder="0/Unit"
                            />
                          </div>
                        </div>

                        <div className="mt-8">
                          <label
                            htmlFor="revisedChargeCheckbox"
                            className="inline-flex items-center"
                          >
                            <input
                              type="checkbox"
                              id="revisedChargeCheckbox"
                              className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                              checked={isRevisedChargeApplicable}
                              onChange={handleRevisedChargeChange}
                            />
                            <span className="ml-2 text-gray-700">
                              Applicable for Revised Charge
                            </span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {tab === "onItemRate" && (
                    <>
                      <hr className="mt-6 mb-1 border-b-1 border-blueGray-300" />
                      <div className=" w-full flex justify-end">
                        <RiArrowRightSFill />
                      </div>

                      <div
                        className="overflow-x-scroll mt-3"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "transparent transparent",
                        }}
                      >
                        <table className="min-w-full divide-y divide-gray-200  ">
                          <thead>
                            <tr>
                              <th className="px-1 py-3 bg-gray-50  text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider text-center">
                                Greater than
                              </th>

                              <th className="px-1 py-3 bg-gray-50  text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider text-center">
                                Upto
                              </th>
                              <th className="px-1 py-3 bg-gray-50  text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider text-center">
                                Taxability Type
                              </th>
                              <th
                                className={`px-1 py-3 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider text-center ${
                                  rows[0] &&
                                  isExemptOrNilRatedOrNonGST(
                                    rows[0].taxabilityType
                                  )
                                    ? "cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                IGST Rate
                              </th>
                              <th
                                className={`px-1 py-3 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider text-center ${
                                  rows[0] &&
                                  isExemptOrNilRatedOrNonGST(
                                    rows[0].taxabilityType
                                  )
                                    ? "cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                CGST Rate
                              </th>
                              <th
                                className={`px-1 py-3 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider text-center ${
                                  rows[0] &&
                                  isExemptOrNilRatedOrNonGST(
                                    rows[0].taxabilityType
                                  )
                                    ? "cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                SGST/UTGST Rate
                              </th>
                              <th
                                className={`px-1 py-3 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider text-center ${
                                  rows[0] &&
                                  isExemptOrNilRatedOrNonGST(
                                    rows[0].taxabilityType
                                  )
                                    ? "cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                Based On Value
                              </th>
                              <th
                                className={`px-1 py-3 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider text-center ${
                                  rows[0] &&
                                  isExemptOrNilRatedOrNonGST(
                                    rows[0].taxabilityType
                                  )
                                    ? "cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                Based On Quantity
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {rows.map((row, index) => (
                              <tr key={index}>
                                <td>
                                  <input
                                    disabled
                                    type="text"
                                    name="greaterThan"
                                    value={row.greaterThan}
                                    onChange={(e) => handleChange(index, e)}
                                    className="px-1 py-2 bg-blue-50 text-center text-xs"
                                    placeholder="0"
                                  />
                                </td>
                                <td>
                                  <input
                                    disabled={index < rows.length - 1}
                                    type="text"
                                    name="upto"
                                    value={row.upto}
                                    onChange={(e) => handleChange(index, e)}
                                    className="px-1 py-2 bg-blue-50 text-center text-xs"
                                    placeholder="1000"
                                  />
                                </td>
                                <td>
                                  <select
                                    name="taxabilityType"
                                    value={row.taxabilityType}
                                    onChange={(e) => handleChange(index, e)}
                                    className="px-6 py-2 bg-blue-50 text-xs"
                                  >
                                    <option value="">Select</option>
                                    <option value="Exempt">Exempt</option>
                                    <option value="Nil Rated">Nil Rated</option>
                                    <option value="Non GST">Non GST</option>
                                    <option value="Taxable">Taxable</option>
                                  </select>
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="igstRate"
                                    value={row.igstRate}
                                    onChange={(e) => handleChange(index, e)}
                                    disabled={
                                      isExemptOrNilRatedOrNonGST(
                                        row.taxabilityType
                                      ) || index < rows.length - 1
                                    }
                                    className="px-1 py-2  bg-blue-50 text-center text-xs"
                                    placeholder="IGST Rate"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="cgstRate"
                                    value={row.cgstRate}
                                    onChange={(e) => handleChange(index, e)}
                                    disabled={
                                      isExemptOrNilRatedOrNonGST(
                                        row.taxabilityType
                                      ) || index < rows.length - 1
                                    }
                                    className="px-1 py-2 bg-blue-50 text-center text-xs"
                                    placeholder="CGST Rate"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="sgstUtgstRate"
                                    value={row.sgstUtgstRate}
                                    onChange={(e) => handleChange(index, e)}
                                    disabled={
                                      isExemptOrNilRatedOrNonGST(
                                        row.taxabilityType
                                      ) || index < rows.length - 1
                                    }
                                    className="px-1 py-2 bg-blue-50 text-center text-xs"
                                    placeholder="SGST/UTGST Rate"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="basedOnValue"
                                    value={row.basedOnValue}
                                    onChange={(e) => handleChange(index, e)}
                                    disabled={
                                      isExemptOrNilRatedOrNonGST(
                                        row.taxabilityType
                                      ) || index < rows.length - 1
                                    }
                                    className="px-1 py-2 bg-blue-50 text-center text-xs"
                                    placeholder="0%"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="basedOnQuantity"
                                    value={row.basedOnQuantity}
                                    onChange={(e) => handleChange(index, e)}
                                    disabled={
                                      isExemptOrNilRatedOrNonGST(
                                        row.taxabilityType
                                      ) || index < rows.length - 1
                                    }
                                    className="px-1 py-2 bg-blue-50 text-center text-xs"
                                    placeholder="0/Unit"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="ml-1">
                        <button
                          type="button"
                          onClick={handleAddRow}
                          disabled={
                            rows.length === 0 ||
                            rows[rows.length - 1].upto === ""
                          }
                          className={`mt-4 bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded ${
                            rows.length === 0 ||
                            rows[rows.length - 1].upto === ""
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {/* Add Row */}
                          <MdOutlinePlaylistAdd />
                        </button>

                        <button
                          type="button"
                          disabled={rows.length <= 1}
                          className={`${
                            rows.length <= 1
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          } bg-red-500 text-white ml-3 px-2 py-1 rounded hover:bg-red-600`}
                          onClick={handleDeleteRow}
                        >
                          <MdDeleteSweep />
                        </button>
                      </div>
                      <div className="mt-8">
                        <label
                          htmlFor="revisedChargeCheckbox"
                          className="inline-flex items-center"
                        >
                          <input
                            type="checkbox"
                            id="revisedChargeCheckbox"
                            className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                            checked={isRevisedChargeApplicable}
                            onChange={handleRevisedChargeChange}
                          />
                          <span className="ml-2 text-gray-700">
                            Applicable for Revised Charge
                          </span>
                        </label>
                      </div>
                    </>
                  )}

                  <div className="flex items-center  gap-0 mt-4 m-4 relative "></div>
                  <button
                    className="bg-pink-500 mt-4  w-20 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
                    type="button"
                    onClick={submitHandler}
                  >
                    Update
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HsnForm;
