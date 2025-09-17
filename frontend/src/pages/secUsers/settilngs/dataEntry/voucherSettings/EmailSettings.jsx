/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import TitleDiv from "../../../../../components/common/TitleDiv";
import Gmail from "../../../../../assets/images/gmail.png";
import FindUserAndCompany from "../../../../../components/Filters/FindUserAndCompany";
import {  useNavigate, } from "react-router-dom";
import api from "../../../../../api/api";
import { toast } from "sonner";
import useFetch from "../../../../../customHook/useFetch";

function EmailSettings() {
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [userAndCompanyData, setUserAndCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  // const location = useLocation();
  // const { id } = useParams();
  const [errors, setErrors] = useState({
    email: "",
    appPassword: "",
  });

  const navigate = useNavigate();



  /// to fetch data

  const { data, loading:dataLoading, error } = useFetch(
    userAndCompanyData &&
    `/api/${userAndCompanyData?.pathUrl}/getConfiguration/${userAndCompanyData?.org?._id}?selectedConfiguration=emailConfiguration`
  );

  useEffect(() => {
    if (data) {
      setEmail(data?.data?.email || "");
      setAppPassword(data?.data?.appPassword || "");
    }
  }, [data]);

  const validateForm = () => {
    let formErrors = {
      email: "",
      appPassword: "",
    };

    // Email validation
    if (!email.trim()) {
      formErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = "Email is invalid";
    }

    // App Password validation
    if (!appPassword.trim()) {
      formErrors.appPassword = "App Password is required";
    } else if (appPassword.length < 10) {
      formErrors.appPassword = "App Password must be at least 10 characters";
    }

    setErrors(formErrors);

    // Return true if no errors
    return !formErrors.email && !formErrors.appPassword;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (validateForm()) {
      const data = {
        email,
        appPassword,
      };
      try {
        setLoading(true);
        const url = `/api/${userAndCompanyData?.pathUrl}/addEmailConfiguration/${userAndCompanyData?.org?._id}`;


        const res = await api.post(url, data, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        toast.success(res.data.message);

        navigate("/sUsers/VoucherSettings");
      } catch (error) {
        toast.error(error.response.data.message);
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUserAndCompanyData = (data) => {
    setUserAndCompanyData(data);
  };

  const showLoader=loading || dataLoading || error ? true : false

  return (
    <div className="">
      <FindUserAndCompany getUserAndCompany={handleUserAndCompanyData} />
      <TitleDiv title="Email Settings" loading={showLoader} />
      <div className={` ${showLoader ? "opacity-50 animate-pulse pointer-events-none" : ""}  flex items-center justify-center px-4`} >
        <div className="relative py-3 sm:min-w-[500px] ">
          <div className="min-h-96 sm:min-w-64 px-5 py-8  text-left rounded-sm border border-t-2 border-gray-100 shadow-2xl">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col justify-center items-center h-full select-none">
                <div className="flex flex-col items-center justify-center gap-2 mb-8">
                  <div className="flex items-center gap-2">
                    <img className="h-4 w-4" src={Gmail} alt="" />

                    <p className="m-0 text-[16px] font-bold text-gray-700">
                      Email Configuration
                    </p>
                  </div>
                  <span className="m-0 text-xs max-w-[90%] text-center text-[#8B8E98]">
                    Configure your email for sending files across different
                    providers
                  </span>
                </div>

                {/* Email Input */}
                <div className="w-full flex flex-col gap-2 mb-4">
                  <label className="font-semibold text-xs text-gray-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    className={`rounded-[3px] px-3 py-4 text-sm w-full border-none shadow-lg ${
                      errors.email ? "border-2 border-red-500" : ""
                    }`}
                    placeholder="your-email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* App Password Input */}
                <div className="w-full flex flex-col gap-2 mb-4">
                  <label className="font-semibold text-xs text-gray-400 ">
                    App Password
                  </label>
                  <input
                    type="text"
                    value={appPassword}
                    onChange={(e) => {
                      setAppPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, appPassword: "" }));
                    }}
                    className={`rounded-[3px] px-3 py-4 text-sm w-full outline-none border-none shadow-lg ${
                      errors.appPassword ? "border-2 border-red-500" : ""
                    }`}
                    placeholder="Your App Password"
                  />
                  {errors.appPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.appPassword}
                    </p>
                  )}
                </div>

                {/* Provider Guide Section */}
                <div className="w-full bg-gray-200 p-4 px-4 rounded-sm mt-4 font-semibold text-xs text-gray-500 ">
                  <h3 className="font-bold text-sm mb-2 text-black">
                    How to Get App Password
                  </h3>
                  <div className="text-xs space-y-2">
                    <h4 className="font-semibold text-black">For Gmail:</h4>
                    <ol className="list-decimal list-inside">
                      <li>Go to Google Account</li>
                      <li>Navigate to Security Settings</li>
                      <li>Enable 2-Step Verification</li>
                      <li>Scroll to "App passwords"</li>
                      <li>Select "Mail" and your device</li>
                      <li>Generate and copy the 16-character password</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-5">
                <button
                  type="submit"
                  className="py-2 px-8 bg-pink-500 hover:bg-pink-800 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg cursor-pointer"
                >
                  Save Email Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailSettings;
