import TitleDiv from "@/components/common/TitleDiv";
import { WarrantyCardForm } from "./WarrantyCardForm ";

function AddWarrantyCard() {
  const handleCreate = (formData) => {
    console.log("Creating warranty card:", formData);
    // Your create API call here
  };
  return (
    <div>
      <TitleDiv title={"Add Warranty Card"} />
      <div className="p-5">
        <WarrantyCardForm onSubmit={handleCreate} isEditMode={false} />
      </div>
    </div>
  );
}

export default AddWarrantyCard;
