/* eslint-disable react/prop-types */

import { FixedSizeList as List } from "react-window";
import { BsBank2 } from "react-icons/bs";
import { useState } from "react";
import { useEffect } from "react";
import TitleDiv from "../TitleDiv";

function SourceListComponent({ data, submitHandler, source, loading }) {
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

  const handleSourceSelection = (el) => {
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
          handleSourceSelection(el);
        }}
        key={index}
        style={adjustedStyle}
        className="bg-white shadow-lg px-6 p-4 pb-7 flex items-center gap-3 cursor-pointer drop-shadow-lg  "
      >
        <BsBank2 />
        <p className="font-bold text-sm">
          {source === "cash" ? el?.cash_ledname : el?.bank_ledname}
        </p>
      </div>
    );
  };

  return (
    <div>
      <TitleDiv
        title="Select Source"
        from="/sUsers/receipt"
        loading={loading}
      />
      {}
      <div
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "transparent transparent",
        }}
      >
        {data?.length > 0 ? (
          <List
            className=""
            height={listHeight}
            itemCount={data.length}
            itemSize={100}
            width="100%"
          >
            {Row}
          </List>
        ) : (
          <div>
            <p className="text-center text-gray-500 mt-20 ">No data found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SourceListComponent;
