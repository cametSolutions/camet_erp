import BathAddingForm from "../../components/secUsers/main/Forms/BathAddingForm";
import TitleDiv from "@/components/common/TitleDiv";

const AddbatchInPurchase = () => {
  return (
    <div className="relative">
      <TitleDiv title={"Add Batch"} />
      <BathAddingForm taxInclusive={false} />
    </div>
  );
};

export default AddbatchInPurchase;
