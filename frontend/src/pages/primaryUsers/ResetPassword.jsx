/* eslint-disable react/no-unknown-property */

import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";
import { Link, useNavigate } from "react-router-dom";
function ResetPassword() {
  const [password, setPassword] = useState("");
  const navigate=useNavigate();
  const otpEmail=localStorage.getItem('otpEmail')
  console.log(otpEmail);

  const submitHandler = async (e) => {
    e.preventDefault()
    
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

    try {
      const res = await api.post("/api/pUsers/resetPassword", { password ,otpEmail});
      toast.success(res.data.message)
      localStorage.removeItem('otpEmail')
      navigate("/pUsers/login");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="">
      <body className="antialiased  ">
        <div className="max-w-lg mx-5 md:mx-auto   my-32 md:my-20 bg-white p-8 rounded-xl shadow shadow-slate-300">
          <h1 className="text-4xl font-medium">Reset password</h1>
          {/* <p className="text-slate-500">Fill up the form to reset the password</p> */}

          <form action="" className="my-10">
            <div className="flex flex-col space-y-5">
              <label for="email">
                <p className="font-medium text-slate-700 pb-2">
                  Enter your new password
                </p>
                <input
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  id="password"
                  name="password"
                  type="text"
                  className="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                  placeholder="Password"
                />
              </label>

              <button
                onClick={submitHandler}
                className="w-full py-3 font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg border-indigo-500 hover:shadow inline-flex space-x-2 items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                  />
                </svg>

                <span>Reset password</span>
              </button>
             
            </div>
          </form>
        </div>
      </body>
    </div>
  );
}

export default ResetPassword;
