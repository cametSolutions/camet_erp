import TitleDiv from "../../../components/common/TitleDiv";
import { HiTemplate } from "react-icons/hi";
import { IoPersonSharp } from "react-icons/io5";
import { MdDataSaverOff } from "react-icons/md";
import { TbMoneybag } from "react-icons/tb";
import { MdHomeRepairService } from "react-icons/md";


const Settings = () => {
  const settingsOptions = [
    {
      title: "STOCK ITEM",
      description: "Configure your stock item",
      icon: <HiTemplate />,
    },
    {
      title: "PARTIES",
      description: "Configure your Parties",
      icon: <IoPersonSharp />,

    },
    {
      title: "DATA ENTRY",
      description: "Data entry settings",
      icon: <MdDataSaverOff />,

    },
    {
      title: "OUTSTANDING",
      description: "enable you to configure outstanding",
      icon: <TbMoneybag />,

    },
    {
      title: "SERVICE / LEDGER",
      description: "Configure your Ledger",
      icon: <MdHomeRepairService />,

    },
  ];

  return (
    <div className="bg-white">
      <TitleDiv title="Settings" />
      <div className="space-y-1 b-white p-4 px-1  mx-4">
        {settingsOptions.map((option, index) => (
          <div
            key={index}
            className="flex items-center justify-between  shadow-sm border-b-2 p-4 rounded-sm "
          >
            <div className="flex items-center gap-3 cursor-pointer">
              <section className="text-sm">{option?.icon}</section>
              <section>
                <h3 className="text-xs  font-bold">{option.title}</h3>
                {/* <p className="text-gray-500 text-xs mt-2">
                  {option.description}
                </p> */}
              </section>
            </div>
            <button className="  px-4 py-2 rounded-lg  text-xs font-bold ">
              Configure
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
