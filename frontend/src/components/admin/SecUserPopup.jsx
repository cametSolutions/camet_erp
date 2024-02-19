/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */

import { useEffect,useState } from "react";

function SecUserPopup({filteredSecUsers,handleSecBlock ,setShowSecUSers,refresh}) {

    const [data,setData]=useState([])


    useEffect(()=>{

      setData(filteredSecUsers)

    },[refresh,filteredSecUsers])


  return (
    <div>
         <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <button onClick={() => setShowSecUSers(false)}>Close</button>
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="py-5 px-10">
                      Users
                    </th>
                    {/* <th scope="col" className="py-3 px-6">
                      Organizations
                    </th> */}

                    <th scope="col" className="py-5 px-10">
                      Approved
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data.map((user, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                      >
                        <td className="py-4 px-6">{user.name}</td>
                        {/* <td className="py-4 px-6">82926417</td> */}
                        <td className="py-5 ">
                          <div
                            class="toggle-button-cover"
                            onClick={() => {
                              handleSecBlock(user._id);
                            }}
                          >
                            <div id="button-4" class="button r">
                              <input
                                className="checkbox"
                                type="checkbox"
                                checked={user.isBlocked === true}
                              />
                              <div className="knobs"></div>
                              <div className="layer"></div>
                            </div>
                          </div>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td>No users</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
    </div>
  )
}

export default SecUserPopup