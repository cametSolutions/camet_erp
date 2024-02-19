import { useEffect, useState } from "react";
import api from "../../api/api.js";
import { toast } from "react-toastify";
import uploadImageToCloudinary from "../../../utils/uploadCloudinary.js";
import { HashLoader } from "react-spinners";
import Sidebar from "../../components/homePage/Sidebar.jsx";
// import { useNavigate } from "react-router-dom";
import { IoReorderThreeSharp } from "react-icons/io5";

const AddOrganisation = () => {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [mobile, setMobile] = useState("");
  const [gst, setGst] = useState("");
  const [email, setEmail] = useState("");
  const [flat, setFlat] = useState("");
  const [road, setRoad] = useState("");
  const [landmark, setLandmark] = useState("");
  const [logo, setLogo] = useState("");
  const [loader, setLoader] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [senderId, setSenderId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState("");
  const [website, setWebsite] = useState("");
  const [pan, setPan] = useState("");
  const [financialYear, setFinancialYear] = useState("");

  console.log(country);

  const handleCheckboxChange = () => {
    setShowInputs(!showInputs);
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files[0];
    console.log(file);
    setLoader(true);
    const data = await uploadImageToCloudinary(file);

    setLoader(false);

    setLogo(data.url);
  };

  const submitHandler = async () => {

    if (
      !name.trim() ||
      !gst.trim() ||
      !email.trim() ||
      !state ||
      !country ||
      !flat.trim() ||
      !road.trim() ||
      !website.trim() || 
      !financialYear.trim() ||
      !landmark.trim()||
      !pin||
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

    if (name.length > 30) {
      toast.error("Name must be at most 30 characters");
      return;
    }



    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
      toast.error("Invalid email address");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Mobile number must be 10 digits");
      return;
    }

    if (flat.length > 30) {
      toast.error("Place must be at most 30 characters");
      return;
    }
    if (road.length > 30) {
      toast.error("Place must be at most 30 characters");
      return;
    }
    if (landmark.length > 30) {
      toast.error("Place must be at most 30 characters");
      return;
    }

    // / Additional PIN code validation
    const isPinValid = /^\d{6}$/.test(pin);
    if (!isPinValid) {
      toast.error("Please enter a valid 6-digit PIN code");
      return;
    }

    const gstRegex = /^[0-9A-Za-z]{15}$/;

    if (!gstRegex.test(gst)) {
      toast.error("Invalid GST number");
      return;
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      toast.error("Invalid PAN number");
      return;
    }
    if (
      !/^((https?|ftp):\/\/)?(www\.)?[\w-]+\.[a-zA-Z]{2,}(\/\S*)?$/.test(
        website
      )
    ) {
      toast.error("Invalid website URL");
      return;
    }

    const formData = {
      name,
      // place,

      pin,
      state,
      country,
      email,
      gst,
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
    };

    console.log(formData);

    // formData.append("logo",logo)

    try {
      const res = await api.post("/api/pUsers/addOrganizations", formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
      setName("");
      setPin("");
      setState("");
      setEmail("");
      setMobile("");
      setGst("");
      setCountry("");
      setLogo("");
      setFlat("");
      setRoad("");
      setLandmark("");
      setSenderId("");
      setUsername("");
      setPassword("");
      setWebsite("");
      setPan("");
      setFinancialYear("");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  const indianStates = [
    "Andaman and Nicobar Islands",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chandigarh",
    "Chhattisgarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Lakshadweep",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Puducherry",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await api.get("/api/pUsers/getPrimaryUserData", {
          withCredentials: true,
        });
        setUserData(res.data.data.userData);
      } catch (error) {
        console.log(error);
      }
    };
    getUserData();
  }, []);

  return (
    <div className="flex ">
      <div className="" style={{ height: "100vh" }}>
        <Sidebar TAB={"addOrg"} showBar={showSidebar} />
      </div>

      <div className=" ">
        <section className=" bg-blueGray-50 h-screen overflow-y-scroll ">
          <div className="bg-[#201450] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
            <IoReorderThreeSharp
              onClick={handleToggleSidebar}
              className="block md:hidden text-3xl"
            />
            <p>Add organization</p>
          </div>

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
                    Organization Information
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
                    {/* <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          Place
                        </label>
                        <input
                          type="text"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          onChange={(e) => {
                            setPlace(e.target.value);
                          }}
                          value={place}
                          placeholder="Add your place"
                        />
                      </div>
                    </div> */}
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
                    <div className="w-full lg:w-12/12 px-4"></div>
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
                          type="number"
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

                  {userData.sms && (
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
                  )}

                  <hr className="mt-6 border-b-1 border-blueGray-300" />
                  <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                    Other Information
                  </h6>
                  <div className="flex flex-wrap">
                    <div className="w-full lg:w-12/12 px-4">
                      {/* <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        Address
                      </label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value="Bld Mihail Kogalniceanu, nr. 8 Bl 1, Sc 1, Ap 09"
                      />
                    </div> */}
                    </div>
                    {/* <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          Pin
                        </label>
                        <input
                          type="number"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          onChange={(e) => {
                            setPin(e.target.value);
                          }}
                          value={pin}
                          placeholder="Postal Code"
                        />
                      </div>
                    </div> */}
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          GST no.
                        </label>
                        <input
                          type=""
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          onChange={(e) => {
                            setGst(e.target.value);
                          }}
                          value={gst}
                          placeholder="Gst No"
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
                              <option
                                key={index}
                                value={`${startYear}-${endYear}`}
                              >
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
                          Country
                        </label>
                        <select
                          className="border-0 px-3 mr-12 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          onChange={(e) => {
                            setCountry(e.target.value);
                          }}
                          value={country}
                        >
                          <option value="India">India</option>
                          {/* Add more options as needed */}
                        </select>
                      </div>
                    </div>

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
                          {indianStates.map((indianState) => (
                            <option key={indianState} value={indianState}>
                              {indianState}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center  gap-0 mt-4 m-4 relative ">
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
                        <HashLoader
                          color="#6056ec"
                          size={30}
                          speedMultiplier={1.6}
                        />
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
};

export default AddOrganisation;
