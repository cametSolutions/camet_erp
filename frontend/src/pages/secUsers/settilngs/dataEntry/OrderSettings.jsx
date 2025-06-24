/* eslint-disable react/jsx-key */
import {
  TbMail,
  TbReceiptTax,
  TbDiscount2,
  TbLock,
  TbFileText,
  TbEdit,
  TbTruck,
} from "react-icons/tb";
import TitleDiv from "../../../../components/common/TitleDiv";
import SettingsCard from "../../../../components/common/SettingsCard";
import api from "../../../../api/api";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { updateConfiguration } from "../../../../../slices/secSelectedOrgSlice";

const OrderSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState([]);

  const dispatch = useDispatch();

  const { _id: cmp_id, configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  useEffect(() => {
    if (configurations) {
      const { addRateWithTax,enableShipTo } = configurations[0];

      setSettings([
        {
          id: 1,
          title: "Terms & Conditions",
          description:
            "Define the terms and conditions for invoices and orders",
          icon: <TbFileText />,
          to: "/sUsers/order/termsAndConditions",
          active: true,
        },
        {
          id: 2,
          title: "Custom Despatch Title",
          description: "Add a custom title for despatch details in vouchers",
          icon: <TbEdit />,
          to: "/sUsers/order/customDespatchTitle",
          active: true,
        },
        {
          id: 5,
          title: "Add Rate with Tax",
          description: "On selection, allows entering rate with tax field",
          icon: <TbReceiptTax />,
          active: true,
          toggle: true,
          dbField: "addRateWithTax",
          toggleValue: addRateWithTax["saleOrder"] || false,
        },
        {
          id:7,
          title: "Enable Ship to Bill on Order",
          description:
            "Enable this option to include 'Ship to Bill' details on the Sale Order",
          icon: <TbTruck />,
          to: "/invoiceSettings/enableShipToBill",
          toggleValue: enableShipTo["saleOrder"] || false,
          dbField: "enableShipTo",
          active: false,
          toggle: true,
        },
        {
          id: 3,
          title: "Disable Rate for an Item",
          description:
            "Enable this to restrict users from editing the rate while adding an item in the invoice",
          icon: <TbLock />,
          to: "/orderSettings/disableRate",
          active: false,
          toggle: true,
        },
        {
          id: 4,
          title: "Disable Discount for an Item",
          description:
            "Enable this to restrict users from editing the discount while adding an item in the invoice",
          icon: <TbDiscount2 />,
          to: "/orderSettings/disableDiscount",
          active: false,
          toggle: true,
        },

        {
          id: 6,
          title: "Allow Zero Values Entries",
          description: "Enable this to create invoices with zero values",
          icon: <TbMail />,
          to: "/orderSettings/allowZeroValues",
          active: false,
          toggle: true,
        },
      ]);
    }
  }, [configurations]);



  const getUrl = (title) => {
    let url;
    switch (title) {
      case "addRateWithTax":
        url = "/updateTaxConfiguration";
        break;
      case "enableShipTo":
        url = "/updateShipToConfiguration";
        break;

      default:
        url = "";
        break;
    }

    return url;
  };

  const handleToggleChangeFromParent = async (data) => {
    const url = getUrl(data?.title);

    if (url) {
      try {
        setLoading(true);
        const res = await api.put(
          `/api/sUsers/${url}/${cmp_id}?voucher=saleOrder`,
          { [data?.title]: data?.checked },
          {
            withCredentials: true,
          }
        );

        dispatch(updateConfiguration(res?.data?.updatedConfig));
        toast.success(res?.data?.message);
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white">
      <TitleDiv
        title="Order Settings"
        from="/sUsers/dataEntrySettings"
        loading={loading}
      />
      <div className="space-y-4 b-white p-4   mx-1">
        {settings.map((option, index) => (
          <SettingsCard
            option={option}
            index={index}
            handleToggleChangeFromParent={handleToggleChangeFromParent}
          />
        ))}
      </div>
    </div>
  );
};

export default OrderSettings;
