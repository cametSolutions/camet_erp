/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaRegEye } from "react-icons/fa";
import { IoMdEyeOff } from "react-icons/io";
import api from "../../../api/api";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import TitleDiv from "../TitleDiv";

function SecUserCreationForm({ submitHandler, tab = "add" }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");

  const country = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.country
  );

  const { id } = useParams();

  useEffect(() => {
    if (tab === "edit") {
      const fetchUserDetails = async () => {
        try {
          const res = await api.get(`/api/sUsers/getSecUserDetails/${id}`, {
            withCredentials: true,
          });

          const { name, email, mobile, password } = res.data.data;
          setName(name);
          setEmail(email);
          setMobile(mobile);
          setOldPassword(password);
        } catch (error) {
          console.log(error);
        }
      };
      fetchUserDetails();
    }
  }, []);



  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!name || !mobile  || !email) {
      toast.error("All fields must be filled");
      return;
    }

    if (name.length > 30) {
      toast.error("Name must be at most 30 characters");
      return;
    }

    if (country === "India" && !/^\d{10}$/.test(mobile)) {
      toast.error("Mobile number must be 10 digits");
      return;
    }


    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
      toast.error("Invalid email address");
      return;
    }

    if (tab === "add") {
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
    }

    if (tab === "edit" && oldPassword && password) {
      if (
        password.length < 8 ||
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
          password
        )
      ) {
        console.log("two");

        toast.error(
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        );
        return;
      }
    }

    const formData = {
      name,
      mobile,
      email,
      password,
    };

    submitHandler(formData);
  };

  return (
    <div className="flex">
      <div className="flex-1 ">
        <section className=" bg-blueGray-50 ">
          <TitleDiv title="Secondary User" />
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
                    onClick={onSubmitHandler}
                  >
                    Update
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
                  </div>
                  <hr className="mt-5 border-b-1 border-blueGray-300" />
                  <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                    Authentication
                  </h6>
                  <div className="flex flex-wrap">
                    <div className="w-full lg:w-12/12 px-4"></div>
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

export default SecUserCreationForm;
