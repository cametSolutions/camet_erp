/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import uploadImageToCloudinary from "../../../utils/uploadCloudinary.js";
import { toast } from "react-toastify";
import api from "../../api/api.js";
import { HashLoader } from "react-spinners";
import { industries } from "../../../constants/industries.js";
import { statesData } from "../../../constants/states.js";
import { countries } from "../../../constants/countries.js";
//
function AddOrgForm({ onSubmit, orgData = {} }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [mobile, setMobile] = useState("");
  const [gstNum, setGstNum] = useState("");
  const [email, setEmail] = useState("");
  const [flat, setFlat] = useState("");
  const [road, setRoad] = useState("");
  const [landmark, setLandmark] = useState("");
  const [logo, setLogo] = useState("");
  const [loader, setLoader] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [senderId, setSenderId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // const [userData, setUserData] = useState("");
  const [website, setWebsite] = useState("");
  const [pan, setPan] = useState("");
  const [financialYear, setFinancialYear] = useState("");
  const [type, setType] = useState("self");
  // const [batchEnabled, setBatchEnabled] = useState(false);
  // const [gdnEnabled, setGdnEnabled] = useState(false);
  const [industry, setIndustry] = useState("");
  const [currencyName, setCurrencyName] = useState("Rupee");
  const [currency, setCurrency] = useState("INR");
  const [symbol, setSymbol] = useState("₹");
  const [printTitle, setPrintTitle] = useState("");
  const [subunit, setSubunit] = useState("Paisa");

  // useEffect(() => {
  //   const getUserData = async () => {
  //     try {
  //       const res = await api.get("/api/sUsers/getPrimaryUserData", {
  //         withCredentials: true,
  //       });
  //       setUserData(res.data.data.userData);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   getUserData();
  // }, []);

  useEffect(() => {
    if (Object.keys(orgData).length > 0) {
      const {
        name,
        flat,
        road,
        landmark,
        email,
        mobile,
        senderId,
        username,
        password,
        pin,
        gstNum,
        country,
        logo,
        state,
        website,
        type,
        pan,
        financialYear,
        batchEnabled,
        industry,
        currency,
        currencyName,
        printTitle,
        subunit,
        symbol,
        gdnEnabled,
      } = orgData;

      setName(name);
      setFlat(flat);
      setRoad(road);
      setLandmark(landmark);
      setEmail(email);
      setMobile(mobile);
      setSenderId(senderId);
      setUsername(username);
      setPassword(password);
      setPin(pin);
      setGstNum(gstNum);
      setCountry(country);
      setLogo(logo);
      setState(state);
      setWebsite(website);
      setType(type);
      setPan(pan);
      setFinancialYear(financialYear);
      // setBatchEnabled(batchEnabled);
      // setGdnEnabled(gdnEnabled);
      setIndustry(industry);
      setCurrency(currency);
      setCurrencyName(currencyName);
      setSubunit(subunit);
      setSymbol(symbol);
      setPrintTitle(printTitle);
    }
  }, [orgData]);

  console.log(orgData);

  const handleCheckboxChange = () => {
    setShowInputs(!showInputs);
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files[0];
    setLoader(true);
    const data = await uploadImageToCloudinary(file);

    setLoader(false);

    setLogo(data.url);
  };

  const submitHandler = async () => {
    if (
      !name.trim() ||
      // (gstNum && !gstNum.trim()) ||
      !email.trim() ||
      !state ||
      !country ||
      !flat.trim() ||
      !road.trim() ||
      !industry ||
      // (website && !website.trim()) ||
      !financialYear.trim() ||
      !landmark.trim() ||
      !pin ||
      !mobile
    ) {
      toast.error("All fields must be filled");
      return;
    }

    if (showInputs) {
      if (!senderId.trim() || !username.trim() || !password.trim()) {
        toast.error("SenderId, Username, and Password must be filled");
        return;
      }
    }

    if (currency?.trim() === "" || currencyName?.trim() === "") {
      toast.error("Currency and Currency Name must be filled");
      return;
    }

    if (name.length > 60) {
      toast.error("Name must be at most 30 characters");
      return;
    }

    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
      toast.error("Invalid email address");
      return;
    }

    if (!/^\d{10}$/.test(mobile) && country === "India") {
      toast.error("Mobile number must be 10 digits");
      return;
    }

    if (flat.length > 120) {
      toast.error("Place must be at most 120 characters");
      return;
    }
    if (road.length > 120) {
      toast.error("Place must be at most 120 characters");
      return;
    }
    if (landmark.length > 120) {
      toast.error("Place must be at most 120 characters");
      return;
    }

    // / Additional PIN code validation
    const isPinValid = /^\d{6}$/.test(pin);
    if (!isPinValid && country === "India") {
      toast.error("Please enter a valid 6-digit PIN code");
      return;
    }

    const gstRegex = /^[0-9A-Za-z]{15}$/;

    if (gstNum && !gstRegex.test(gstNum) && country === "India") {
      toast.error("Invalid GST number");
      return;
    }

    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan) && country === "India") {
      toast.error("Invalid PAN number");
      return;
    }
    if (
      website &&
      !/^((https?|ftp):\/\/)?(www\.)?[\w-]+\.[a-zA-Z]{2,}(\/\S*)?$/.test(
        website
      )
    ) {
      toast.error("Invalid website URL");
      return;
    }
    if (printTitle && printTitle.length > 30) {
      toast.error("Print Title must be at most 30 characters");
      return;
    }

    const formData = {
      name,
      // place,
      pin,
      state,
      country,
      email,
      gstNum,
      mobile,
      logo,
      flat,
      road,
      landmark,
      senderId,
      username,
      password,
      website,
      pan,
      financialYear,
      type,
      // batchEnabled,
      // gdnEnabled,
      industry,
      currency,
      currencyName,
      symbol,
      subunit,
      printTitle,
    };

    // console.log(formData);
    onSubmit(formData);
  };

  return (
    <div>
      <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
        <form encType="multipart/form-data">
          <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
            Company Information
          </h6>
          <div className="flex flex-wrap">
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Name
                </label>
                <input
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  value={name}
                  placeholder="Organization name"
                />
              </div>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Organization Email
                </label>
                <input
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  value={email}
                  type="text"
                  placeholder="abc@gmail.com"
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
                  Official Mobile no.
                </label>
                <input
                  onChange={(e) => {
                    setMobile(e.target.value);
                  }}
                  value={mobile}
                  type="number"
                  placeholder="Mobile number"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                />
              </div>
            </div>
          </div>

          {/* address */}

          <hr className="mt-6 border-b-1 border-blueGray-300" />
          <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
            Address
          </h6>
          <div className="flex flex-wrap">
            {/* <div className="w-full lg:w-12/12 px-4"></div> */}
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Country
                </label>
                <select
                  className="border-0 px-3 mr-12 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setCurrency(
                      countries.find(
                        (country) => country.countryName === e.target.value
                      )?.currency
                    );
                    setCurrencyName(
                      countries.find(
                        (country) => country.countryName === e.target.value
                      )?.currencyName
                    );
                    setSymbol(
                      countries.find(
                        (country) => country.countryName === e.target.value
                      )?.symbol
                    );
                    setSubunit(
                      countries.find(
                        (country) => country.countryName === e.target.value
                      )?.subunit
                    );
                    setState("");
                  }}
                  value={country}
                >
                  {countries.map((country) => (
                    <option
                      value={country?.countryName}
                      key={country?.countryName}
                    >
                      {country?.countryName} ({country?.currency})
                    </option>
                  ))}

                  {/* Add more options as needed */}
                </select>
              </div>
            </div>
            {country === "India" ? (
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    State
                  </label>
                  <select
                    className="border-0 px-2 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    onChange={(e) => {
                      setState(e.target.value);
                    }}
                    value={state}
                  >
                    <option value="" disabled>
                      Select a state
                    </option>
                    {statesData.map((indianState) => (
                      <option
                        key={indianState?.stateName}
                        value={indianState?.stateName}
                      >
                        {indianState?.stateName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    State
                  </label>
                  <input
                    className="border-0 px-2 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    onChange={(e) => {
                      setState(e.target.value);
                    }}
                    value={state}
                  ></input>
                </div>
              </div>
            )}
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Currency
                </label>
                <input
                  disabled
                  className="border-0 px-3 mr-12 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  // onChange={(e) => {
                  //   setCurrency(e.target.value);
                  //   // setState("");
                  // }}
                  value={currency}
                >
                  {/* Add more options as needed */}
                </input>
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Currency Name
                </label>
                <input
                  disabled
                  className="border-0 px-3 mr-12 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  onChange={(e) => {
                    setCurrencyName(e.target.value);
                    // setState("");
                  }}
                  value={currencyName}
                ></input>
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Symbol
                </label>
                <input
                  disabled
                  className="border-0 px-3 mr-12 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={symbol}
                ></input>
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  House/Flat/Block.No
                </label>
                <input
                  type=""
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  onChange={(e) => {
                    setFlat(e.target.value);
                  }}
                  value={flat}
                  placeholder="House/Flat/Block.No"
                />
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Apartment/Road/Area
                </label>
                <input
                  type=""
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  onChange={(e) => {
                    setRoad(e.target.value);
                  }}
                  value={road}
                  placeholder="Apartment/Road/Area"
                />
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Landmark
                </label>
                <input
                  type=""
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  onChange={(e) => {
                    setLandmark(e.target.value);
                  }}
                  value={landmark}
                  placeholder=" Landmark"
                />
              </div>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Pin
                </label>

                <input
                  type={country == "India" ? "number" : "text"}
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  onChange={(e) => {
                    setPin(e.target.value);
                  }}
                  value={pin}
                  placeholder="Postal Code"
                />
              </div>
            </div>
          </div>
          {/* address */}

          {/* {userData.sms && (
            <>
              <hr className="mt-6 border-b-1 border-blueGray-300" />
              <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase flex gap-4 items-center">
                SMS Service
                <input
                  onChange={handleCheckboxChange}
                  type="checkbox"
                  name=""
                  id=""
                  style={{ transform: "scale(1.2)" }}
                />
              </h6>
              {showInputs && (
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-12/12 px-4"></div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        sender id
                      </label>
                      <input
                        type=""
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        onChange={(e) => {
                          setSenderId(e.target.value);
                        }}
                        value={senderId}
                        placeholder="Sender Id"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        user name
                      </label>
                      <input
                        type=""
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        onChange={(e) => {
                          setUsername(e.target.value);
                        }}
                        value={username}
                        placeholder="User Name"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        password
                      </label>
                      <input
                        type=""
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        onChange={(e) => {
                          setPassword(e.target.value);
                        }}
                        value={password}
                        placeholder="Password"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )} */}

          <hr className="mt-6 border-b-1 border-blueGray-300" />
          <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
            Other Information
          </h6>
          <div className="flex flex-wrap">
            <div className="w-full lg:w-12/12 px-4"></div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  {country == "India" ? "GST No" : "VAT No"}
                </label>
                <input
                  type=""
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  onChange={(e) => {
                    setGstNum(e.target.value);
                  }}
                  value={gstNum}
                  placeholder={country == "India" ? "GST No" : "VAT No"}
                />
              </div>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  website
                </label>
                <input
                  type=""
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  onChange={(e) => {
                    setWebsite(e.target.value);
                  }}
                  value={website}
                  placeholder="Website"
                />
              </div>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Pan
                </label>
                <input
                  type=""
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  onChange={(e) => {
                    setPan(e.target.value);
                  }}
                  value={pan}
                  placeholder="Pan No"
                />
              </div>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="financial-year-select"
                >
                  Financial Year
                </label>
                <select
                  id="financial-year-select"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  onChange={(e) => {
                    setFinancialYear(e.target.value);
                  }}
                  value={financialYear}
                >
                  <option value="">Select Financial Year</option>
                  {Array.from({ length: 11 }, (_, index) => {
                    const startYear = 2020 + index;
                    const endYear = startYear + 1;
                    return (
                      <option key={index} value={`${startYear}-${endYear}`}>
                        {startYear}-{endYear}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Industries
                </label>
                <select
                  className="border-0 px-2 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  onChange={(e) => {
                    setIndustry(e.target.value);
                  }}
                  value={industry}
                >
                  <option value="" disabled>
                    Select an Industry
                  </option>
                  {industries.map((el) => (
                    <option key={el?.code} value={el?.code}>
                      {el?.industry}
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
                  Print Title
                </label>
                <input
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  onChange={(e) => {
                    setPrintTitle(e.target.value);
                  }}
                  value={printTitle}
                  placeholder="Print Title"
                />
              </div>
            </div>

            <div className=" w-full flex items-center  mt-8 px-4">
              <div className="flex items-center mr-4">
                <input
                  type="checkbox"
                  id="valueCheckbox"
                  className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                  checked={type === "self"}
                  onChange={() => {
                    setType("self");
                  }}
                />
                <label htmlFor="valueCheckbox" className="ml-2 text-gray-700">
                  Self
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="itemRateCheckbox"
                  className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                  checked={type === "integrated"}
                  onChange={() => {
                    setType("integrated");
                  }}
                />
                <label
                  htmlFor="itemRateCheckbox"
                  className="ml-2 text-gray-700"
                >
                  Integrated
                </label>
              </div>
            </div>
          </div>
          {/* <div className="flex items-center  mt-8 px-4 gap-3">
            <div className="flex items-center mr-4">
              <input
                type="checkbox"
                id="valueCheckbox"
                className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                checked={gdnEnabled === true}
                onChange={() => {
                  setGdnEnabled(!gdnEnabled);
                }}
              />
              <label htmlFor="valueCheckbox" className="ml-2 text-gray-700">
                Godown Enabled
              </label>
            </div>
            <div className="flex items-center mr-4">
              <input
                type="checkbox"
                id="valueCheckbox"
                className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                checked={batchEnabled === true}
                onChange={() => {
                  setBatchEnabled(!batchEnabled);
                }}
              />
              <label htmlFor="valueCheckbox" className="ml-2 text-gray-700">
                Batch Enabled
              </label>
            </div>
          </div> */}

           
          <div className="flex items-center  gap-0 mt-12 m-4 relative ">
            {logo && !loader && (
              <label htmlFor="photoInput" className="cursor-pointer">
                <figure className="absolute top-3 z-10  w-[80px] h-[80px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center">
                  <img
                    src={logo}
                    alt=""
                    className="w-full h-full object-cover rounded-full"
                  />
                </figure>
              </label>
            )}

            {loader && (
              <figure className=" absolute top-3 z-20  w-[80px] h-[80px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center bg-white ">
                <HashLoader color="#6056ec" size={30} speedMultiplier={1.6} />
              </figure>
            )}

            <div className="  mt-3  relative w-[80px] h-[80px] flex   rounded-full border  ">
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                LOGO
              </span>
              <input
                type="file"
                name="photo"
                id="photoInput"
                onChange={(e) => {
                  handleFileInputChange(e);
                }}
                accept=".jpg,.png"
                className="absolute top-0 left-0 h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
          <button
            className="bg-pink-500 mt-4 ml-4 w-20 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
            type="button"
            onClick={submitHandler}
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddOrgForm;
