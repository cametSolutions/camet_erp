import { useEffect, useState } from "react";
import loginb from "../../assets/images/admin.jpg";
import { toast } from "react-toastify";
import { PropagateLoader } from "react-spinners";
import api from "../../api/api.js";
import { FaRegEye } from "react-icons/fa";
import { IoMdEyeOff } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addAdminData } from "../../../slices/adminData.js";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loader, setLoader] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const adminData=useSelector((state)=>state.adminData.loginData)
  console.log("adminData",adminData);

useEffect(()=>{

  if(adminData){
    navigate('/admin/home')
  }
})



  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("All fields must be filled");
      return;
    }
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
      toast.error("Invalid email address");
      return;
    }

    setLoader(true);

    const formData = {
      email,
      password,
    };

    try {
      const res = await api.post("/api/admin/adminLogin", formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      setTimeout(() => {
        setLoader(false);
        toast.success(res.data.message);
        dispatch(addAdminData(res.data.data));
        const loginData = JSON.stringify(res.data.data);
        localStorage.setItem("adminData", loginData);
        navigate("/admin/home");
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
        className=" h-screen py-20 relative"
        style={{
          backgroundImage: `url(${loginb})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          // overflow:"hidden"
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backdropFilter: "blur(6px)",
          }}
        ></div>
        <div>
          <div className="container mx-auto relative z-10 ">
            <div className="flex flex-col lg:flex-row w-10/12 lg:w-8/12 bg-white rounded-xl mx-auto shadow-lg overflow-hidden ">
              <div
                className="w-full h-[250px] md:h-[500px]   lg:w-1/2 flex flex-col items-center justify-center p-12 bg-no-repeat bg-cover bg-center "
                style={{
                  backgroundImage: `url(${loginb})`,
                }}
              >
                {/* <h1 className="text-black text-3xl mb-3">Welcome</h1>
              <div>
                <p className="text-black">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Aenean suspendisse aliquam varius rutrum purus maecenas ac{" "}
                  <a href="#" className="text-purple-500 font-semibold">
                    Learn more
                  </a>
                </p>
              </div> */}
              </div>
              <div className="w-full lg:w-1/2 py-16 px-12">
                <h2 className="text-3xl mb-4 text-center">Login</h2>
                <p className="mb-4">
                  Create your account. It’s free and only takes a minute
                </p>
                <form onSubmit={submitHandler}>
                  <div className="mt-5">
                    <input
                      type="text"
                      placeholder="Email"
                      className="border border-gray-400 py-1 px-2 w-full"
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      value={email}
                    />
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
                      className="w-full bg-purple-500 py-3 text-center text-white"
                    >
                      {loader ? (
                        <PropagateLoader
                          color="#ffffff"
                          size={10}
                          speedMultiplier={1}
                          className="mb-3"
                        />
                      ) : (
                        "Login"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
