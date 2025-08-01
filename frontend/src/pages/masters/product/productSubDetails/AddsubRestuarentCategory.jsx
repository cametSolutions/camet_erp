import ProductSubDetailsForm from "../../../../components/homePage/ProductSubDetailsForm";
import TitleDiv from "../../../../components/common/TitleDiv";
import { useState } from "react";
import { useSelector } from "react-redux";

function AddSubCategory() {
  const [loading, setLoading] = useState(false);
  let organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );
  console.log(organization?.industry);
  const handleLoader = (data) => {
    setLoading(data)
  }
  return (
    <div className="flex-1 h-screen overflow-y-hidden ">
      <TitleDiv  title={  "foodItems" } from="/sUsers/stockItemSettings"  loading={loading}/>

      <ProductSubDetailsForm tab="foodItems" handleLoader={handleLoader} />
    </div>
  );
}

export default AddSubCategory;
