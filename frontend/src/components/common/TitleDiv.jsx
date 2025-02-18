/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import { IoIosArrowRoundBack } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import CustomBarLoader from "./CustomBarLoader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { BsThreeDotsVertical } from "react-icons/bs";

function TitleDiv({
  title,
  from = "",
  loading = false,
  rightSideContent = null,
  rightSideContentOnClick = () => {},
  dropdownContents = [],
}) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (from) {
      navigate(from, { replace: true });
    } else {
      navigate(-1, { replace: true });
    }
  };
  return (
    <div className="sticky top-0 z-50 ">
      <div className="  bg-[#012a4a] text-white  p-3 flex items-center gap-3 text-lg justify-between   ">
        <div className="flex items-center justify-center gap-2">
          <IoIosArrowRoundBack
            onClick={handleNavigate}
            className="cursor-pointer text-3xl"
          />
          <p className="font-bold"> {title}</p>
        </div>

        {rightSideContent && (
          <button
            onClick={rightSideContentOnClick}
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
              {dropdownContents.map((item, index) => (
                <Link key={index} to={item.to}>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={item.onClick}
                  >
                    {item.title}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {loading && <CustomBarLoader />}
    </div>
  );
}

export default TitleDiv;
