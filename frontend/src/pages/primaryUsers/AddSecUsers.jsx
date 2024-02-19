import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { FaRegEye } from "react-icons/fa";
import { IoMdEyeOff } from "react-icons/io";
import Sidebar from "../../components/homePage/Sidebar";
import { IoReorderThreeSharp } from "react-icons/io5";

function AddSecUsers() {
  const [organizations, setOrganizations] = useState([]);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);


  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await api.get("/api/pUsers/getOrganizations", {
          withCredentials: true,
        });

        setOrganizations(res.data.organizationData);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    fetchOrganizations();
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const submitHandler = async () => {
    if (!name || !mobile || !selectedOrg || !email || !password) {
      toast.error("All fields must be filled");
      return;
    }

    if (name.length > 30) {
      toast.error("Name must be at most 30 characters");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Mobile number must be 10 digits");
      return;
    }

    if (selectedOrg.length < 1) {
      toast.error("Select at least an OrganiZation");
      return;
    }

    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
      toast.error("Invalid email address");
      return;
    }

    if (
      password.length < 8 ||
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
        password
      )
    ) {
      toast.error(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      );
      return;
    }

    const formData = {
      name,
      mobile,
      email,
      selectedOrg,
      password,
    };

    try {
      const res = await api.post("/api/pUsers/addSecUsers", formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
      setName("");
      setEmail("");
      setMobile("");
      setSelectedOrg("");
      setPassword("");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  const handleCheckboxChange = (orgId) => {
    // Check if the organization is already selected
    if (selectedOrg.includes(orgId)) {
      // Remove it from the selected organizations
      setSelectedOrg((prevSelected) =>
        prevSelected.filter((id) => id !== orgId)
      );
    } else {
      // Add it to the selected organizations
      setSelectedOrg((prevSelected) => [...prevSelected, orgId]);
    }
  };

  return (
    <div className="flex">
      <div className="" style={{ height: "100vh" }}>
        <Sidebar TAB={"addSec"}  showBar={showSidebar} />
      </div>

      <div className="flex-1 ">
        <section className=" bg-blueGray-50 h-screen overflow-y-scroll">
        <div className="block  bg-[#201450] text-white mb-2 p-3 flex items-center gap-3 sticky top-0 z-20 text-lg  ">
        <IoReorderThreeSharp
              onClick={handleToggleSidebar}
              className="block md:hidden text-3xl"
            />
          <p> Add Retailers </p>
        </div>
          <div className="w-full lg:w-8/12 px-4 mx-auto mt-6 pb-[30px]">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
              <div className="rounded-t bg-white mb-0 px-6 py-6">
                <div className="text-center flex justify-between">
                  {/* <h6 className="text-blueGray-700 text-xl font-bold">
                    Add Retailers
                  </h6> */}
                  <button
                    className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
                    type="button"
                    onClick={submitHandler}
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <form>
                  <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                    Secondary User Information
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
                          placeholder="Name"
                        />
                      </div>
                    </div>
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          Mobile
                        </label>
                        <input
                          type="number"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          onChange={(e) => {
                            setMobile(e.target.value);
                          }}
                          value={mobile}
                          placeholder=""
                        />
                      </div>
                    </div>

                    <div className="w-full px-4 mt-1 ">
                      <hr className="mt-6 border-b-1 border-blueGray-300 mb-7" />
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-4"
                          htmlFor="grid-password"
                        >
                          Organizations
                        </label>
                        <div className="space-y-2">
                          {organizations.length > 0 ? (
                            organizations.map((item, index) => (
                              <div key={index} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`organizationCheckbox${index}`}
                                  value={item._id}
                                  checked={selectedOrg.includes(item._id)}
                                  onChange={(e) =>
                                    handleCheckboxChange(e.target.value)
                                  }
                                  className="mr-2"
                                />
                                <label
                                  htmlFor={`organizationCheckbox${index}`}
                                  className="text-blueGray-600"
                                >
                                  {item.name}
                                </label>
                              </div>
                            ))
                          ) : (
                            <p className="text-blueGray-600">
                              No organization added
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value="Lucky"
                      />
                    </div>
                  </div> */}
                    {/* <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        value="Jesse"
                      />
                    </div>
                  </div> */}
                  </div>
                  <hr className="mt-5 border-b-1 border-blueGray-300" />
                  <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                    Authentication
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
                    <div className="w-full 2 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          onChange={(e) => {
                            setEmail(e.target.value);
                          }}
                          value={email}
                          placeholder="abc@gmail.com"
                        />
                      </div>
                    </div>

                    <div className="w-full   px-4">
                      <div className=" w-full relative   mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          onChange={(e) => {
                            setPassword(e.target.value);
                          }}
                          value={password}
                          placeholder=".........."
                        />
                        <div className="absolute top-9 flex items-center right-2 ">
                          {!showPassword ? (
                            <FaRegEye onClick={togglePasswordVisibility} />
                          ) : (
                            <IoMdEyeOff onClick={togglePasswordVisibility} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AddSecUsers;
