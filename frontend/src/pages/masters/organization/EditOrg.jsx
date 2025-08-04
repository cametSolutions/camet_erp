import { useEffect, useState } from "react";
import api from "../../../api/api.js";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import AddOrgForm from "../../../components/homePage/AddOrgForm.jsx";
import { useDispatch } from "react-redux";
import { setSecSelectedOrganization } from "../../../../slices/secSelectedOrgSlice.js";

import { useSelector } from "react-redux";
import TitleDiv from "../../../components/common/TitleDiv.jsx";

const EditOrg = () => {
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const dispatch = useDispatch();
  const [orgData, setOrgData] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSingleOrganization = async () => {
      try {
        const res = await api.get(`/api/sUsers/getSingleOrganization/${id}`, {
          withCredentials: true,
        });
        setOrgData(res.data.organizationData);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    fetchSingleOrganization();
  }, []);


  const submitHandler = async (formData) => {
    try {
      const res = await api.post(`/api/sUsers/editOrg/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (cmp_id && res.data.data._id === cmp_id) {
        dispatch(setSecSelectedOrganization(res.data.data));
      }

      toast.success(res.data.message);

      navigate("/sUsers/company/list");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return (
    <div className=" ">
      <section className=" bg-blueGray-50 ">
        <TitleDiv title="Edit Organization" />
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
            <AddOrgForm orgData={orgData} onSubmit={submitHandler} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default EditOrg;
