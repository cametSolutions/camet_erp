import { useEffect, useState } from "react";
import { TbMail, TbFileInvoice, TbBuildingBank, TbPhoto } from "react-icons/tb";
import TitleDiv from "../../../../components/common/TitleDiv";
import SettingsCard from "../../../../components/common/SettingsCard";
import SelectBankModal from "./modals/SelectBankModal";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import api from "@/api/api";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { updateConfiguration } from "../../../../../slices/secSelectedOrgSlice";

const VoucherSettings = () => {
  const { _id: cmp_id, configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [settingsOptions, setSettingsOptions] = useState([{}]);

  useEffect(() => {
    setSettingsOptions([
      {
        title: "Email",
        description:
          "Configure email list on which you need to send data entry email",
        icon: <TbMail />,
        to: "/sUsers/emailSettings",
        active: true,
      },
      {
        title: "Select Bank Account",
        description:
          "On selection, it shows the bank account details in orders, invoices",
        icon: <TbBuildingBank />,
        to: "/voucherSettings/bankAccount",
        active: true,
        modal: true,
      },
      {
        title: "Enable Actual and Billed  ",
        description: "Enable it to add entries with actual and billed quantity",
        icon: <MdOutlineProductionQuantityLimits />,
        active: true,
        modal: false,
        toggle: true,
        dbField: "enableActualAndBilledQuantity",
        toggleValue: configurations[0].enableActualAndBilledQuantity,
      },
      {
        title: "Voucher Type",
        description: "Enable it to add entries with custom voucher type",
        icon: <TbFileInvoice />,
        to: "/voucherSettings/voucherType",
        active: false,
      },

      {
        title: "Company Logo",
        description:
          "Add, edit or delete the company logo image that is attached to every shared voucher",
        icon: <TbPhoto />,
        to: "/voucherSettings/companyLogo",
        active: false,
      },
    ]);
  }, [configurations]);

  const dispatch = useDispatch();

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  const handleToggleChange = async (newState) => {
    setLoading(true);
    const { title, checked } = newState;

    const apiData = {
      fieldToUpdate: title,
      value: checked,
    };

    try {
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
      <TitleDiv
        title="Voucher Settings"
        from="/sUsers/dataEntrySettings"
        loading={loading}
      />
      <div
        className={`space-y-4 bg-white p-4 mx-1 transition-opacity duration-300 ${
          loading ? "pointer-events-none opacity-70" : "opacity-100"
        }`}
      >
        {settingsOptions.map((option, index) => (
          <SettingsCard
            key={index}
            option={option}
            index={index}
            modalHandler={option.modal ? handleModalOpen : undefined}
            handleToggleChangeFromParent={handleToggleChange}
          />
        ))}
      </div>

      {/* Conditionally Render Modal */}
      {isModalOpen && (
        <SelectBankModal
          showModal={isModalOpen}
          setShowModal={setIsModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default VoucherSettings;
