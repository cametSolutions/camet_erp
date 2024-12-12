/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addBarcodeData } from "../../../../../../../slices/barcodeSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../../../../api/api";

function PrintOnOffTextArea({ tab }) {
  const [inputValue, setInputValue] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const barcodeDetails = useSelector((state) => state.barcode);
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  useEffect(() => {
    if (tab === "On") {
      setInputValue(barcodeDetails.printOn);
    } else {
      setInputValue(barcodeDetails.printOff);
    }
  }, [tab, barcodeDetails.printOn, barcodeDetails.printOff]);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   let data = {};
  //   if (tab === "On") {
  //     data = {
  //       printOn: inputValue,
  //     };
  //   } else {
  //     data = {
  //       printOff: inputValue,
  //     };
  //   }

  //   dispatch(addBarcodeData(data));
  //   // setInputValue("");
  //   // navigate("/sUsers/barcodeCreationDetails");

  //   const { _id, stickerName, printOn, printOff, format1, format2 } =
  //     barcodeDetails;

  //   const dataToSend = {
  //     _id: _id || "",
  //     stickerName,
  //     printOn,
  //     printOff,
  //     format1,
  //     format2,
  //   };

  //   const method = _id === "" ? "POST" : "PUT";

  //   const url =
  //     _id === ""
  //       ? `/api/sUsers/addBarcodeData/${cmp_id}`
  //       : `/api/sUsers/editBarcodeData/${_id}/${cmp_id}`;

  //   try {
  //     const res = await api[method.toLowerCase()](url, dataToSend, {
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       withCredentials: true,
  //     });

  //     toast.success("Barcode Format Updated Successfully");
  //     navigate("/sUsers/barcodeCreationDetails");
  //   } catch (error) {
  //     toast.error("Failed to update Barcode Format");
  //     console.error(error);
  //   }
  // };



  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("inputValue:", inputValue);
    

    if(!inputValue.trim()) {
      toast.error("Please enter a value");
      return;
    }
  
    // Prepare the data to send based on the selected tab
    const { _id, stickerName, printOn, printOff, format1, format2 } = barcodeDetails;
  
    const dataToSend = {
      _id: _id || "",
      stickerName,
      printOn: tab === "On" ? inputValue : printOn, // Update printOn if tab is "On"
      printOff: tab === "Off" ? inputValue : printOff, // Update printOff if tab is "Off"
      format1,
      format2,
    };
  
    const method = _id === "" ? "POST" : "PUT";
  
    const url =
      _id === ""
        ? `/api/sUsers/addBarcodeData/${cmp_id}`
        : `/api/sUsers/editBarcodeData/${_id}/${cmp_id}`;
  
    try {
      // API call
      const res = await api[method.toLowerCase()](url, dataToSend, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
  
      // Show success message and navigate
      toast.success("Barcode Format Updated Successfully");
      dispatch(addBarcodeData(dataToSend));
      navigate("/sUsers/barcodeCreationDetails");
    } catch (error) {
      // Handle errors
      toast.error("Failed to update Barcode Format");
      console.error(error);
    }
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
            Update
          </button>
        </div>
      </form>
    </section>
  );
}

export default PrintOnOffTextArea;
