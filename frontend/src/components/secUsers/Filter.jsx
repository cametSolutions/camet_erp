/* eslint-disable react/prop-types */
import { IoFilterSharp } from "react-icons/io5";
import { MdAddCircle } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

function Filter({ addAllProducts, godownName }) {


  
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleAddProduct = () => {
    dispatch(addAllProducts([]));
    navigate("/sUsers/addProduct");
  };

  return (
    <div className="flex items-center gap-2  px-4 py-3 bg-white ">
      <div className="flex items-center gap-2 shadow-lg p-1 border rounded-md px-3 cursor-pointer bg-slate-400 text-white">
        <aside>
          {" "}
          <IoFilterSharp className="text-xs sm:text-sm" />
        </aside>
        <p className="font-bold text-white text-xs sm:text-sm ">Filter</p>
      </div>
      <div onClick={handleAddProduct}>
        <div className="flex items-center gap-2 shadow-lg p-1 border rounded-md px-3 cursor-pointer bg-slate-400 text-white hover:transform hover:translate-y-0.5 ease-out duration-150 hover:bg-slate-500">
          <aside>
            {" "}
            <MdAddCircle className="text-xs sm:text-sm" />
          </aside>
          <p className="font-bold text-white text-xs sm:text-sm  ">
            Add Product
          </p>
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
