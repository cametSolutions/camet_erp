import api from "../../api/api.js";
import { toast } from "react-toastify";
import { IoReorderThreeSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import AddOrgForm from "../../components/homePage/AddOrgForm.jsx";
import { useSidebar } from "../../layout/Layout";

const AddOrganisation = () => {
  const {  handleToggleSidebar } = useSidebar();

  const navigate = useNavigate();

  const submitHandler = async (formData) => {
    console.log(formData);

    try {
      const res = await api.post("/api/pUsers/", formData, {
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
      {/* <div className="" style={{ height: "100vh" }}>
        <Sidebar TAB={"addOrg"} showBar={showSidebar} />
      </div> */}

      <div className=" ">
        <section className=" bg-blueGray-50 ">
          <div className="bg-[#201450] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
            <IoReorderThreeSharp
              onClick={handleToggleSidebar}
              className="block md:hidden text-3xl"
            />
            <p>Add Company</p>
          </div>

          <div className="w-full lg:w-8/12 px-4 mx-auto  pb-[30px] mt-5  ">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
              <div className="rounded-t bg-white mb-0 px-6 py-2">
                <div className="text-center flex justify-between"></div>
              </div>
              <AddOrgForm onSubmit={submitHandler}  />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AddOrganisation;
