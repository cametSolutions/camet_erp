import { useState } from "react";
import { toast } from "react-toastify";
import { PropagateLoader } from "react-spinners";
import { Link, useNavigate } from "react-router-dom";
import { FaRegEye } from "react-icons/fa";
import { IoMdEyeOff } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";
import api from "../../api/api.js";
import { FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";


const Register = () => {
  const [userName, setUserName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [subscription, setSubscription] = useState("");

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    // Validations
    if (!userName || !mobile || !email || !password || !confirmPassword) {
      toast.error("All fields must be filled");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Mobile number must be 10 digits");
      return;
    }

    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
      toast.error("Invalid email address");
      return;
    }

    if (subscription === "") {
      toast.error("Select your subscription");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password and Confirm Password do not match");
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

    setLoader(true);

    const formData = {
      userName,
      mobile,
      email,
      password,
      subscription,
    };

    console.log(formData);
    

    try {
      const res = await api.post("/api/pUsers/register", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setTimeout(() => {
        setLoader(false);
        toast.success(res.data.message);
        setUserName("");
        setMobile("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        navigate("/pUsers/login");
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        toast.error(error.response.data.message);
        setLoader(false);
      }, 1000);
    }
  };

  return (
    <div className="font-[sans-serif] bg-white md:h-screen p-5">
      <div className="flex items-center justify-center">
        <div className="flex items-center p-6 h-full w-full  md:w-1/3   shadow-2xl ">
          <form className="max-w-lg w-full mx-auto" onSubmit={submitHandler}>
            <div className="mb-12 flex flex-col items-center justify-center gap-2">
              <MdAccountCircle size={40} className="text-purple-500" />
              <h3 className="text-gray-600 md:text-xl text-lg text-center font-extrabold max-md:text-center">
                Create an account
              </h3>
            </div>

            <div>
              <label className="text-gray-800 text-sm block mb-2">
                User Name
              </label>
              <div className="relative flex items-center">
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full bg-transparent text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                  placeholder="Enter user name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                <MdAccountCircle className="w-[18px] h-[18px] absolute right-2 text-gray-400" />
              </div>
            </div>

            <div className="mt-6">
              <label className="text-gray-800 text-sm block mb-2">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <input
                  name="mobile"
                  type="tel"
                  required
                  className="w-full bg-transparent text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                  placeholder="Enter mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
                <FaPhone className="absolute right-2 text-gray-400" />
              </div>
            </div>

            <div className="mt-6">
              <label className="text-gray-800 text-sm block mb-2">Email</label>
              <div className="relative flex items-center">
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-transparent text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <MdEmail className="absolute right-2 text-gray-400" />

              </div>
            </div>

            <div className="mt-6">
              <label className="text-gray-800 text-sm block mb-2">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-transparent text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {showPassword ? (
                  <IoMdEyeOff
                    className="w-[18px] h-[18px] absolute right-2 cursor-pointer text-gray-400"
                    onClick={togglePasswordVisibility}
                  />
                ) : (
                  <FaRegEye
                    className="w-[18px] h-[18px] absolute right-2 cursor-pointer text-gray-400"
                    onClick={togglePasswordVisibility}
                  />
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="text-gray-800 text-sm block mb-2">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="w-full bg-transparent text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {showConfirmPassword ? (
                  <IoMdEyeOff
                    className="w-[18px] h-[18px] absolute right-2 cursor-pointer text-gray-400"
                    onClick={toggleConfirmPasswordVisibility}
                  />
                ) : (
                  <FaRegEye
                    className="w-[18px] h-[18px] absolute right-2 cursor-pointer text-gray-400"
                    onClick={toggleConfirmPasswordVisibility}
                  />
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="text-gray-800 text-sm block mb-2">
                Subscription
              </label>
              <select
                className="w-full bg-transparent text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                value={subscription}
                onChange={(e) => setSubscription(e.target.value)}
                required
              >
                <option value="">Select subscription</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="flex items-center mt-6">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 shrink-0 rounded"
              />
              <label
                htmlFor="terms"
                className="ml-3 block text-sm text-gray-800"
              >
                I accept the{" "}
                <Link
                  to="/terms"
                  className="text-blue-500 font-semibold hover:underline ml-1"
                >
                  Terms and Conditions
                </Link>
              </label>
            </div>

            <div className="mt-12">
              <button
                type="submit"
                className="w-full py-3 px-6 text-sm tracking-wider font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none"
                disabled={loader}
              >
                {loader ? (
                  <PropagateLoader color="#ffffff" size={10} className="mb-2" />
                ) : (
                  "Create an account"
                )}
              </button>
              <p className="text-sm mt-6 text-gray-800">
                Already have an account?{" "}
                <Link
                  to="/sUsers/login"
                  className="text-blue-500 font-semibold hover:underline ml-1"
                >
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;