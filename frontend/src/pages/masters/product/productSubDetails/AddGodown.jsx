import ProductSubDetailsForm from "../../../../components/homePage/ProductSubDetailsForm";
import { useState } from "react";
import TitleDiv from "../../../../components/common/TitleDiv";

function AddGodown() {

  const [loading, setLoading] = useState(false);

  const handleLoader = (data) => {
    setLoading(data)
  }

  return (
 

    <div className="flex-1 h-screen overflow-hidden ">
           <TitleDiv title={"Add Location"} from="/sUsers/StockItem" loading={loading} />

      <ProductSubDetailsForm tab={"godown"} handleLoader={handleLoader}    />
    </div>
  )
}

export default AddGodown