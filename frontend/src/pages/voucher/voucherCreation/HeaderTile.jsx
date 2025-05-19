/* eslint-disable react/prop-types */
import { IoIosAddCircle } from "react-icons/io";
import { useSelector } from "react-redux";

function HeaderTile({
  title,
  number,
  selectedDate,
  setSelectedDate,
  dispatch,
  changeDate,
  submitHandler,
  removeAll,
  loading,
}) {
  const { mode } = useSelector((state) => state.commonVoucherSlice);

  const titleText =
    title.split("")[0]?.toUpperCase()?.concat(title.slice(1)) || "Title";
  return (
    <div>
      <div className="flex justify-between  p-4 bg-white drop-shadow-lg items-center text-xs md:text-base ">
        <div className=" flex flex-col gap-1 justify-center">
          <p className="text-sm font-semibold text-violet-400">
            {titleText} No:#{number}
          </p>

          <div className="flex items-center">
            <p className="font-semibold   text-gray-500 text-xs md:text-base">
              {new Date(selectedDate).toDateString()}
            </p>

            <input
              onChange={(e) => {
                setSelectedDate(e.target.value);
                dispatch(changeDate(e.target.value));
              }}
              type="date"
              // min={new Date().toISOString().split("T")[0]}
              className="w-20  cursor-pointer  "
              // style={{ boxShadow: "none", borderColor: "#b6b6b6" }}
            />
          </div>
        </div>
        <div className="  ">
          <div className="  flex gap-5 items-center ">
            <div className="hidden sm:block">
              <button
                onClick={submitHandler}
                className={` ${
                  loading && "pointer-events-none opacity-80"
                } bottom-0 text-white bg-violet-700  w-full rounded-md  p-2 flex items-center justify-center gap-2 hover_scale cursor-pointer `}
              >
                <IoIosAddCircle className="text-2xl" />
                {title === "Stock Transfer" ? (
                  <p>
                    {mode === "create"
                      ? `Transfer Stock`
                      : `Edit Transfer`}
                  </p>
                ) : (
                  <p>
                    {mode === "create"
                      ? `Generate ${titleText}`
                      : `Edit ${titleText}`}
                  </p>
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
