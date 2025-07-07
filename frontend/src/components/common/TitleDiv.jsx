/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import { IoIosArrowRoundBack } from "react-icons/io"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { useState } from "react"
import CustomBarLoader from "./CustomBarLoader"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../../components/ui/dropdown-menu"
import { BsThreeDotsVertical } from "react-icons/bs"

function TitleDiv({
  title,
  from = "",
  loading = false,
  rightSideContent = null,
  rightSideModalComponent = null,
  rightSideContentOnClick = null,
  dropdownContents = [],
  customNavigate = null,
  // summaryType = null
}) {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const handleNavigate = () => {
    if (customNavigate) {
      customNavigate()
      return
    }
    if (from) {
     
      navigate(from, { replace: true})
    } else {
      navigate(-1, { replace: true })
    }
  }

  const { type } =
    useSelector((state) => state?.secSelectedOrganization?.secSelectedOrg) ||
    "self"

  const handleRightClick = () => {
    if (rightSideContentOnClick) {
      rightSideContentOnClick()
    } else {
      setShowModal(true)
    }
  }

  const handleDropdownClick = (item) => {
    if (item?.data) {
      localStorage.setItem(item?.savingName, JSON.stringify(item.data))
    }
    navigate(item?.to, {
      state: {
        from: item?.from
      }
    })
  }

  return (
    <div className="sticky top-0 z-50 ">
      <div className="bg-[#012a4a] text-white p-3 flex items-center gap-3 text-lg justify-between">
        <div className="flex items-center justify-center gap-2">
          <IoIosArrowRoundBack
            onClick={handleNavigate}
            className="cursor-pointer text-3xl"
          />
          <p className="font-bold"> {title}</p>
        </div>

        {rightSideContent && (
          <button
            onClick={handleRightClick}
            className="font-bold text-sm pr-2 cursor-pointer hover:scale-105 duration-300 ease-in-out hover:text-gray-200"
          >
            {rightSideContent}
          </button>
        )}

        {dropdownContents.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <BsThreeDotsVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-4 bg-[#012a4a] text-white text-xs p-2">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {dropdownContents.map((item, index) => {
                const isDisabled = item?.typeSpecific && type !== "self"
                return (
                  <div
                    key={index}
                    onClick={() => handleDropdownClick(item)}
                    style={
                      isDisabled
                        ? { pointerEvents: "none", opacity: "0.5" }
                        : {}
                    }
                  >
                    <DropdownMenuItem
                      className={`${
                        isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                      }   `}
                      onClick={isDisabled ? undefined : item.onClick}
                    >
                      {item.title}
                    </DropdownMenuItem>
                  </div>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {loading && <CustomBarLoader />}

      {/* Modal Rendering */}
      {showModal && rightSideModalComponent && (
        <div>
          {typeof rightSideModalComponent === "function"
            ? rightSideModalComponent({ setShowModal })
            : rightSideModalComponent}
        </div>
      )}
    </div>
  )
}

export default TitleDiv
