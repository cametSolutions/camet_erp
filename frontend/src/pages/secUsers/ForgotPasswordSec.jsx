import { useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { PropagateLoader } from "react-spinners";


function ForgotPasswordSec() {
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);

  const navigate=useNavigate()

  const submitHandler = async () => {
    setLoader(true)

    try {
      const res = await api.post("/api/sUsers/sendOtp", { email });
 
      localStorage.setItem('otpEmailSec',email)
      navigate('/sUsers/otp')
      toast.success(res.data.message)

    } catch (error) {
      setTimeout(() => {
        setLoader(false)
        console.log(error);
        toast.error(error.response.data.message);
        
      }, 2000);
    }
  };

  return (
    <div>
      <body className="bg-gray-100">
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full p-6 mx-5 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-semibold text-center text-gray-500 mt-8 mb-6">
              Forgot your password ?
            </h1>

            <form>
              <div className="mb-6 ">
                <label className="block mb-4 text-sm text-gray-600 ml-1 mt-12">
                  Enter the registered email
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              <button
                onClick={submitHandler}
                type="button"
                className="w-32 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white py-2 rounded-lg mx-auto block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 mt-4 mb-4"
              >
                 {loader ? (
                      <PropagateLoader
                        color="#ffffff"
                        size={10}
                        speedMultiplier={1}
                        className="mb-3"
                      />
                    ) : (
                      "Submit"
                    )}
              </button>
            </form>
            <div className="text-center">
              {/* <p className="text-sm">
                Volver a{" "}
                <a href="#" className="text-cyan-600">
                  Iniciar sesión
                </a>
              </p> */}
            </div>
            <p className="text-xs text-gray-600 text-center mt-8">
              &copy; Camet IT Solutions
            </p>
          </div>
        </div>
      </body>
    </div>
  );
}

export default ForgotPasswordSec;
