import { IoReorderThreeSharp } from "react-icons/io5";
import ProductSubDetailsForm from "../../components/homePage/ProductSubDetailsForm";
import Sidebar from "../../components/homePage/Sidebar";

function AddPriceLevel() {
  return (
    <div className="flex ">
    <div>
      <Sidebar />
    </div>

    <div className="flex-1 h-screen overflow-y-scroll ">
      <div className="bg-[#201450]  sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
        <IoReorderThreeSharp
          //   onClick={handleToggleSidebar}
          className="block md:hidden text-3xl"
        />
        <p>Add Price Level</p>
      </div>
      <ProductSubDetailsForm tab={"pricelevel"}     />
    </div>
  </div>
  )
}

export default AddPriceLevel