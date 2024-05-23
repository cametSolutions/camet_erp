import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { VariableSizeList as List } from "react-window";

import "./styles.css";

const Row = ({ index, style, toggleSize }) => (
  <div className={index % 2 ? "ListItemOdd" : "ListItemEven"} style={style}>
    Row {index}, Size {style.height}{" "}
    <button onClick={() => toggleSize(index)}>Toggle Size</button>
  </div>
);

const Demo = () => {
  const [rowSizes, setRowSizes] = useState(new Array(1000).fill(50));
  const listRef = useRef(null);

  const toggleSize = (i) => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(i);
    }
    setRowSizes((prevSizes) => {
      const newSizes = [...prevSizes];
      newSizes[i] = prevSizes[i] === 50 ? 75 : 50;
      return newSizes;
    });
  };

  const getSize = (i) => {
    return rowSizes[i];
  };

  return (
    <List
      ref={listRef}
      className="List"
      height={150}
      itemCount={1000}
      itemSize={getSize}
      width={300}
    >
      {(props) => <Row {...props} toggleSize={toggleSize} />}
    </List>
  );
};


export default Demo;
