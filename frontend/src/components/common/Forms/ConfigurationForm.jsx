/* eslint-disable react/prop-types */
import EditDespatchDetails from "../EditDespatchDetails";

function ConfigurationForm({
  org,
  submitHandler,
  setSelectedBank,
  selectedBank,
  bank,
  enableBillToShipTo,
  setEnableBillToShipTo,
  tab,
  setTab,
  handleTermsChange,
  termsInput,
  despatchDetails,
  updateDespatchDetails,
  termsList,
  setTaxInclusive,
  taxInclusive
}) {
  return (
    <div>
      <div className="w-full lg:w-8/12 px-4 mx-auto pb-[30px] md:mt-5 ">
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
          <div className="rounded-t bg-white mb-0 px-4 py-2">
            <div className="text-center flex justify-between">
              <h6 className="text-blueGray-700 text-xl font-bold mt-4 px-1">
                Order Configurations
              </h6>
            </div>
          </div>
          <div className="w-auto px-5 md:px-12 md:ml-2 flex justify-between items-center mt-6">
            <button
              type="button"
              className="text-xs font-semibold  bg-violet-500 p-1.5 text-white rounded-sm px-3"
            >
              {org.name}
            </button>

            <button
              className="bg-pink-500 mt-4 ml-4 w-20 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
              type="button"
              onClick={submitHandler}
            >
              Update
            </button>
          </div>
          <div className="flex-auto px-1 lg:px-10 py-10 pt-0 mt-5">
            <form>
              <div className="flex flex-wrap">
                {/* Bank Selection */}
                <div className="w-full lg:w-12/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="bank"
                    >
                      Bank
                    </label>
                    <select
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                      onChange={(e) => setSelectedBank(e.target.value)}
                      value={selectedBank}
                    >
                      <option value="">Select a Bank</option>
                      {bank?.length > 0 ? (
                        bank?.map((el, index) => (
                          <option key={index} value={el._id}>
                            {el.bank_name}
                          </option>
                        ))
                      ) : (
                        <option>No banks available</option>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center  mt-5 px-4 gap-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold "
                      htmlFor="termsInput"
                    >
                      Enable / Ship To
                    </label>
                    <div className="flex items-center mr-4">
                      <input
                        type="checkbox"
                        id="valueCheckbox"
                        className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                        checked={enableBillToShipTo === true}
                        onChange={() => {
                          setEnableBillToShipTo(!enableBillToShipTo);
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center  mt-5 px-4 gap-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold "
                      htmlFor="termsInput"
                    >
                     Tax Inclusive
                    </label>
                    <div className="flex items-center ml-4">
                      <input
                        type="checkbox"
                        id="valueCheckbox"
                        className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                        checked={taxInclusive === true}
                        onChange={() => {
                          setTaxInclusive(!taxInclusive);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="w-full lg:w-12/12 px-4 mt-5 " >
                  <div className="relative w-full mb-3">
                    {/* <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="termsInput"
                    >
                      Terms and Condition
                    </label> */}

                    <div className="flex mt-7 justify-center  ">
                      <div className=" border-b border-solid border-[#0066ff43]  ">
                        <button
                          type="button"
                          onClick={() => setTab("terms")}
                          className={` ${
                            tab === "terms" &&
                            "border-b border-solid border-black"
                          } py-2 px-5 mr-10  text-sm leading-7 text-headingColor font-semibold `}
                        >
                          Terms
                        </button>
                        <button
                          type="button"
                          onClick={() => setTab("despatchDetails")}
                          className={` ${
                            tab === "despatchDetails" &&
                            "border-b border-solid border-black"
                          } py-2 px-5  text-sm leading-7 text-headingColor font-semibold `}
                        >
                          Despatch Details
                        </button>
                      </div>
                    </div>
                    {tab == "terms" ? (
                      <textarea
                        className="border-0 mt-8 px-3 pb-12 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                        onChange={handleTermsChange}
                        value={termsInput}
                        placeholder="Enter terms and conditions"
                      />
                    ) : (
                      <EditDespatchDetails
                        despatchDetails={despatchDetails}
                        updateDespatchDetails={updateDespatchDetails}
                      />
                    )}
                  </div>
                </div>
              </div>
              {/* <button
                className="bg-pink-500 mt-4 ml-4 w-20 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
                type="button"
                onClick={submitHandler}
              >
                Update
              </button> */}
            </form>
            {/* Display the list of terms with points */}

            {tab === "terms" && (
              <ul className="mt-4 px-4">
                {termsList.map((term, index) => (
                  <li key={index} className="mb-2 text-xs text-gray-500">
                    <span className="font-bold">{index + 1}.</span> {term}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfigurationForm;
