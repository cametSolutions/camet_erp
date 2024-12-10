import TitleDiv from "../../../../../../components/common/TitleDiv";
import SelectedBarcode from "./SelectedBarcode";
import PrintOnOffTextArea from "./PrintOnOffTextArea";


function BarcodePrintOn() {

  return (
    <div>
      <TitleDiv
        title={"Barcode Print On"}
        from="/sUsers/barcodeCreationDetails"
      />
      <SelectedBarcode />

    <PrintOnOffTextArea  tab={"On"}/>
    </div>
  );
}

export default BarcodePrintOn;
