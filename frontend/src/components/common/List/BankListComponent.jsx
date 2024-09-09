/* eslint-disable react/prop-types */

import { FixedSizeList as List } from "react-window";
import { BsBank2 } from "react-icons/bs";
import { IoIosArrowRoundBack } from "react-icons/io";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";

function BankListComponent({ data, submitHandler }) {
  const [listHeight, setListHeight] = useState(0);

  useEffect(() => {
    const calculateHeight = () => {
      const headerHeight = document.querySelector("header")?.offsetHeight || 0;
      const windowHeight = window.innerHeight;
      setListHeight(windowHeight - headerHeight);
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  const handleBankSelection = (el) => {
    submitHandler(el);
  };

  const Row = ({ index, style }) => {
    const el = data[index];
    const adjustedStyle = {
      ...style,
      marginTop: "16px",
      height: "80px",
    };
    return (
      <div
        onClick={() => {
          handleBankSelection(el);
        }}
        key={index}
        style={adjustedStyle}
        className="bg-white shadow-lg px-6 p-4 pb-7 flex items-center gap-3 cursor-pointer drop-shadow-lg  "
      >
        <BsBank2 />
        <p className="font-bold text-sm">{el?.bank_name}</p>
      </div>
    );
  };

  return (
    <div>
      <header className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2 sticky top-0 z-50  ">
        <Link to={"/sUsers/receipt"}>
          <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer" />
        </Link>
        <p className="text-white text-lg   font-bold ">Select Bank</p>
      </header>
      <div
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "transparent transparent",
        }}
      >
        <List
          className=""
          height={listHeight}
          itemCount={data.length}
          itemSize={100}
          width="100%"
        >
          {Row}
        </List>
      </div>
    </div>
  );
}

export default BankListComponent;
