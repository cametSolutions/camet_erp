import api from "../../../api/api.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AddOrgForm from "../../../components/homePage/AddOrgForm.jsx";
import TitleDiv from "../../../components/common/TitleDiv.jsx";
import { useDispatch } from "react-redux";
import { refreshCompanies } from "../../../../slices/secSelectedOrgSlice.js";

const AddOrganisation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const role = JSON.parse(localStorage.getItem("sUserData"))?.role;

  const submitHandler = async (formData) => {
    try {
      const res = await api.post("/api/sUsers/addOrganizations", formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (role === "admin") {
        dispatch(refreshCompanies());
      }

      toast.success(res.data.message);

      navigate("/sUsers/company/list");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return (
    <div className="flex ">
      {/* <div className="" style={{ height: "100vh" }}>
        <Sidebar TAB={"addOrg"} showBar={showSidebar} />
      </div> */}

      <div className=" ">
        <section className=" bg-blueGray-50 ">
          <TitleDiv title={"Add Organization"} />

          <div className="w-full lg:w-8/12 px-4 mx-auto  pb-[30px] mt-5  ">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
              <div className="rounded-t bg-white mb-0 px-6 py-2">
                <div className="text-center flex justify-between"></div>
              </div>
              <AddOrgForm onSubmit={submitHandler} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AddOrganisation;
