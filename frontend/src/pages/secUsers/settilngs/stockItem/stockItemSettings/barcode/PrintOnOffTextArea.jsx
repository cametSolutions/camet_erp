/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addBarcodeData } from "../../../../../../../slices/barcodeSlice";
import { useNavigate } from "react-router-dom";

function PrintOnOffTextArea({ tab }) {
  const [inputValue, setInputValue] = useState("");
  const dispatch = useDispatch();
  const navigate=useNavigate();
  const barcodeDetails = useSelector(
    (state) => state.barcode
  );

  useEffect(() => {
    if (tab === "On") {
      setInputValue(barcodeDetails.printOn);
    } else {
      setInputValue(barcodeDetails.printOff);
    }
  }, [tab, barcodeDetails.printOn, barcodeDetails.printOff]);





  const handleSubmit = (e) => {
    e.preventDefault();
    let data = {};
    if (tab === "On") {
      data = {
        printOn: inputValue,
      };
    } else {
      data = {
        printOff: inputValue,
      };
    }

    dispatch(addBarcodeData(data));
    setInputValue("");
    navigate("/sUsers/barcodeCreationDetails");
    

  };

  return (
    <section className="px-4 py-6 shadow-lg mx-5 ">
      <h1 className="text-sm font-bold text-gray-800">
        Add your Print {tab} value here
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="my-5 ">
          {/* Large text area */}
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            rows="8" // Adjust rows for a larger text area
            placeholder="Enter your text here..."
            className="w-full p-3 border border-gray-300 rounded-md"
          ></textarea>
        </div>

        {/* Submit button */}
        <div className=" w-full">
          <button
            disabled={!inputValue}
            type="submit"
            className="bg-pink-500 w-full text-white px-6 py-2 rounded-md focus:outline-none hover:bg-pink-600 cursor-pointer"
          >
            Submit
          </button>
        </div>
      </form>
    </section>
  );
}

export default PrintOnOffTextArea;
