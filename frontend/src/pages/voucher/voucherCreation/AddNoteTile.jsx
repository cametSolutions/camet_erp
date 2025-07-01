/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { useDispatch } from "react-redux";
import debounce from "lodash/debounce";
import { useCallback } from "react";

function AddNoteTile({
  noteFromRedux,
  isNoteOpenFromRedux,
  addNote,
  addIsNoteOpen,
}) {
  const [note, setNote] = useState("");
  const [isNoteOpen, setIsNoteOpen] = useState("");

  const dispatch = useDispatch();


  useEffect(() => {
    setNote(noteFromRedux);
    setIsNoteOpen(isNoteOpenFromRedux);
  }, [noteFromRedux, isNoteOpenFromRedux]);

  const debouncedDispatchNote = useCallback(
    debounce((note) => {
      dispatch(addNote(note));
    }, 500), // Adjust debounce time as needed
    [dispatch]
  );

  const handleNoteChange = (e) => {
    setNote(e.target.value);
    debouncedDispatchNote(e.target.value);
  };

  const handleToggleNote = () => {
    setIsNoteOpen(!isNoteOpen);
    dispatch(addIsNoteOpen(!isNoteOpen));
  };

  

  return (
    <>
      <div className="flex  flex-col items-end px-4 bg-white pb-3">
        <p
          onClick={handleToggleNote}
          className="flex items-center cursor-pointer  gap-3  text-violet-500 text-xs md:text-md  font-semibold "
        >
          {" "}
          <IoMdAdd className="text-lg sm:text-xl" />
          <p className="text-xs ml-1 sm:text-base">Add Note</p>
        </p>

        {isNoteOpenFromRedux && (
          <div className="mt-3 w-full">
            <input
              value={note}
              onChange={handleNoteChange}
              id=""
              type="text"
              placeholder="Add your note here..."
              className="w-full input-number input-field  border-b-[1px] border-x-0 border-t-0 outline-none text-gray-600 text-xs"
              style={{
                boxShadow: "none",
                borderColor: "#b6b6b6",
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default AddNoteTile;
