/* eslint-disable react/jsx-key */
import React from "react";
import { IoFastFood } from "react-icons/io5";
import { MdFoodBank } from "react-icons/md";
import TitleDiv from "../../../../../components/common/TitleDiv";
import SettingsCard from "../../../../../components/common/SettingsCard";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { GrClipboard } from "react-icons/gr";
import { LiaMoneyCheckAltSolid } from "react-icons/lia";
import { updateConfiguration } from "../../../../../../slices/secSelectedOrgSlice.js";
import api from "@/api/api";

const restuarentSettings = () => {
  const dispatch = useDispatch();
  const { industry, _id, configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const handleToggleChangeFromParent = async (data) => {
    console.log(data);
    let url;
    if (data?.title == "kotApproval") {
      url = `/api/sUsers/updateConfigurationForKotApproval/${_id}`;
    } else {
      url = `/api/sUsers/updateConfigurationForHotelAndRestaurant/${_id}`;
    }
    try {
      const response = await api.put(url, data, { withCredentials: true });
      
      if (response?.data?.success) {
        dispatch(updateConfiguration(response?.data?.organization));
        
        // Show appropriate success message
        if (data?.title?.includes('defaultPrint')) {
          const formatName = data?.title === 'defaultPrint.print1' ? 'Format 1' : 'Format 2';
          toast.success(`Print format changed to ${formatName}`);
        } else {
          toast.success(response?.data?.message);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const settingsOptions = [
    {
      title:
        industry === 6 || industry === 7 || industry === 8 ? "food Category" : "Group Management",
      description:
        industry === 6 || industry === 7 || industry === 8
          ? "Manage your food category effectively"
          : " Manage your food item effectively",
      icon: <MdFoodBank />,
      to: "/sUsers/AddSubRestuarentCategory",
      active: true,
    },
    {
      title: industry === 6 || industry === 7 || industry === 8 ? "Item Add" : "Group Management",
      description:
        industry === 6 || industry === 7 || industry === 8
          ? "Manage your food name effectively"
          : "Manage your food item effectively",
      icon: <MdFoodBank />,
      to: "/sUsers/itemList",
      active: true,
    },
    {
      title:
        industry === 6 || industry === 7 || industry === 8 ? "Table Master" : "Group Management",
      description:
        industry === 6 || industry === 7 || industry === 8
          ? "Manage your Table Entrys here"
          : "Manage your Table Addition here",
      icon: <MdFoodBank />,
      to: "/sUsers/TableMaster",
      active: true,
    },
  ];

  if (industry === 7 || industry === 6 || industry === 8) {
    settingsOptions.unshift({
      title: " food Types",
      description: "Create different region wise category",
      icon: <IoFastFood />,
      to: "/sUsers/AddRestuarentCategory",
      active: true,
    });
    settingsOptions.push({
      title: "Auto approval for kot kitchen",
      description: "For better kot management",
      icon: <LiaMoneyCheckAltSolid />,
      active: true,
      toggle: true,
      toggleValue: configurations[0]?.kotAutoApproval,
      dbField: "kotApproval",
    });
    settingsOptions.push({
      title: "addRateWithTax",
      description: "Better tax calculations for better organization",
      icon: <LiaMoneyCheckAltSolid />,
      active: true,
      toggle: true,
      toggleValue: configurations[0]?.addRateWithTax?.restaurantSale,
      dbField: "restaurantSale",
    });
       settingsOptions.push({
                title: "Default Print",
                description: "Select your default print options",
                icon: <GrClipboard />,
                to: "sec",
                active: true,
                checkboxGroup: true,
                checkboxes: [
                  {
                    label: "Format 1",
                    checked: configurations?.[0]?.defaultPrint?.restaurantPrint1 ?? false, // Fixed access
                    dbField: "defaultPrint.restaurantPrint1",
                  },
                  {
                    label: "Format 2",
                    checked: configurations?.[0]?.defaultPrint?.restaurantPrint2 ?? false, // Fixed access
                    dbField: "defaultPrint.restaurantPrint2",
                  },
                ],
                dbField:"restaurant"
              });
  }

  return (
    <div className="bg-white">
      <TitleDiv
        title={
          industry === 6 || industry === 7 || industry === 8
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

export default restuarentSettings;
