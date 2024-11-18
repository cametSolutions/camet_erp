/* eslint-disable react/prop-types */
import React from 'react'
import { IoIosAddCircle } from 'react-icons/io'

function FooterButton({submitHandler,tab,title,loading}) {
  return (
    <div>
          <div className="  sm:hidden  fixed bottom-0 left-0 w-full bg-white shadow-lg z-50  ">
          <div className="flex justify-center overflow-hidden w-full">
          <button
                onClick={submitHandler}
                className= {` ${loading && "pointer-events-none opacity-80"} bottom-0 text-white bg-violet-700  w-full  p-2 py-3 flex items-center justify-center gap-2 hover_scale cursor-pointer `}
              >
                <IoIosAddCircle className="text-2xl" />
                {title === "Stock Transfer" ? (
                  <p>Transfer Stock</p>
                ) : (
                  <p>{tab === "add" ? `Generate ${title}` : `Edit ${title}`}</p>
                )}
              </button>
          </div>
        </div>
    </div>
  )
}

export default FooterButton
