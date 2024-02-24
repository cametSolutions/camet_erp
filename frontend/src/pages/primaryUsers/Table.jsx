import React, { useState } from 'react';

const Table = () => {
  const [rows, setRows] = useState([{ level: '', rate: '' }]);

  const handleAddRow = () => {
    setRows([...rows, { level: '', rate: '' }]);
  };

  const handleLevelChange = (index, value) => {
    const newRows = [...rows];
    newRows[index].level = value;
    setRows(newRows);
  };

  const handleRateChange = (index, value) => {
    const newRows = [...rows];
    newRows[index].rate = value;
    setRows(newRows);
  };

  return (
    <div className="container mx-auto mt-8">
      <table className="table-fixed w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="w-1/2 px-4 py-2">Level Name</th>
            <th className="w-1/2 px-4 py-2">Rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-2">
                <select
                  value={row.level}
                  onChange={(e) => handleLevelChange(index, e.target.value)}
                  className="block w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-sm focus:outline-none"
                >
                  {/* Options for dropdown */}
                  <option value="Option 1">Option 1</option>
                  <option value="Option 2">Option 2</option>
                  <option value="Option 3">Option 3</option>
                </select>
              </td>
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={row.rate}
                  onChange={(e) => handleRateChange(index, e.target.value)}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-sm focus:outline-none"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAddRow} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Add Row
      </button>
    </div>
  );
};

export default Table;
