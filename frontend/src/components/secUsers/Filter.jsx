/* eslint-disable react/prop-types */
import { IoFilterSharp } from "react-icons/io5";
import { MdAddCircle } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import FilterContent from "./vouchers/FilterContent";

function Filter({ addAllProducts, godownName, priceLevels }) {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleAddProduct = () => {
    dispatch(addAllProducts([]));
    navigate("/sUsers/addProduct");
  };

  return (
    <div className="flex items-center gap-2  px-4 py-2 bg-white border-b-2 ">
      <div className="flex items-center gap-2  p-1  rounded-sm px-3 cursor-pointer  ">
        <FilterContent priceLevels={priceLevels} />
      </div>
      <div onClick={handleAddProduct}>
        <div className="flex items-center gap-1  p-1  rounded-sm px-3 cursor-pointer text-gray-500  text-xs ">
          <aside>
            {" "}
            <MdAddCircle />
          </aside>
          <p className="font-bold">Add Product</p>
        </div>
      </div>

      <div type="button" className="flex   bg-white ">
        <p className="text-xs   text-black font-bold opacity-60  ">
          {godownName || ""}
        </p>
      </div>
    </div>
  );
}

export default Filter;
