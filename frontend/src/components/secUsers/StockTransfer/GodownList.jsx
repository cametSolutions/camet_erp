/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import SearchBar from "../../common/SearchBar";
import TitleDiv from "@/components/common/TitleDiv";

function GodownList({ searchData, loading, filteredGodowns, selectHandler }) {
  return (
    <div className="flex-1">
      <div className=" bg-slate-50 ">
        <div className="sticky top-0 z-20">
          <TitleDiv title={"Select Godown"} loading={loading} />

          <SearchBar onType={searchData} />
        </div>

        {filteredGodowns?.length > 0 ? (
          // Show party list if parties are available
          filteredGodowns?.map((el, index) => (
            <div
              onClick={() => {
                selectHandler(el);
              }}
              key={index}
              className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex justify-between mx-2 rounded-sm cursor-pointer hover:bg-slate-100"
            >
              <div className="">
                <p className="font-bold">{el?.godown}</p>
                <p className="font-medium text-gray-500 text-sm">Godown</p>
              </div>
            </div>
          ))
        ) : (
          // Show message if no parties are available
          <div className="font-bold flex justify-center items-center mt-12 text-gray-500">
            No Godowns !!!
          </div>
        )}
      </div>
    </div>
  );
}

export default GodownList;
