import TitleDiv from "../../../../components/common/TitleDiv";
import useFetch from "../../../../customHook/useFetch";

const AddSubGroup = () => {


// const {data,loading}=useFetch(`/api/sUsers/getSecUserData`);



  return (
    <div>
      <TitleDiv title="Add Sub Group" from="/sUsers/partySettings" />

      <div className="flex flex-col justify-center  sticky top-0 z-10 ">
        <div className=" flex justify-center items-center flex-col bg-[#457b9d] py-20 sm:py-14">
          <h2 className="font-bold uppercase text-white">
            ADD YOUR DESIRED Sub group
          </h2>

          <div className="absolute left-2 top-2">
            <select
              // value={selectedTab}
              className="w-full bg-[#457b9d] text-white sm:max-w-sm md:max-w-sm text-sm font-bold py-2 px-3 cursor-pointer no-focus-box border-none !border-b"
            >
              <option value="ledger">Ledger</option>
              <option value="payables">Payables</option>
              <option value="receivables">Receivables</option>
              <option value="group">Group</option>
            </select>
          </div>

          <input
            type="text"
            // onKeyDown={(e) => {
            //   if (e.key === "Enter") {
            //     handleSubmit(value);
            //   }
            // }}
            placeholder={`Enter your sub group name `}
            className=" w-4/6  sm:w-2/6   p-1 text-black border border-gray-300 rounded-full mt-3 text-center"
            // value={value}
            // onChange={(e) => setValue(e.target.value)}
          />
          <button
            // onClick={
            //   edit?.enabled
            //     ? () => editSubDetails(edit.id, value)
            //     : () => handleSubmit(value)
            // }
            className="bg-gray-800 text-white px-6 py-1 rounded-full mt-3 text-sm font-bold "
          >
            {/* {edit ? "Update" : "Submit"} */}
            Submit
          </button>
        </div>
        <div className="h-3 bg-gray-100 "></div>
      </div>
    </div>
  );
};

export default AddSubGroup;
