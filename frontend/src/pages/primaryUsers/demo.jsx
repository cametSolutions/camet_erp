                  {/* adding category */}
                  <hr className="mt-6 border-b-1 border-blueGray-300" />

                  <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                  Category{" "}
                   
                  </h6>

                  <div className="flex">
                  
                    <button
                      onClick={() => {
                        setDropdown({category:!dropdown.category});
                      }}
                    
                      id="dropdown-button"
                      data-dropdown-toggle="dropdown"
                      className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-green-200 border border-e-0 border-gray-300  hover:bg-green-300 focus:ring-1 focus:outline-none focus:ring-gray-300  "
                      type="button"
                    >
                      All Categories{" "}
                      <svg
                        className="w-2.5 h-2.5 ms-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    </button>
                    <div className="relative">
                      {dropdown.category && (
                        <div
                          id="dropdown"
                          className="z-50 absolute top-11 left-[-140px] bg-white divide-y divide-gray-100 rounded-lg shadow w-44 "
                        >
                          <ul
                            className="py-2 text-sm text-gray-700 "
                            aria-labelledby="dropdown-button"
                          >
                            <li>
                              <a
                                href="#"
                                className="block px-4 py-2 hover:bg-gray-100 "
                              >
                                Shopping
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="block px-4 py-2 hover:bg-gray-100 "
                              >
                                Images
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="block px-4 py-2 hover:bg-gray-100 "
                              >
                                News
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="block px-4 py-2 hover:bg-gray-100 "
                              >
                                Finance
                              </a>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="relative w-full">
                      <input
                        onChange={(e)=>setAddedCategory(e.target.value)}
                        value={addedCategory}
                        type="search"
                        id="search-dropdown"
                        className="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg rounded-s-gray-100 rounded-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter a new category"
                      />
                      <button
                        type="button"
                        className="absolute top-0 end-0  px-5 h-full text-sm font-medium text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-2 focus:outline-none focus:ring-blue-300 "
                      >
                        {/* <IoIosAddCircleOutline className="text-lg" /> */}
                        Add
                      </button>
                    </div>
                  </div>
                  {/* adding category */}
                  {/* adding subcategory */}
                  <hr className="mt-6 border-b-1 border-blueGray-300" />

                  <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                  SubCategory{" "}
                  
                  </h6>

                  <div className="flex">
                  
                    <button
                      onClick={() => {
                        setDropdown({subCategory:!dropdown.subCategory});
                      }}
                   
                      id="dropdown-button"
                      data-dropdown-toggle="dropdown"
                      className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-green-200 border border-e-0 border-gray-300  hover:bg-green-300 focus:ring-1 focus:outline-none focus:ring-gray-300  "
                      type="button"
                    >
                      All  SubCategories{" "}
                      <svg
                        className="w-2.5 h-2.5 ms-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    </button>
                    <div className="relative">
                      {dropdown.subCategory && (
                        <div
                          id="dropdown"
                          className="z-50 absolute top-11 left-[-165px] bg-white divide-y divide-gray-100 rounded-lg shadow w-44 "
                        >
                          <ul
                            className="py-2 text-sm text-gray-700 "
                            aria-labelledby="dropdown-button"
                          >
                            <li>
                              <a
                                href="#"
                                className="block px-4 py-2 hover:bg-gray-100 "
                              >
                                Shopping
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="block px-4 py-2 hover:bg-gray-100 "
                              >
                                Images
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="block px-4 py-2 hover:bg-gray-100 "
                              >
                                News
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="block px-4 py-2 hover:bg-gray-100 "
                              >
                                Finance
                              </a>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="relative w-full">
                      <input
                         onChange={(e)=>setAddedSubCategory(e.target.value)}
                         value={addedSubCategory}
                        type="search"
                        id="search-dropdown"
                        className="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg rounded-s-gray-100 rounded-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter a new sub category"
                      />
                      <button
                        type="button"
                        className="absolute top-0 end-0  px-5 h-full text-sm font-medium text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-2 focus:outline-none focus:ring-blue-300 "
                      >
                        {/* <IoIosAddCircleOutline className="text-lg" /> */}
                        Add
                      </button>
                    </div>
                  </div>
                  {/* adding subcategory */}