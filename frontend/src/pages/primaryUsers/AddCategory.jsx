import ProductSubDetailsForm from "../../components/homePage/ProductSubDetailsForm";
import TitleDiv from "../../components/common/TitleDiv";
import { useState } from "react";

function AddCategory() {
  const [loading, setLoading] = useState(false);

  const handleLoader = (data) => {
    setLoading(data)
  }
  return (
    <div className="flex h-screen overflow-y-hidden ">
      <div className="flex-1  ">
        <TitleDiv title={"Add Category"} from="/sUsers/stockItemSettings"  loading={loading}/>

        <ProductSubDetailsForm tab={"category"} handleLoader={handleLoader} />
      </div>
    </div>
  );
}

export default AddCategory;
