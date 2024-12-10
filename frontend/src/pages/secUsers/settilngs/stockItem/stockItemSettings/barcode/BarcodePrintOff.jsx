import TitleDiv from "../../../../../../components/common/TitleDiv";
import PrintOnOffTextArea from "./PrintOnOffTextArea";
import SelectedBarcode from "./SelectedBarcode";

function BarcodePrintOff() {
  return (
    <div>
      <TitleDiv
        title={"Barcode Print On"}
        from="/sUsers/barcodeCreationDetails"
      />
      <SelectedBarcode />

      <PrintOnOffTextArea tab={"Off"} />
    </div>
  );
}

export default BarcodePrintOff;
