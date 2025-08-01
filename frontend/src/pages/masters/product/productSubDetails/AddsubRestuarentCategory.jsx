import { useEffect, useState } from "react";
import ProductSubDetailsForm from "../../../../components/homePage/ProductSubDetailsForm";
import TitleDiv from "../../../../components/common/TitleDiv";
import { useSelector } from "react-redux";
import api from "@/api/api"; // or wherever your axios/api setup is

function AddSubCategory() {
  const [loading, setLoading] = useState(false);
  const [categoriesData, setCategoriesData] = useState([]);

  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );

  const cmp_id = organization?._id;
const tab = "foodItems";

  const handleLoader = (data) => {
    setLoading(data);
  };

  useEffect(() => {
    if (!cmp_id) return;

    const fetchCategories = async () => {
      handleLoader(true);
      try {
        const res = await api.get(`/api/sUsers/categories/${cmp_id}?type=${tab}`, {
          params: { under: "restaurant" }, // example filter if you want
          withCredentials: true,
        });
        if (res.data.success) {
          setCategoriesData(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        handleLoader(false);
      }
    };

    fetchCategories();
  }, [cmp_id]);
console.log(categoriesData)
  return (
    <div className="flex-1 h-screen overflow-y-hidden ">
      <TitleDiv title={"foodItems"} from="/sUsers/stockItemSettings" loading={loading} />
      
      <ProductSubDetailsForm
        tab="foodItems"
        handleLoader={handleLoader}
        categoriesData={categoriesData}
      />
    </div>
  );
}

export default AddSubCategory;
