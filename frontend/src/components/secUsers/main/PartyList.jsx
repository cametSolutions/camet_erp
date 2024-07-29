/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { IoIosArrowRoundBack } from 'react-icons/io';
import SearchBar from '../../common/SearchBar';
import { HashLoader } from 'react-spinners';

function PartyList({backHandler,searchData,loading,filteredParties,selectHandler}) {
  return (
    <div className='flex-1'>
         <div className=" bg-slate-50 ">
        <div className="sticky top-0 z-20">
          <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2  ">
            <IoIosArrowRoundBack
              onClick={backHandler}
              className="text-3xl text-white cursor-pointer"
            />
            <p className="text-white text-lg   font-bold ">Select Party</p>
          </div>

          {/* invoiec date */}
          <div className=" p-4  bg-white drop-shadow-lg">
            <div className="flex justify-between  items-center">
              {/* <div className=" flex flex-col gap-1 justify-center">
              <p className="text-md font-semibold text-violet-400">
                Search Parties
              </p>
            </div>
            <div className="flex items-center hover_scale cursor-pointer">
              <p className="text-pink-500 m-2 cursor-pointer  ">Cancel</p>
              <MdCancel className="text-pink-500" />
            </div> */}
            </div>
            <div className=" md:w-1/2 ">
              {/* search bar */}
              <div className="relative  ">
                <div className="absolute inset-y-0 start-0 flex items-center  pointer-events-none ">
                  <svg
                    className="w-4 h-4 text-gray-500 "
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <SearchBar onType={searchData} />

              </div>

              {/* search bar */}
            </div>
          </div>
        </div>

        {/* adding party */}

        {loading ? (
          // Show loader while data is being fetched
          <div className=" flex justify-center items-center h-screen">
            <figure className="  w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center ">
              <HashLoader color="#6056ec" size={30} speedMultiplier={1.6} />
            </figure>
          </div>
        ) : filteredParties?.length > 0 ? (
          // Show party list if parties are available
          filteredParties?.map((el, index) => (
            <div
              onClick={() => {
                selectHandler(el);
              }}
              key={index}
              className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex justify-between mx-2 rounded-sm cursor-pointer hover:bg-slate-100"
            >
              <div className="">
                <p className="font-bold">{el?.partyName}</p>
                <p className="font-medium text-gray-500 text-sm">Customer</p>
              </div>
              
            </div>
          ))
        ) : (
          // Show message if no parties are available
          <div className="font-bold flex justify-center items-center mt-12 text-gray-500">
            No Parties !!!
          </div>
        )}
      </div>
    </div>
  )
}

export default PartyList