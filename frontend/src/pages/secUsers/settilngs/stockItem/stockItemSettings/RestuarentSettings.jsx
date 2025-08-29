/* eslint-disable react/jsx-key */
import { IoFastFood } from "react-icons/io5";
import { MdFoodBank } from "react-icons/md";
import TitleDiv from "../../../../../components/common/TitleDiv";
import SettingsCard from "../../../../../components/common/SettingsCard";
import { useSelector } from "react-redux";

const restuarentSettings = () => {
  const { industry } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  console.log(industry)
  const settingsOptions = [
    {
      title:
        industry === 6 || industry === 7 ? "food Category" : "Group Management",
      description:
        industry === 6 || industry === 7
          ? "Manage your food category effectively"
          : " Manage your food item effectively",
      icon: <MdFoodBank />,
      to: "/sUsers/AddSubRestuarentCategory",
      active: true,
    },
    {
      title: industry === 6 || industry === 7 ? "Item Add" : "Group Management",
      description:
        industry === 6 || industry === 7
          ? "Manage your food name effectively"
          : "Manage your food item effectively",
      icon: <MdFoodBank />,
      to: "/sUsers/itemList",
      active: true,
    },
    {
      title:
        industry === 6 || industry === 7 ? "Table Master" : "Group Management",
      description:
        industry === 6 || industry === 7
          ? "Manage your Table Entrys here"
          : "Manage your Table Addition here",
      icon: <MdFoodBank />,
      to: "/sUsers/TableMaster",
      active: true,
    },
  ];

  if (industry === 7 || industry === 6) {
    settingsOptions.unshift({
      title: " food Types",
      description: "Create different region wise category",
      icon: <IoFastFood />,
      to: "/sUsers/AddRestuarentCategory",
      active: true,
    });
  }

  return (
    <div className="bg-white">
      <TitleDiv
        title={
          industry === 6 || industry === 7
            ? "Room Management"
            : "Stock Item Settings"
        }
        from="/sUsers/StockItem"
      />
      <div className="space-y-4 b-white p-4   mx-1">
        {settingsOptions.map((option, index) => (
          <SettingsCard key={index} option={option} index={index} />
        ))}
      </div>
    </div>
  );
};

export default restuarentSettings;
