import registerBackground from "../../assets/images/new.jpg";
import registerBackground02 from "../../assets/images/new.jpg";
import { useState } from "react";
import { toast } from "react-toastify";
import { PropagateLoader } from "react-spinners";
import { Link } from "react-router-dom";
import { FaRegEye } from "react-icons/fa";
import { IoMdEyeOff } from "react-icons/io";
import api from "../../api/api.js";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [subscription, setSubscription] = useState(''); 

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };


  console.log(subscription);

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
      subscription
    };
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
    <div>
      <div
        className="min-h-screen py-20 relative"
        style={{
          backgroundImage: `url(${registerBackground})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          overflow: "hidden",
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backdropFilter: "blur(6px)",
          }}
        ></div>
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row w-10/12 lg:w-8/12 bg-white rounded-xl mx-auto shadow-lg overflow-hidden ">
            <div
              className="w-full lg:w-1/2 flex flex-col items-center justify-center p-12 bg-no-repeat bg-cover bg-center"
              style={{
                backgroundImage: `url(${registerBackground02})`,
              }}
            >
              {/* <h1 className="text-black text-3xl mb-3">Welcome</h1> */}
              <div>
                {/* <p className="text-black">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Aenean suspendisse aliquam varius rutrum purus maecenas ac{" "}
                  <a href="#" className="text-purple-500 font-semibold">
                    Learn more
                  </a>
                </p> */}
              </div>
            </div>
            <div className="w-full lg:w-1/2 py-16  px-6 md:px-12 ">
              <h2 className="text-3xl mb-4 text-center">Register</h2>
              <p className="mb-4">
                Create your account. It’s free and only takes a minute
              </p>
              <form onSubmit={submitHandler}>
                <div>
                  <input
                    type="text"
                    placeholder="User Name"
                    className="border border-gray-400 py-1 px-2 w-full "
                    onChange={(e) => {
                      setUserName(e.target.value);
                    }}
                    value={userName}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Mobile"
                    className="border border-gray-400 py-1 px-2 w-full mt-5"
                    onChange={(e) => {
                      setMobile(e.target.value);
                    }}
                    value={mobile}
                  />
                </div>
                <div className="mt-5">
                  <input
                    type="email"
                    placeholder="Email"
                    className="border border-gray-400 py-1 px-2 w-full"
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    value={email}
                  />
                </div>

                <div className="mt-3">
                  <select
                    className="border border-gray-400 py-1 px-2 w-full"
                    onChange={(e) => {
                      setSubscription(e.target.value);
                    }}
                    value={subscription}
                  >
                    <option value="" disabled>Select your subscription</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="mt-5 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="border border-gray-400 py-1 px-2 w-full"
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    value={password}
                  />
                  <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                    {!showPassword ? (
                      <FaRegEye onClick={togglePasswordVisibility} />
                    ) : (
                      <IoMdEyeOff onClick={togglePasswordVisibility} />
                    )}
                  </div>
                </div>

                <div className="mt-5 relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className="border border-gray-400 py-1 px-2 w-full"
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                    }}
                    value={confirmPassword}
                  />
                  <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                    {!showConfirmPassword ? (
                      <FaRegEye onClick={toggleConfirmPasswordVisibility} />
                    ) : (
                      <IoMdEyeOff onClick={toggleConfirmPasswordVisibility} />
                    )}
                  </div>
                </div>
                <div className="mt-5">
                  <input type="checkbox" className="border border-gray-400" />
                  <span>
                    I accept the{" "}
                    <a href="#" className="text-purple-500 font-semibold">
                      Terms of Use
                    </a>{" "}
                    &{" "}
                    <a href="#" className="text-purple-500 font-semibold">
                      Privacy Policy
                    </a>
                  </span>
                </div>
                <div className="mt-5">
                  <button
                    type="submit"
                    className="w-full bg-purple-500 py-3 text-center text-white "
                  >
                    {loader ? (
                      <PropagateLoader
                        color="#ffffff"
                        size={10}
                        speedMultiplier={1}
                        className="mb-3"
                      />
                    ) : (
                      "Register Now"
                    )}
                  </button>
                </div>
                <p className="text-center mt-3">
                  Already have an account?{" "}
                  <Link to={"/pUsers/login"}>
                    {" "}
                    <span className="text-blue-500 ml-1 cursor-pointer">
                      Login
                    </span>
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
