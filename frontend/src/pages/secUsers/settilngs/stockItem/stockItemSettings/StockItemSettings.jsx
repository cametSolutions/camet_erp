/* eslint-disable react/jsx-key */
import { TbListDetails } from "react-icons/tb";
import { MdOutlineBedroomChild } from "react-icons/md";
import { IoRestaurantOutline, IoPersonAddOutline } from "react-icons/io5";
import { LuBedSingle } from "react-icons/lu";
import { FiLayers } from "react-icons/fi";
import { GrClipboard } from "react-icons/gr";
import { FaFingerprint } from "react-icons/fa";
import TitleDiv from "../../../../../components/common/TitleDiv";
import SettingsCard from "../../../../../components/common/SettingsCard";
import { useSelector } from "react-redux";
import api from "../../../../../api/api";
import { toast } from "react-toastify";
import { LiaMoneyCheckAltSolid } from "react-icons/lia";
import { updateConfiguration } from "../../../../../../slices/secSelectedOrgSlice.js";

import { useDispatch } from "react-redux";
const StockItemSettings = () => {
  const dispatch = useDispatch();
  const { industry, _id, configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  console.log(configurations?.[0]?.defaultPrint?.print1);

  const handleToggleChangeFromParent = async (data) => {
    console.log(data);
    try {
      const response = await api.put(
        `/api/sUsers/updateConfigurationForHotelAndRestaurant/${_id}`,
        data,
        { withCredentials: true }
      );
      if (response?.data?.success) {
        dispatch(updateConfiguration(response?.data?.organization));
        toast.success(response?.data?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const settingsOptions = [
    {
      title:
        industry === 6 || industry === 7 ? "Room Type" : "Brand Management",
      description:
        industry === 6 || industry === 7
          ? "Manage your rooms name effectively"
          : "Manage your product brands effectively",
      icon: <MdOutlineBedroomChild />,
      to: "/sUsers/brand",
      active: true,
    },
    {
      title:
        industry === 6 || industry === 7 ? "Bed Type" : "Category Management",
      description:
        industry === 6 || industry === 7
          ? "Organize your rooms by bed type"
          : "Organize your products by category",
      icon: <LuBedSingle />,
      to: "/sUsers/category",
      active: true,
    },
    {
      title:
        industry === 6 || industry === 7
          ? "Room floor"
          : "Subcategory Management",
      description:
        industry === 6 || industry === 7
          ? "Define room floor for better room organization"
          : "Define subcategories for better product organization",
      icon: <FiLayers />,
      to: "/sUsers/subcategory",
      active: true,
    },
    ...(industry === 6 || industry === 7
      ? [
          {
            title: "Additional pax",
            description: "Manage additional pax for better room organization",
            icon: <IoPersonAddOutline />,
            to: "/sUsers/addAdditionalPax",
            active: true,
          },
          {
            title: "Visit of purpose",
            description: "Manage visit of purpose for better room organization",
            icon: <TbListDetails />,
            to: "/sUsers/visitOfPurpose",
            active: true,
          },
          {
            title: "ID Proof",
            description: "ID Proof for better customer organization",
            icon: <FaFingerprint />,
            to: "/sUsers/idProof",
            active: true,
          },
          {
            title: "Food Plan",
            description: "Food Plan for better organization",
            icon: <IoRestaurantOutline />,
            to: "/sUsers/foodPlan",
            active: true,
          },
          {
            title: "addRateWithTax",
            description: "Better tax calculations for better organization",
            icon: <LiaMoneyCheckAltSolid />,
            to: "sec",
            active: true,
            toggle: true,
            toggleValue: configurations[0]?.addRateWithTax?.hotelSale,
            dbField: "hotelSale",
          },
          {
            title: "Default Print",
            description: "Select your default print options",
            icon: <GrClipboard />,
            to: "sec",
            active: true,
            checkboxGroup: true,
            checkboxes: [
              {
                label: "Print 1",
                checked: configurations?.[0]?.defaultPrint?.print1 ?? false, // Fixed access
                dbField: "defaultPrint.print1",
              },
              {
                label: "Print 2",
                checked: configurations?.[0]?.defaultPrint?.print2 ?? false, // Fixed access
                dbField: "defaultPrint.print2",
              },
            ],
          },
        ]
      : []),
  ];

  if (industry === 6 || industry === 7) {
    settingsOptions.unshift({
      title: "Room Creation",
      description: "Create different room types for better room organization",
      icon: <GrClipboard />,
      to: "/sUsers/roomList",
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
          <SettingsCard
            key={index}
            option={option}
            index={index}
            handleToggleChangeFromParent={handleToggleChangeFromParent}
          />
        ))}
      </div>
    </div>
  );
};

export default StockItemSettings;
