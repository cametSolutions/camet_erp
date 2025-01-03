/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import {
  IoIosAddCircle,
  IoIosArrowRoundBack,
  IoMdArrowDown,
} from "react-icons/io";
import SearchBar from "../../common/SearchBar";
import { BarLoader } from "react-spinners";

import { formatAmount } from "../../../../../backend/helpers/helper";
import { useLocation, useNavigate } from "react-router-dom";

function PartyList({
  backHandler,
  searchData,
  loading,
  filteredParties,
  selectHandler,
  filter = false
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const clickHandler = () => {
    navigate("/sUsers/addParty", { state: { from: location.pathname } });
  };

  return (
    <div className=" bg-slate-50 flex-1 ">
      <div className="sticky top-0 z-20">
        <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex justify-between items-center">
          <div className="flex items-center justify-center gap-2">
            <IoIosArrowRoundBack
              onClick={backHandler}
              className="text-3xl text-white cursor-pointer"
            />
            <p className="text-white text-lg font-bold">Your Customers</p>
          </div>
          <div>
            <button
              onClick={clickHandler}
              className="flex items-center gap-2 text-white bg-[#40679E] px-2 py-1 rounded-md text-xs hover:scale-105 duration-100 ease-in-out"
            >
              <IoIosAddCircle className="text-xl" />
              Add Customers
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar onType={searchData} />
      </div>

      {/* Party List */}
      {loading ? (
        // Show loader while data is being fetched
        <section className="w-full">
          <BarLoader color="#9900ff" width="100%" />
        </section>
      ) : (
        <>
          {filter && (
            <div
              onClick={() => selectHandler({})}
              className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex justify-between mx-2 rounded-sm cursor-pointer hover:bg-slate-100"
            >
              <p className="font-bold">All</p>
            </div>
          )}
          {filteredParties?.length > 0 ? (
            // Show party list if parties are available
            filteredParties.map((el, index) => (
              <div
                onClick={() => selectHandler(el)}
                key={index}
                className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex justify-between mx-2 rounded-sm cursor-pointer hover:bg-slate-100"
              >
                <section>
                  <p className="font-bold">{el?.partyName}</p>
                  <p className="font-medium text-gray-500 text-sm">Customer</p>
                </section>
                {el?.totalOutstanding && el?.totalOutstanding > 0 && (
                  <section>
                    <p className="font-medium text-gray-500 text-md mr-3 flex items-center gap-2">
                      <IoMdArrowDown color="green" />
                      {formatAmount(el?.totalOutstanding)}
                    </p>
                  </section>
                )}
              </div>
            ))
          ) : (
            // Show message if no parties are available
            <div className="font-bold flex justify-center items-center mt-12 text-gray-500">
              No Parties !!!
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PartyList;
