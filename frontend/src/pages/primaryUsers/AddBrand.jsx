import ProductSubDetailsForm from "../../components/homePage/ProductSubDetailsForm";
import TitleDiv from "../../components/common/TitleDiv";
import { useState } from "react";

function AddBrand() {
  const [loading, setLoading] = useState(false);

  const handleLoader = (data) => {
    setLoading(data)
  }
  return (
    <div className="flex-1 h-screen overflow-y-hidden ">
      <TitleDiv title={"Add Brand"} from="/sUsers/stockItemSettings" loading={loading} />
      <ProductSubDetailsForm tab={"brand"} handleLoader={handleLoader} />

      
    </div>
  );
}

export default AddBrand;
