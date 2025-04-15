import ProductSubDetailsForm from "../../../../components/homePage/ProductSubDetailsForm";
import { useState } from "react";
import TitleDiv from "../../../../components/common/TitleDiv";

function AddPriceLevel() {
  const [loading, setLoading] = useState(false);

  const handleLoader = (data) => {
    setLoading(data);
  };

  return (
    <div className="flex-1 h-screen overflow-hidden ">
      <TitleDiv
        title={"Add Price Level"}
        from="/sUsers/StockItem"
        loading={loading}
      />

      <ProductSubDetailsForm tab={"pricelevel"} handleLoader={handleLoader} />
    </div>
  );
}

export default AddPriceLevel;
