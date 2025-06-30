import { useState } from "react";
import { IoMdAdd } from "react-icons/io";

function AddNoteTile() {
  const [note, setNote] = useState(noteFromRedux);


  const handleNoteChange = (e) => {
    setNote(e.target.value);
    debouncedDispatchNote(e.target.value);
  };

  return (
    <>
      <div className="flex justify-end px-4 bg-white pb-3">
        <p
          //   onClick={handleToggleNote}
          className="flex items-center cursor-pointer  gap-3  text-violet-500 text-xs md:text-md  font-semibold "
        >
          {" "}
          <IoMdAdd className="text-lg sm:text-xl" />
          <p className="text-xs ml-1 sm:text-base">Add Note</p>
        </p>

        {/* {isNoteOpenFromRedux && (
                  <div className="mt-3">
                    <input
                      value={note}
                      onChange={handleNoteChange}
                      id=""
                      type="text"
                      placeholder="Note..."
                      className="w-full input-number input-field  border-b-[1px] border-x-0 border-t-0 outline-none text-gray-600 text-xs"
                      style={{
                        boxShadow: "none",
                        borderColor: "#b6b6b6",
                      }}
                    />
                  </div>
                )} */}
      </div>
    </>
  );
}

export default AddNoteTile;
