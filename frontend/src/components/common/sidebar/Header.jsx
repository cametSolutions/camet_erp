/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */

function Header({selectedOrg, userData, setDropdown, dropdown,organizations,setShowSidebar,setLoader,setSelectedOrg,dispatch,navigate,setSelectedOrganization,showSidebar,handleLogout}) {
  return (
    <div>
          <div className="flex flex-col items-center mt-6 -mx-2">
          <img
            className="object-cover w-24 h-24 mx-2 rounded-full"
            // src="https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg"
            src={
              selectedOrg?.logo ||
              "https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg"
            }
            alt="avatar"
          />
          <h4 className="mx-2 mt-2 font-medium text-white dark:text-gray-200">
            {userData?.userName}
          </h4>
          <p className="mx-2 mt-1 text-sm font-medium text-white dark:text-gray-400">
            {userData?.email}
          </p>

          <button
            onClick={() => {
              setDropdown(!dropdown);
            }}
            id="dropdownDefaultButton"
            data-dropdown-toggle="dropdown"
            className="text-white mt-6 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="button"
          >
            {selectedOrg?.name || "No Company Added"}

            <svg
              class="w-2.5 h-2.5 ms-3"
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

          {dropdown && (
            <div
              className="relative flex justify-center
              "
            >
              <div
                id="dropdown"
                className="z-10 absolute mt-2    divide-y divide-gray-100 rounded-lg shadow w-44 bg-gray-700"
              >
                <ul
                  class="py-2 text-sm text-white dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  {organizations.map((el, index) => (
                    <li key={index}>
                      <a
                        onClick={() => {
                          setDropdown(!dropdown);
                          if (window.innerWidth <= 640) {
                            setShowSidebar(!showSidebar);
                          }
                          setLoader(true);
                          setTimeout(() => {
                            setSelectedOrg(el);
                            dispatch(setSelectedOrganization(el));
                            navigate("/pUsers/dashboard");
                            setLoader(false);
                          }, 1000);
                        }}
                        // onClick={() => handleDropDownchange(el)}
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-500 "
                      >
                        {el.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div>
            <button onClick={handleLogout} class="Btn">
              <div class="sign">
                <svg viewBox="0 0 512 512">
                  <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                </svg>
              </div>

              <div class="text">Logout</div>
            </button>
          </div>
        </div>
    </div>
  )
}

export default Header