/* eslint-disable react/prop-types */
import { IoSettings } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import ToggleButton from "./buttons/ToggleButton";
import api from "../../api/api";
import { toast } from "react-toastify";
import { updateConfiguration } from "../../../slices/secSelectedOrgSlice"; 
import { useDispatch } from "react-redux";
function SettingsCard({
  option,
  index,
  modalHandler,
  type,
  cmp_id,
  refreshHook,
  voucher
}) {

  const navigate = useNavigate();
  const dispatch=useDispatch();
  const handleNavigate = (option) => {
    if (option?.active) {
      if (option?.modal && option?.modal === true) {
        modalHandler(true);
      } else if (option.toggle) {
        return;
      } else {
        navigate(option?.to);
      }
    } else {
      return;
    }
  };

  const handleToggleChange = async (newState) => {
    const apiData = {
      ...newState,
      type,
      voucher
    };


    try {
      const res=await api.put(`/api/sUsers/updateConfiguration/${cmp_id}`, apiData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      dispatch(updateConfiguration(res?.data?.data));

      console.log(res.data.data);
      localStorage.setItem("secOrg", JSON.stringify(res.data.data));
      
      refreshHook();

      

    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return (
    <div>
      <div
        onClick={() => {
          handleNavigate(option);
        }}
        key={index}
        className={`${
          option?.active === false && "opacity-50"
        }  flex items-center justify-between  shadow-md  p-4 rounded-sm hover:bg-slate-100 cursor-pointer`}
      >
        <div className="flex items-center gap-3 ">
          <section className="text-xl ">{option?.icon}</section>
          <section>
            <h3 className="text-xs font-bold">{option.title}</h3>
            <p className="text-gray-500 text-xs mt-0.5">{option.description}</p>
          </section>
        </div>

        {option?.toggle ? (
          <ToggleButton
            option={option}
            isChecked={option.toggleValue}
            onToggle={handleToggleChange}
          />
        ) : (
          <button className="px-4 py-2 rounded-lg text-xs font-bold ">
            <IoSettings size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

export default SettingsCard;
