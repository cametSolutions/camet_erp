/* eslint-disable react/jsx-key */
import { TbBrandGoogle, TbTags, TbListDetails } from "react-icons/tb";
import TitleDiv from "../../../../../components/common/TitleDiv";
import SettingsCard from "../../../../../components/common/SettingsCard";

const StockItemSettings = () => {
    const settingsOptions = [
        {
          title: "Brand Management",
          description: "Manage your product brands effectively",
          icon: <TbBrandGoogle />,
          to: "/sUsers/brand",
          active: true,
        },
        {
          title: "Category Management",
          description: "Organize your products by category",
          icon: <TbTags />,
          to: "/sUsers/category",
          active: true,
        },
        {
          title: "Subcategory Management",
          description: "Define subcategories for better product organization",
          icon: <TbListDetails />,
          to: "/sUsers/subcategory",
          active: true,
        },
      ];

  return (
    <div className="bg-white">
      <TitleDiv title="Stock Item Settings"  from="/sUsers/StockItem"/>
      <div className="space-y-4 b-white p-4   mx-1">
        {settingsOptions.map((option, index) => (
          <SettingsCard option={option} index={index} />
        ))}
      </div>
    </div>
  );
};

export default StockItemSettings;
