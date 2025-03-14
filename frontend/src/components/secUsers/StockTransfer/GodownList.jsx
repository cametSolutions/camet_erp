/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { IoIosArrowRoundBack } from 'react-icons/io';
import SearchBar from '../../common/SearchBar';
import { HashLoader } from 'react-spinners';

function GodownList({backHandler,searchData,loading,filteredGodowns,selectHandler}) {
  return (
    <div className='flex-1'>
         <div className=" bg-slate-50 ">
        <div className="sticky top-0 z-20">
          <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2  ">
            <IoIosArrowRoundBack
              onClick={backHandler}
              className="text-3xl text-white cursor-pointer"
            />
            <p className="text-white text-lg   font-bold ">Select Godown</p>
          </div>

          {/* invoiec date */}
          <SearchBar onType={searchData} />
        </div>

        {/* adding party */}

        {loading ? (
          // Show loader while data is being fetched
          <div className=" flex justify-center items-center h-screen">
            <figure className="  w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center ">
              <HashLoader color="#6056ec" size={30} speedMultiplier={1.6} />
            </figure>
          </div>
        ) : filteredGodowns?.length > 0 ? (
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
  )
}

export default GodownList