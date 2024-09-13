/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import { RiLoginCircleFill } from "react-icons/ri";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PropagateLoader } from "react-spinners";
import api from "../../../api/api";
import { FaRegEye } from "react-icons/fa";
import { IoMdEyeOff } from "react-icons/io";
import { useNavigate, Link } from "react-router-dom";
function LoginForm({ user }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("All fields must be filled");
      return;
    }

    setLoader(true);

    const formData = {
      email,
      password,
    };

    console.log(user);
    

    try {
      const res = await api.post(`/api/${user==="primary"?"pUsers":"sUsers"}/login`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      setTimeout(() => {
        setLoader(false);
        toast.success(res.data.message);
        const loginData = JSON.stringify(res.data.data);
        // localStorage.setItem("sUserData", loginData);
        localStorage.setItem(`${user==="primary"?"pUserData":"sUserData"}`, loginData);
        navigate(`/${user==="primary"?"pUsers":"sUsers"}/dashboard`);
        setEmail("");
        setPassword("");
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        toast.error(error.response.data.message);
        setLoader(false);
      }, 1000);
    }
  };


  // const forgotPassword = () => {
  //   console.log("kjshdf");
    

  //   if (!email) {
  //     toast.error("Add your email address to send password reset link");
  //     return;
  //   }
  //   // navigate(`/${user==="primary"?"pUsers":"sUsers"}/forgotPassword`);
  // };

  



  return (
    <div
      className="bg-gray-100 font-[sans-serif]"
      // style={backgroundStyle}
    >
      <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <div className="max-w-md w-full">
          <div className="p-8 rounded-sm bg-white shadow-xl">
            <RiLoginCircleFill className="w-12 h-12 text-blue-500 mx-auto" />

            <h1 className="text-gray-800 text-center text-2xl font-bold mt-3 ">
              Welcome!
            </h1>
            <h2 className="text-gray-500 text-center text-md font-bold">
              Sign in to your account
            </h2>
            <form className="mt-8 space-y-4" onSubmit={submitHandler}>
              <div>
                <label className="text-gray-800 text-sm mb-2 block">
                  Email or Phone
                </label>
                <div className="relative flex items-center">
                  <input
                    name="username"
                    type="text"
                    required
                    className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600"
                    placeholder="Enter Email or Phone"
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    value={email}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#bbb"
                    stroke="#bbb"
                    className="w-4 h-4 absolute right-4"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="10"
                      cy="7"
                      r="6"
                      data-original="#000000"
                    ></circle>
                    <path
                      d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z"
                      data-original="#000000"
                    ></path>
                  </svg>
                </div>
              </div>

              <div>
                <label className="text-gray-800 text-sm mb-2 block">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600"
                    placeholder="Enter password"
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    value={password}
                  />
                  <div className="absolute top-1/2 right-4 text-gray-500 opacity-60 transform -translate-y-1/2">
                    {!showPassword ? (
                      <FaRegEye onClick={togglePasswordVisibility} />
                    ) : (
                      <IoMdEyeOff onClick={togglePasswordVisibility} />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    for="remember-me"
                    className="ml-3 block text-sm text-gray-800"
                  >
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a
                  // onClick={forgetPassword}
                    href="jajvascript:void(0);"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div className="!mt-8">
                <button
                  type="submit"
                  className="w-full py-3 px-4 text-sm tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  {loader ? (
                    <PropagateLoader
                      color="#ffffff"
                      size={10}
                      speedMultiplier={1}
                      className="mb-3"
                    />
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>
              <p className="text-gray-800 text-sm !mt-8 text-center">
                Don't have an account?{" "}

                <Link to={"/pUsers/register"}>

                <a
                  href="javascript:void(0);"
                  className="text-blue-600 hover:underline ml-1 whitespace-nowrap font-semibold"
                >
                  Register here
                </a>
                </Link>

              </p>
            </form>

            {user == "secondary" ? (
              <p className="text-gray-800 text-sm  text-center mt-2">
                Login as{" "}
                <Link to={"/pUsers/login"}>
                  <span className="text-blue-600 font-bold hover:underline">
                    Owner
                  </span>
                </Link>
              </p>
            ) : (
              <p className="text-gray-800 text-sm  text-center mt-2">
                Login as{" "}
                <Link to={"/sUsers/login"}>
                  <span className="text-blue-600 font-bold hover:underline">
                    Reatiler
                  </span>
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
