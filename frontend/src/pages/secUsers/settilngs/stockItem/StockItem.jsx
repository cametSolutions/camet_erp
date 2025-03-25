/* eslint-disable react/jsx-key */
import TitleDiv from "../../../../components/common/TitleDiv";
import SettingsCard from "../../../../components/common/SettingsCard";
import {
  FiDollarSign,
  FiMapPin,
  FiPlusCircle,
  FiSettings,
  FiTag,
} from "react-icons/fi";
import { IoBarcodeOutline } from "react-icons/io5";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { updateConfiguration } from "../../../../../slices/secSelectedOrgSlice";

const StockItem = () => {
  const [loading, setLoading] = useState(false);
  const [settingsOptions, setSettingsOptions] = useState([{}]);

  ///// redux and api call
  const { _id: cmp_id, configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  useEffect(() => {
    setSettingsOptions([
      {
        title: "Stock Item Filter",
        description:
          "Filters only show product creation window if it's enabled",
        icon: <FiSettings />,
        to: "/sUsers/stockItemSettings",
        active: true,
      },
      {
        title: "Add Location",
        description: "Add location tracking for all vouchers",
        icon: <FiMapPin />,
        to: "/sUsers/godown",
        active: true,
      },
      {
        title: "Enable Location",
        description: "Enable location tracking for all vouchers",
        icon: <FiMapPin />,
        // to: "/sUsers/godown",
        active: true,
        toggle: true,
        toggleValue: configurations[0].gdnEnabled,
        dbField: "gdnEnabled",
      },

      {
        title: "Enable Batch",
        description:
          "Enable this to include batch while adding item in invoice",
        icon: <FiPlusCircle />,
        to: "/sUsers/addBatchSettings",
        active: true,
        toggle: true,
        toggleValue: configurations[0].batchEnabled,
        dbField: "batchEnabled",
      },

      {
        title: "Price Level",
        description: "Enable Multiple Price level for invoice",
        icon: <FiDollarSign />,
        to: "/sUsers/pricelevel",
        active: true,
      },
      {
        title: "Tax Classification",
        description:
          "Enable it to adding HSN and Tax details when creating a new stock item",
        icon: <FiTag />,
        to: "/sUsers/hsnList",
        active: true,
      },
      {
        title: "Barcode Management",
        description: "Manage your product barcode effectively",
        icon: <IoBarcodeOutline />,
        to: "/sUsers/barcodeList",
        active: true,
      },
    ]);
  }, [configurations]);

  const dispatch = useDispatch();

  const handleToggleChange = async (newState) => {
    // setLoading(true);
    const { title, checked } = newState;

    const apiData = {
      fieldToUpdate: title,
      value: checked,
    };

    try {
      setLoading(true);
      const res = await api.put(
        `/api/sUsers/updateFirstLayerConfiguration/${cmp_id}`,
        apiData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      dispatch(updateConfiguration(res?.data?.data));

      // refreshHook();
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <TitleDiv title="Stock Item " from="/sUsers/settings" loading={loading} />
      <div className="space-y-4 b-white p-4   mx-1">
        {settingsOptions.map((option, index) => (
          <SettingsCard
            option={option}
            index={index}
            handleToggleChangeFromParent={handleToggleChange}
          />
        ))}
      </div>
    </div>
  );
};

export default StockItem;
