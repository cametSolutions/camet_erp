/* eslint-disable react/prop-types */
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link } from "react-router-dom";
import { FixedSizeList as List } from "react-window";
import CallIcon from "../CallIcon";
import { useEffect, useState } from "react";

function PartyListComponent({ filteredParty, type, deleteHandler,user="secondary" }) {

  const [listHeight, setListHeight] = useState(0);

  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 117;
      setListHeight(newHeight);
    };


    // Calculate the height on component mount and whenever the window is resized
    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);


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
        className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex flex-col  rounded-sm cursor-pointer hover:bg-slate-100 pr-7"
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
            className={` flex justify-center items-center gap-4`}
          >
           

            <CallIcon phoneNumber={el?.mobileNumber} size={18} color="green" />
            <Link to={`/${user==="secondary"?"sUsers":"pUsers"}/editParty/${el._id}`}>
              <FaEdit className="text-blue-500" />
            </Link>

            {
              type == "self" && (
                <MdDelete
                onClick={() => {
                  handleDelete(el._id);
                }}
                className="text-red-500"
              />

              )
            }
           
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
        // scrollbarColor: "transparent transparent",
      }}
    >
      <List
        className=""
        height={listHeight}
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
