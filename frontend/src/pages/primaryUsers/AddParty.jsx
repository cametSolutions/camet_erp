import Sidebar from "../../components/homePage/Sidebar";
import { IoReorderThreeSharp } from "react-icons/io5";
import { useState, useEffect } from "react";
import { accountGroups } from "../../../constants/accountGroups";
import { toast } from "react-toastify";
import api from "../../api/api";
import { useSelector } from "react-redux";

function AddParty() {
  const [tab, setTab] = useState("business");
  const [accountGroup, setAccountGroup] = useState("");
  const [partyName, setPartyName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailID, setEmailID] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [panNo, setPanNo] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [creditPeriod, setCreditPeriod] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [openingBalanceType, setOpeningBalanceType] = useState("");
  const [openingBalanceAmount, setOpeningBalanceAmount] = useState("");
  const [cpm_id, setCmp_id] = useState("");
  const [Primary_user_id, setPrimary_user_id] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);


  const companytId = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );
  const user = JSON.parse(localStorage.getItem("pUserData"));
  const userId = user._id;
  useEffect(() => {
    setCmp_id(companytId);
    setPrimary_user_id(userId);
  }, []);

  const submitHandler = async () => {
    if (
      [
        accountGroup,
        partyName,
        emailID,
        // gstNo,
        // panNo,
        // billingAddress,
        // openingBalanceType,
        // shippingAddress,
      ].some((field) => field.trim() === "")
    ) {
      toast.error("All fields are required");
      return;
    }
    if (
      mobileNumber===""
    ) {
      toast.error("All fields are required");
      return;
    }

    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(emailID)) {
      toast.error("Invalid email address");
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      toast.error("Mobile number must be 10 digits");
      return;
    }

    const gstRegex = /^[0-9A-Za-z]{15}$/;

    if (gstNo && !gstRegex.test(gstNo)) {
      toast.error("Invalid GST number");
      return;
    }

    if (panNo && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNo)) {
      toast.error("Invalid PAN number");
      return;
    }

    const formData = {
      cpm_id,
      Primary_user_id,
      accountGroup,
      partyName,
      mobileNumber,
      emailID,
      gstNo,
      panNo,
      billingAddress,
      shippingAddress,
      creditPeriod,
      creditLimit,
      openingBalanceType,
      openingBalanceAmount,
    };

    console.log(formData);

    try {
      const res = await api.post("/api/pUsers/addParty", formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
      setCmp_id("");
      setPrimary_user_id("");
      setAccountGroup("");
      setPartyName("");
      setMobileNumber("");
      setEmailID("");
      setGstNo("");
      setPanNo("");
      setBillingAddress("");
      setShippingAddress("");
      setCreditPeriod("");
      setCreditLimit("");
      setOpeningBalanceType("");
      setOpeningBalanceAmount("");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };

  return (
    <div className="flex">
      <div>
        <Sidebar TAB={"addParty"} showBar={showSidebar}  />
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-y-scroll">
        <div className="bg-[#012A4A] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
          <IoReorderThreeSharp
            onClick={handleToggleSidebar}
            className="block md:hidden text-3xl"
          />
          <p>Add Party Details </p>
        </div>
        <section className=" bg-blueGray-50 h-screen overflow-y-scroll ">
          <div className="w-full lg:w-8/12 px-4 mx-auto  pb-[30px] mt-5  ">
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
                    Add New Party Details
                  </h6>
                  <div className="flex flex-wrap">
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="account-group"
                        >
                          Account Group
                        </label>
                        <select
                          id="account-group"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          value={accountGroup}
                          onChange={(e) => setAccountGroup(e.target.value)}
                        >
                          <option value="">Select Account Group</option>
                          {accountGroups.map((group, index) => (
                            <option key={index} value={group}>
                              {group}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          Party Name
                        </label>
                        <input
                          type="text"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          value={partyName}
                          onChange={(e) => setPartyName(e.target.value)}
                          placeholder="Party Name"
                        />
                      </div>
                    </div>
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          Mobile Number
                        </label>
                        <input
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          type="number"
                          placeholder="Mobile Number"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        />
                      </div>
                    </div>
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          Email ID
                        </label>
                        <input
                          value={emailID}
                          onChange={(e) => setEmailID(e.target.value)}
                          type="email"
                          placeholder="Email ID"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center ">
                    <div className="mt-[50px]  border-b border-solid border-[#0066ff43]  ">
                      <button
                      type="button"

                        onClick={() => setTab("business")}
                        className={` ${
                          tab === "business" &&
                          "border-b border-solid border-black"
                        } py-2 px-5 mr-10  text-[16px] leading-7 text-headingColor font-semibold `}
                      >
                        Business Info
                      </button>
                      <button
                      type="button"
                        onClick={() => setTab("credit")}
                        className={` ${
                          tab === "credit" &&
                          "border-b border-solid border-black"
                        } py-2 px-5  text-[16px] leading-7 text-headingColor font-semibold `}
                      >
                        Credit Info
                      </button>
                    </div>
                  </div>

                  {tab === "business" && (
                    <div className="flex flex-wrap mt-12">
                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label
                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                            htmlFor="grid-password"
                          >
                            Gst.No
                          </label>
                          <input
                            type="text"
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            value={gstNo}
                            onChange={(e) => setGstNo(e.target.value)}
                            placeholder="Gst.No"
                          />
                        </div>
                      </div>
                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label
                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                            htmlFor="grid-password"
                          >
                            Pan.No
                          </label>
                          <input
                            type="text"
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            value={panNo}
                            onChange={(e) => setPanNo(e.target.value)}
                            placeholder=" Pan.No"
                          />
                        </div>
                      </div>
                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label
                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                            htmlFor="grid-password"
                          >
                            Billing Address
                          </label>
                          <textarea
                            value={billingAddress}
                            onChange={(e) => setBillingAddress(e.target.value)}
                            type="text"
                            placeholder={`street address\nState\nPin Code\nCity`}
                            className="border-0 h-32 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          />
                        </div>
                      </div>
                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label
                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                            htmlFor="grid-password"
                          >
                            Shipping Address
                          </label>
                          <textarea
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            placeholder={`street address\nState\nPin Code\nCity`}
                            className="border-0  h-32 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === "credit" && (
                    <>
                      <div className="flex flex-wrap mt-12">
                        <div className="w-full lg:w-6/12 px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              Credit Period
                            </label>
                            <input
                              value={creditPeriod}
                              onChange={(e) => setCreditPeriod(e.target.value)}
                              type="number"
                              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                              placeholder=" Credit Period"
                            />
                          </div>
                        </div>
                        <div className="w-full lg:w-6/12 px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              Credit Limit
                            </label>
                            <input
                              value={creditLimit}
                              onChange={(e) => setCreditLimit(e.target.value)}
                              type="number"
                              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                              placeholder="  Credit Limit"
                            />
                          </div>
                        </div>
                      </div>
                      <hr className="mt-2 mb-4 border-b-1 border-blueGray-300" />
                      <h3 className="text-blueGray-400 text-xs px-4 mt-3 mb-6 font-bold uppercase">
                        Opening Balance
                      </h3>

                      <div className="flex flex-wrap mt-2">
                        <div className="w-full lg:w-6/12 px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                              htmlFor="dr-cr"
                            >
                              DR/CR
                            </label>
                            <select
                              value={openingBalanceType}
                              onChange={(e) =>
                                setOpeningBalanceType(e.target.value)
                              }
                              id="dr-cr"
                              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            >
                              <option value="">Select DR/CR</option>
                              <option value="DR">DR</option>
                              <option value="CR">CR</option>
                            </select>
                          </div>
                        </div>
                        <div className="w-full lg:w-6/12 px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              Amount
                            </label>
                            <input
                              value={openingBalanceAmount}
                              onChange={(e) =>
                                setOpeningBalanceAmount(e.target.value)
                              }
                              type="number"
                              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                              placeholder="Amount"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center  gap-0 mt-4 m-4 relative "></div>
                  <button
                    className="bg-pink-500 mt-4 ml-4 w-20 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
                    type="button"
                    onClick={submitHandler}
                  >
                    Add
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

export default AddParty;
