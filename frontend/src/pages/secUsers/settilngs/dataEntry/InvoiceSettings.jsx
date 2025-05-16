/* eslint-disable react/jsx-key */
import {
  TbSettings,
  TbDiscount2,
  TbReceiptTax,
  TbLock,
  TbFileText,
  TbEdit,
} from "react-icons/tb";
import TitleDiv from "../../../../components/common/TitleDiv";
import SettingsCard from "../../../../components/common/SettingsCard";
import { useEffect, useState } from "react";
import api from "../../../../api/api";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { updateConfiguration } from "../../../../../slices/secSelectedOrgSlice";
import { PiVan } from "react-icons/pi";
import { FaRegAddressBook } from "react-icons/fa";

const InvoiceSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState([]);

  const { _id: cmp_id, configurations } = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );

  useEffect(() => {
    if (configurations) {
      const { addRateWithTax, enableShipTo } = configurations[0];
      setSettings([
        {
          title: "Terms & Conditions",
          description:
            "Define the terms and conditions for invoices and orders",
          icon: <TbFileText />,
          to: "/sUsers/invoice/termsAndConditions",
          active: true,
        },
        {
          title: "Custom Despatch Title",
          description: "Add a custom title for despatch details in vouchers",
          icon: <TbEdit />,
          to: "/sUsers/invoice/customDespatchTitle",
          active: true,
        },
        {
          title: "Add Rate with Tax",
          description:
            "On selection, allows entering the rate with a tax field",
          icon: <TbReceiptTax />,
          to: "/invoiceSettings/addRateWithTax",
          active: true,
          toggle: true,
          dbField: "addRateWithTax",
          toggleValue: addRateWithTax || false,
        },
        {
          title: "Enable Ship to Bill on Invoice",
          description:
            "Enable this option to include 'Ship to Bill' details on the invoice",
          icon: <FaRegAddressBook />,
          to: "/invoiceSettings/enableShipToBill",
          toggleValue: enableShipTo || false,
          dbField: "enableShipTo",
          active: true,
          toggle: true,
        },

        {
          title: "Enable Negative stock block for VAN Invoice",
          description: "Enable it to prevent add entries with negative stock",
          icon: <PiVan />,
          active: true,
          modal: false,
          toggle: true,
          dbField: "enableNegativeStockBlockForVanInvoice",
          toggleValue:
            configurations[0].enableNegativeStockBlockForVanInvoice || false,
        },
        {
          title: "Disable Rate for an Item",
          description:
            "Enable this to restrict users from editing the rate while adding an item in the invoice",
          icon: <TbLock />,
          to: "/invoiceSettings/disableRate",
          active: false,
          toggle: true,
        },
        {
          title: "Disable Discount for an Item",
          description:
            "Enable this to restrict users from editing the discount while adding an item in the invoice",
          icon: <TbDiscount2 />,
          to: "/invoiceSettings/disableDiscount",
          active: false,
          toggle: true,
        },

        {
          title: "Allow Zero Values Entries",
          description: "Enable this to create invoices with zero values",
          icon: <TbSettings />,
          to: "/invoiceSettings/allowZeroValues",
          active: false,
          toggle: true,
        },
      ]);
    }
  }, [configurations]);

  const getUrl = (title) => {
    console.log(title);

    let url;
    switch (title) {
      case "addRateWithTax":
        // url = "/updateTaxConfiguration";
        url = "/updateFirstLayerConfiguration";
        break;
      case "enableShipTo":
        // url = "/updateShipToConfiguration";
        url = "/updateFirstLayerConfiguration";
        break;

      default:
        url = "/updateFirstLayerConfiguration";
        break;
    }

    return url;
  };

  const dispatch = useDispatch();

  const handleToggleChangeFromParent = async (data) => {
    const url = getUrl(data?.title);

    if (url) {
      try {
        setLoading(true);
        const res = await api.put(
          `/api/sUsers/${url}/${cmp_id}?voucher=sale`,
          {
            fieldToUpdate: data?.title,
            value: data?.checked,
          },
          // { [data?.title]: data?.checked },
          {
            withCredentials: true,
          }
        );

        dispatch(updateConfiguration(res?.data?.data));
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white">
      <TitleDiv
        title="Invoice Settings"
        from="/sUsers/dataEntrySettings"
        loading={loading}
      />
      <div className="space-y-4 b-white p-4   mx-1">
        {settings?.map((option, index) => (
          <SettingsCard
            key={index}
            option={option}
            handleToggleChangeFromParent={handleToggleChangeFromParent}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default InvoiceSettings;