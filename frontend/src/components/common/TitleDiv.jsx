/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import CustomBarLoader from "./CustomBarLoader";

function TitleDiv({ title, from = "", loading = false }) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (from) {
      navigate(from);
    } else {
      navigate(-1,{replace:true});
    }
  };
  return (
    <div className="sticky top-0 z-50 ">
      <div className="  bg-[#201450] text-white  p-3 flex items-center gap-3 text-lg justify-between   ">
        <div className="flex items-center justify-center gap-2">
          <IoIosArrowRoundBack
            onClick={handleNavigate}
            className="cursor-pointer text-3xl"
          />
          <p className="font-bold"> {title}</p>
        </div>

      </div>

      {loading && <CustomBarLoader  />}
    </div>
  );
}

export default TitleDiv;
