/* eslint-disable react/prop-types */
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link } from "react-router-dom";
import { FixedSizeList as List } from "react-window";
import CallIcon from "../CallIcon";

function PartyListComponent({ filteredParty, type, deleteHandler,user="secondary" }) {


  console.log(user);

  const handleDelete = (id) => {
    deleteHandler(id);
  };


  const Row = ({ index, style }) => {
    const el = filteredParty[index];
    const adjustedStyle = {
      ...style,
      marginTop: "16px",
      height: "150px",
    };
    return (
      <div
        key={index}
        style={adjustedStyle}
        className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex flex-col mx-2 rounded-sm cursor-pointer hover:bg-slate-100 pr-7"
      >
        <div className="flex justify-between w-full gap-3 ">
          <div className="">
            <p className="font-bold text-sm">{el?.partyName}</p>
            {el.accountGroup && (
              <div className="flex">
                <p className="font-medium mt-2 text-gray-500 text-sm">
                  {el?.accountGroup}
                </p>
              </div>
            )}
          </div>
          <div
            className={`${
              type !== "self"
                ? "pointer-events-none cursor-default opacity-50"
                : ""
            } flex justify-center items-center gap-4`}
          >
            {/* <IoIosCall
              color="green"
              size={20}
              onClick={() => handleCallClick(el?.mobileNumber)}
              className="cursor-pointer"
            /> */}

            <CallIcon phoneNumber={el?.mobileNumber} size={18} color="green" />
            <Link to={`/${user==="secondary"?"sUsers":"pUsers"}/editParty/${el._id}`}>
              <FaEdit className="text-blue-500" />
            </Link>
            <MdDelete
              onClick={() => {
                handleDelete(el._id);
              }}
              className="text-red-500"
            />
          </div>
        </div>
        <div className="flex gap-2 text-nowrap text-sm mt-1">
          <p className="font-semibold">Mobile :</p>
          <p className="font-semibold text-gray-500"> {el?.mobileNumber}</p>
        </div>
        <hr className="mt-6" />
      </div>
    );
  };

  return (
    <div
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "transparent transparent",
      }}
    >
      <List
        className=""
        height={500}
        itemCount={filteredParty.length}
        itemSize={160}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
}

export default PartyListComponent;
