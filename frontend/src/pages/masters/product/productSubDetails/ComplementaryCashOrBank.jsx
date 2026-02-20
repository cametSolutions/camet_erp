import TitleDiv from "../../../../components/common/TitleDiv";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "@/api/api";
import { toast } from "sonner";

function ComplementaryCashOrBank() {
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [cashOrBankDetails, setCashOrBankDetails] = useState([]);

  let organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg,
  );
  useEffect(() => {
    const fetchData = async () => {
      try {
        let response = await api.get(
          `/api/sUsers/getComplementaryCashOrBank/${organization._id}`,
          {
            withCredentials: true,
          },
        );
        setCashOrBankDetails(response.data.data);
        console.log(response.data.data);
        let finOneSelected = response.data.data.find(item => item.isTaggedWithComplementary)

        console.log(finOneSelected);
        setSelectedValue(finOneSelected?._id);
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    };

    fetchData();
  }, []);

  console.log(selectedValue);

  const handleSubmit = () => {
    if (!selectedValue) {
      alert("Please select an option");
      return;
    }
    try {
      setLoading(true);
      api
        .post(
          `/api/sUsers/addComplementaryCashOrBank/${organization._id}`,
          { cashOrBank: selectedValue },
          {
            withCredentials: true,
          },
        )
        .then((res) => {
          toast.success(res.data.message);
          setLoading(false);
        });
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }

    console.log("Selected:", selectedValue);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1">
        <TitleDiv
          title="Add Complementary Cash Or Bank"
          from="/sUsers/restuarentSettings"
          loading={loading}
        />

        {/* Blue Background Section */}
        <div className="h-full flex justify-center items-center bg-[#457b9d]">
          <div className="flex flex-col items-center w-full">
            <h2 className="font-bold uppercase text-white mb-6 text-lg">
              Select Complementary Cash Or Bank
            </h2>

            {/* Pill Style Select Box */}
            <select
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              className="w-4/6 sm:w-2/6 p-3 text-black border border-gray-300 
                         rounded-full mb-5 text-center bg-gray-100 
                         focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="">Select Option</option>
              {cashOrBankDetails.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.partyName}
                </option>
              ))}
            </select>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="bg-gray-900 text-white px-8 py-2 rounded-full 
                         hover:bg-gray-800 transition duration-200"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplementaryCashOrBank;
