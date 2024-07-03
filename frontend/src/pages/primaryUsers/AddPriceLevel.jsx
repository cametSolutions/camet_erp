import { IoReorderThreeSharp } from "react-icons/io5";
import ProductSubDetailsForm from "../../components/homePage/ProductSubDetailsForm";
import { useSidebar } from "../../layout/Layout";

function AddPriceLevel() {
  const {  handleToggleSidebar } = useSidebar();

  return (
   

    <div className="flex-1 h-screen ">
      <div className="bg-[#201450]  sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
        <IoReorderThreeSharp
            onClick={handleToggleSidebar}
          className="block md:hidden text-3xl"
        />
        <p>Add Price Level</p>
      </div>
      <ProductSubDetailsForm tab={"pricelevel"}     />
    </div>
  )
}

export default AddPriceLevel