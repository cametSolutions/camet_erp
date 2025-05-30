/* eslint-disable react/prop-types */
import { useState } from "react";
import { PiShareFatFill } from "react-icons/pi";
import { MdEdit, MdSms } from "react-icons/md";
import CancelButton from "@/components/common/CancelButton";
import { useNavigate } from "react-router-dom";
import RemoveReduxData from "@/components/secUsers/RemoveReduxData";
import { ShareFormatSelector } from "./ShareFormatSelector";

export default function VoucherDetailsActionButtons({
  data,
  reFetch,
  setActionLoading,
  actionLoading,
}) {
  const navigate = useNavigate();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const {
    _id,
    isCancelled,
    vanSale = false,
    isEditable,
    isConverted = false,
    voucherType,
  } = data || {};

  const handleEditClick = () => {
    if (!voucherType) return;

    navigate(`/sUsers/edit${voucherType}/${_id}`, {
      state: {
        mode: "edit",
        voucherType: voucherType,
        data: data,
      },
    });
  };

  const handleShareClick = () => {
    setShareDialogOpen(true);
  };

  const handleSmsClick = () => {
    // Implement SMS functionality
    console.log("SMS clicked");
  };

  // Array of action buttons with their icons, titles, and handlers
  const actions = [
    {
      icon: MdEdit,
      title: "Edit",
      color: "text-blue-500",
      active: true,
      onClick: handleEditClick,
    },
    {
      icon: PiShareFatFill,
      title: "Share",
      color: "text-green-500",
      active: voucherType !== "receipt" && voucherType !== "payment",
      onClick: handleShareClick,
    },
    {
      icon: MdSms,
      title: "Sms",
      color: "text-yellow-500",
      active: true,
      onClick: handleSmsClick,
    },
  ];

  return (
    <div
      className={` ${
        isCancelled && "opacity-60 pointer-events-none"
      }  flex flex-col items-center`}
    >
      {/* some redux data is persisted in redux store so to remove it */}
      <RemoveReduxData />
      
      {/* Share Dialog Component */}
      <ShareFormatSelector 
        open={shareDialogOpen} 
        setOpen={setShareDialogOpen}
        voucherId={_id}
        voucherType={voucherType}
      />
      
      <div className="flex justify-center space-x-8">
        <CancelButton
          id={_id}
          voucherType={voucherType}
          isCancelled={isCancelled}
          reFetch={reFetch}
          vanSale={vanSale}
          isEditable={isEditable}
          isConverted={isConverted}
          setActionLoading={setActionLoading}
          actionLoading={actionLoading}
        />

        {actions.map((action, index) => {
          if (!action.active) return null;
          const Icon = action.icon;
          return (
            <div
              key={index}
              onClick={action.onClick}
              className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div
                className={`p-2 rounded-full bg-gray-100 mb-2 ${action.color}`}
              >
                <Icon size={18} />
              </div>
              <span className="text-[10px] font-bold">{action.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}