/* eslint-disable react/prop-types */
import { IoSettings } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import ToggleButton from "./buttons/ToggleButton";

function SettingsCard({
  option,
  index,
  modalHandler = () => {},
  handleToggleChangeFromParent = () => {},
}) {
  const navigate = useNavigate();

  const handleNavigate = (option) => {
    if (option?.active) {
      if (option?.modal && option?.modal === true) {
        modalHandler(true);
      } else if (option.toggle) {
        return;
      } else {
        navigate(option?.to,{
          state: {
            from: option?.from,
            data: option?.data
          },
        });
      }
    } else {
      return;
    }
  };

  const handleToggleChange = async (newState) => {

    handleToggleChangeFromParent(newState);
  };

  return (
    <div>
      <div
        onClick={() => {
          handleNavigate(option);
        }}
        key={index}
        className={`${
          option?.active === false && "opacity-50 pointer-events-none"
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
