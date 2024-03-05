/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import Sidebar from "../../components/homePage/Sidebar";
import { IoIosArrowRoundBack } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import api from "../../api/api";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { useSelector } from "react-redux";
import { addItem } from "../../../slices/invoice";
import { useDispatch } from "react-redux";
import { changeCount } from "../../../slices/invoice";
import { setPriceLevel } from "../../../slices/invoice";

function AddItem() {
  const [item, setItem] = useState([]);
  const [selectedPriceLevel, setSelectedPriceLevel] = useState("");
  console.log(selectedPriceLevel);

  const cpm_id = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/pUsers/getProducts", {
          withCredentials: true,
        });
        setItem(res.data.productData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchProducts();
  }, [cpm_id]);

  const handleAddClick = (index) => {
    // Toggle the state of 'added' for the clicked item
    const updatedItems = [...item];
    updatedItems[index].added = !updatedItems[index].added;
    setItem(updatedItems);
    dispatch(addItem(updatedItems[index]));
  };

  const handleIncrement = (index) => {
    const updatedItems = [...item]; // Make a copy of the array
    const currentItem = { ...updatedItems[index] }; // Make a copy of the item object
    if (!currentItem.count && currentItem.balance_stock >= 1) {
      currentItem.count = 1;
      
    } else if (currentItem.count < currentItem.balance_stock) {
      currentItem.count += 1;
    }
    updatedItems[index] = currentItem; // Update the item in the copied array
    setItem(updatedItems);
    dispatch(changeCount(currentItem));
  };

  const handleDecrement = (index) => {
    const updatedItems = [...item]; // Make a copy of the array
    const currentItem = { ...updatedItems[index] }; // Make a copy of the item object
    if (currentItem.count > 0) {
      currentItem.count -= 1;
      updatedItems[index] = currentItem; // Update the item in the copied array
      setItem(updatedItems);
    }
    dispatch(changeCount(currentItem));
  };

  console.log(item);
  console.log(selectedPriceLevel);

  const handlePriceLevelChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedPriceLevel(selectedValue);
    dispatch(setPriceLevel(selectedValue))
  };

  // const submitHandler=()=>{
  //   const addedItem=item.filter((el)=>el.added==true && el.count >=1)
  //   console.log(addedItem);
  //   dispatch(addItem(addedItem))

  // }

  return (
    <div className="flex relative">
      <div>
        <Sidebar TAB={"invoice"} />
      </div>

      <div className="flex-1 bg-slate-50 h-screen overflow-y-scroll relative ">
        <div className="sticky top-0">
          <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex justify-between  items-center gap-2  ">
            <div className="flex items-center gap-2">
              <IoIosArrowRoundBack
                onClick={() => {
                  navigate("/pUsers/invoice");
                }}
                className="text-3xl text-white cursor-pointer"
              />
              <p className="text-white text-lg   font-bold ">Add Item</p>
            </div>
            <div className="flex items-center gap-4 md:gap-6 ">
              <div>
                <select
                  onChange={(e) =>handlePriceLevelChange(e)}
                  className="block w-full p-1 px-3 truncate text-sm  border rounded-lg border-gray-100 bg-[#012a4a] text-white focus:ring-blue-500 focus:border-blue-500"
                >
                  {item[0]?.Priceleveles.map((el, index) => (
                    <option key={index} value={el?.pricelevel}>
                      {el?.pricelevel}
                    </option>
                  ))}
                </select>
              </div>
              <MdOutlineQrCodeScanner className="text-white text-lg  cursor-pointer md:text-xl" />
            </div>
          </div>

          <div className=" px-3 py-2 bg-white drop-shadow-lg ">
            <div className="flex justify-between  items-center"></div>
            <div className="mt-2  md:w-1/2 ">
              <div className="relative ">
                <div className="absolute inset-y-0 start-0 flex items-center  pointer-events-none ">
                  <svg
                    className="w-4 h-4 text-gray-500 "
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <div class="relative">
                  <input
                    type="search"
                    id="default-search"
                    class="block w-full p-2 ps-10 text-sm text-gray-900 border  rounded-lg border-gray-300  bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search party by Item name..."
                    required
                  />
                  <button
                    type="submit"
                    class="text-white absolute end-[10px] top-1/2 transform -translate-y-1/2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-2 py-1"
                  >
                    <IoIosSearch />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {item.length === 0 ? (
          <div className="bg-white p-4 py-2 pb-6 mt-4 flex justify-center items-center rounded-sm cursor-pointer border-b-2">
            <p>No products available</p>
          </div>
        ) : (
          item.map((el, index) => (
            <div
              key={index}
              className="bg-white p-4 py-2 pb-6  mt-4 flex justify-between items-center  rounded-sm cursor-pointer border-b-2 "
            >
              <div className="flex items-start gap-3 md:gap-4  ">
                <div className="w-10 mt-1  uppercase h-10 rounded-lg bg-violet-200 flex items-center justify-center font-semibold text-gray-400">
                  {el.product_name.slice(0, 1)}
                </div>
                <div className="flex flex-col font-bold text-sm md:text-sm  gap-1 leading-normal">
                  <p>{el.product_name}</p>
                  <div className="flex gap-1 items-center">
                    <p>
                      ₹{" "}
                      {
                        el.Priceleveles.find(
                          (item) => item.pricelevel === selectedPriceLevel
                        )?.pricerate
                      }{" "}
                      /
                    </p>{" "}
                    <span className="text-[10px] mt-1">{el.unit}</span>
                  </div>
                  <div className="flex">
                    <p className="text-red-500">STOCK : </p>
                    <span>{el.balance_stock}</span>
                  </div>
                  <div className="">
                   <span>Total :</span>
                   <span>{(( el.Priceleveles.find(
                          (item) => item.pricelevel === selectedPriceLevel
                        )?.pricerate)*parseInt(el?.count))  || 0}</span>
                  </div>
                </div>
              </div>
              {el.added ? (
                <div className="flex items-center flex-col gap-2">
                  <Link to={`/pUsers/editItem/${el._id}`}>
                    <button className=" mt-3  px-2 py-1  rounded-md border-violet-500 font-bold border  text-violet-500 text-xs">
                      Edit
                    </button>
                  </Link>
                  <div
                    className="py-2 px-3 inline-block bg-white  "
                    data-hs-input-number
                  >
                    <div className="flex items-center gap-x-1.5">
                      <button
                        onClick={() => handleDecrement(index)}
                        type="button"
                        className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-input-number-decrement
                      >
                        <svg
                          className="flex-shrink-0 size-3.5"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <input
                        className="p-0 w-6 bg-transparent border-0 text-gray-800 text-center focus:ring-0 "
                        type="text"
                        disabled
                        value={el.count ? el.count : 0} // Display the count from the state
                        data-hs-input-number-input
                      />
                      <button
                        onClick={() => handleIncrement(index)}
                        type="button"
                        className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none "
                        data-hs-input-number-increment
                      >
                        <svg
                          className="flex-shrink-0 size-3.5"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    className="px-4 py-2 rounded-md border-violet-500 font-bold border-2 text-violet-500 text-xs"
                    onClick={() => handleAddClick(index)}
                  >
                    Add
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {item.length > 0 && (
          <div className="sticky bottom-0 bg-white  w-full flex justify-center p-3 border-t  ">
            <button
              // onClick={submitHandler}
              className="bg-violet-700  w-[85%] text-ld font-bold text-white p-2 rounded-md"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddItem;
