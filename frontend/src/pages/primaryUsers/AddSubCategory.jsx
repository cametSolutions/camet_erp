import ProductSubDetailsForm from "../../components/homePage/ProductSubDetailsForm";
import TitleDiv from "../../components/common/TitleDiv";
import { useState } from "react";

function AddSubCategory() {
  const [loading, setLoading] = useState(false);

  const handleLoader = (data) => {
    setLoading(data)
  }
  return (
    <div className="flex-1 h-screen overflow-y-hidden ">
      <TitleDiv title={"Add Sub Category"} from="/sUsers/stockItemSettings"  loading={loading}/>

      <ProductSubDetailsForm tab={"subcategory"} handleLoader={handleLoader} />
    </div>
  );
}

export default AddSubCategory;
