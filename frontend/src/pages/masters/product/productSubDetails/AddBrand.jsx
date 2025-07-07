import ProductSubDetailsForm from "../../../../components/homePage/ProductSubDetailsForm";
import TitleDiv from "../../../../components/common/TitleDiv";
import { useState } from "react";
import { useSelector } from "react-redux";
function AddBrand() {
  let organization = useSelector((state) => state?.secSelectedOrganization?.secSelectedOrg);
  console.log(organization?.industry)
  const [loading, setLoading] = useState(false);

  const handleLoader = (data) => {
    setLoading(data)
  }

return (
  <div className="flex-1 h-screen overflow-y-hidden">
    <TitleDiv
      title={[6, 7].includes(organization?.industry) ? "Room Type" : "Add Brand"}
      from="/sUsers/stockItemSettings"
      loading={loading}
    />
    <ProductSubDetailsForm
      tab={[6, 7].includes(organization?.industry) ? "roomType" : "brand"}
      handleLoader={handleLoader}
      isHotel={[6, 7].includes(organization?.industry) ? true : false}
      
    />
  </div>
);

}

export default AddBrand;
