import { useEffect, useState } from "react";
import api from "../../api/api.js";
import { toast } from "react-toastify";
import { IoReorderThreeSharp } from "react-icons/io5";
import { useParams, useNavigate } from "react-router-dom";
import AddOrgForm from "../../components/homePage/AddOrgForm.jsx";
import { useSidebar } from "../../layout/Layout";
import { useDispatch } from "react-redux";
import { setSelectedOrganization } from "../../../slices/PrimarySelectedOrgSlice.jsx";
import { useSelector } from "react-redux";

const EditOrg = () => {
 const selectedOrganization = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg
  );
  
  const dispatch = useDispatch();
  const [orgData, setOrgData] = useState({});


  const [showInputs, setShowInputs] = useState(false);


  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSingleOrganization = async () => {
      try {
        const res = await api.get(`/api/pUsers/getSingleOrganization/${id}`, {
          withCredentials: true,
        });
        setOrgData(res.data.organizationData);
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


  





  const {  handleToggleSidebar } = useSidebar();


  const submitHandler = async (formData) => {

    console.log(formData);
 

    try {
      const res = await api.post(`/api/pUsers/editOrg/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      console.log(res.data.data._id)
      if(res.data.data._id === selectedOrganization._id){
        dispatch(setSelectedOrganization(res.data.data))
      } 
      
      toast.success(res.data.message);
      navigate("/pUsers/organizationList");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };




  return (
     
      <div className=" ">
        <section className=" bg-blueGray-50 ">
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
  );
};

export default EditOrg;
