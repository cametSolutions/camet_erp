/* eslint-disable react/prop-types */
import { IoIosAddCircle } from "react-icons/io";
function HeaderTile({
  title,
  number,
  selectedDate,
  setSelectedDate,
  dispatch,
  changeDate,
  submitHandler,
  removeAll,
  tab,
}) {
  return (
    <div>
      <div className="flex justify-between  p-4 bg-white drop-shadow-lg items-center text-xs md:text-base ">
        <div className=" flex flex-col gap-1 justify-center">
            <p className="text-md font-semibold text-violet-400">
              {title} #{number}
            </p>
          

          <div className="flex items-center">
            <p className="font-semibold   text-gray-500 text-xs md:text-base">
              {new Date(selectedDate).toDateString()}
            </p>

            <input
              onChange={(e) => {
                setSelectedDate(e.target.value);
                dispatch(changeDate(new Date(e.target.value)));
              }}
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="w-20 border-none cursor-pointer  "
              style={{ boxShadow: "none", borderColor: "#b6b6b6" }}
            />
          </div>
        </div>
        <div className="  ">
          <div className="  flex gap-5 items-center ">
            <div className="hidden md:block">
              <button
                onClick={submitHandler}
                className=" bottom-0 text-white bg-violet-700  w-full rounded-md  p-2 flex items-center justify-center gap-2 hover_scale cursor-pointer "
              >
                <IoIosAddCircle className="text-2xl" />
                {title === "Stock Transfer" ? (
                  <p>Transfer Stock</p>
                ) : (
                  <p>{tab === "add" ? `Generate ${title}` : `Edit ${title}`}</p>
                )}
              </button>
            </div>
            <div></div>
            <div>
              <button
                onClick={() => {
                  dispatch(removeAll());
                }}
                className="  text-red-500 text-xs  p-1 px-3  border border-1 border-gray-300 rounded-2xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderTile;
