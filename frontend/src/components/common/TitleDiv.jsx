/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

function TitleDiv({ title, from="" }) {
  const navigate = useNavigate();

  const handleNavigate = () => {

    console.log("from", from);  
    
    if (from) {
      navigate(from);
    } else {
      navigate(-1);
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
    </div>
  );
}

export default TitleDiv;
