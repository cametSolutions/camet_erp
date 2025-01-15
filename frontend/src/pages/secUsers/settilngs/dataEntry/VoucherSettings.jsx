import { useState } from "react";
import { TbMail, TbFileInvoice, TbBuildingBank, TbPhoto } from "react-icons/tb";
import TitleDiv from "../../../../components/common/TitleDiv";
import SettingsCard from "../../../../components/common/SettingsCard";
import SelectBankModal from "./modals/SelectBankModal";

const VoucherSettings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const settingsOptions = [
    {
      title: "Email",
      description:
        "Configure email list on which you need to send data entry email",
      icon: <TbMail />,
      to: "/sUsers/emailSettings",
      active: true,
    },
    {
      title: "Voucher Type",
      description: "Enable it to add entries with custom voucher type",
      icon: <TbFileInvoice />,
      to: "/voucherSettings/voucherType",
      active: false,
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
      title: "Company Logo",
      description:
        "Add, edit or delete the company logo image that is attached to every shared voucher",
      icon: <TbPhoto />,
      to: "/voucherSettings/companyLogo",
      active: false,
    },
  ];

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  return (
    <div className="bg-white">
      <TitleDiv title="Voucher Settings" from="/sUsers/dataEntrySettings" />
      <div className="space-y-4 bg-white p-4 mx-1">
        {settingsOptions.map((option, index) => (
          <SettingsCard
            key={index}
            option={option}
            index={index}
            modalHandler={option.modal ? handleModalOpen : undefined}
          />
        ))}
      </div>
      {/* Conditionally Render Modal */}
      {isModalOpen && <SelectBankModal showModal={isModalOpen} setShowModal={setIsModalOpen}  onClose={handleModalClose} />}
    </div>
  );
};

export default VoucherSettings;
