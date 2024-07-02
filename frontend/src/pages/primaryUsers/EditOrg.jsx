import { useEffect, useState } from "react";
import api from "../../api/api.js";
import { toast } from "react-toastify";
import Sidebar from "../../components/homePage/Sidebar.jsx";
import { IoReorderThreeSharp } from "react-icons/io5";
import { useParams, useNavigate } from "react-router-dom";
import AddOrgForm from "../../components/homePage/AddOrgForm.jsx";

const EditOrg = () => {

  const [orgData, setOrgData] = useState({});
  // const [name, setName] = useState("");
  // const [place, setPlace] = useState("");
  // const [pin, setPin] = useState("");
  // const [state, setState] = useState("");
  // const [country, setCountry] = useState("India");
  // const [mobile, setMobile] = useState("");
  // const [gst, setGst] = useState("");
  // const [email, setEmail] = useState("");
  // const [flat, setFlat] = useState("");
  // const [road, setRoad] = useState("");
  // const [landmark, setLandmark] = useState("");
  // const [logo, setLogo] = useState("");
  // const [loader, setLoader] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  // const [senderId, setSenderId] = useState("");
  // const [username, setUsername] = useState("");
  // const [password, setPassword] = useState("");
  // const [userData, setUserData] = useState("");
  // const [website, setWebsite] = useState("");
  // const [pan, setPan] = useState("");
  // const [financialYear, setFinancialYear] = useState("");
  // const [type, setType] = useState("self");
  // const [batchEnabled, setBatchEnabled] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSingleOrganization = async () => {
      try {
        const res = await api.get(`/api/pUsers/getSingleOrganization/${id}`, {
          withCredentials: true,
        });

      


        setOrgData(res.data.organizationData);

        // setName(name);
        // setFlat(flat);
        // setRoad(road);
        // setLandmark(landmark);
        // setEmail(email);
        // setMobile(mobile);
        // setSenderId(senderId);
        // setUsername(username);
        // setPassword(password);
        // setPin(pin);
        // setGst(gstNum);
        // setCountry(country);
        // setLogo(logo);
        // setState(state);
        // setWebsite(website);
        // setPan(pan);
        // setFinancialYear(financialYear);
        // setType(type);
        // setBatchEnabled(batchEnabled);

        if (senderId.length > 0) {
          setShowInputs(true);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    fetchSingleOrganization();
  }, []);





  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };

  const submitHandler = async (formData) => {

    console.log(formData);
 

    try {
      const res = await api.post(`/api/pUsers/editOrg/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
      navigate("/pUsers/organizationList");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };




  return (
    <div className="flex ">
      <div className="" style={{ height: "100vh" }}>
        <Sidebar TAB={"addOrg"} showBar={showSidebar} />
      </div>

      <div className=" ">
        <section className=" bg-blueGray-50 h-screen overflow-y-scroll">
          <div className="bg-[#201450] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
            <IoReorderThreeSharp
              onClick={handleToggleSidebar}
              className="block md:hidden text-3xl"
            />
            <p>Edit Company</p>
          </div>
          <div className="w-full lg:w-8/12 px-4 mx-auto  pb-[30px]  ">
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
             <AddOrgForm orgData={orgData} onSubmit={submitHandler}/>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EditOrg;
