import  { useEffect, useState } from 'react';
import { MdDelete, MdPlaylistAdd } from "react-icons/md";

const Table = ({ levelNames }) => {
  const [rows, setRows] = useState([{ id: Math.random(), level: '', rate: '' }]);
  const [levelnames, setLevelNames] = useState([]);
  const [levelNameData, setLevelNameData] = useState([]);
  console.log(levelNameData);

  useEffect(() => {
    setLevelNames(levelNames);
  }, [levelNames]);

  useEffect(() => {
    // Update levelNameData whenever rows change
    setLevelNameData(rows.map(row => ({ level: row.level, rate: row.rate })));
  }, [rows]);

  const handleAddRow = () => {
    setRows([...rows, { id: Math.random(), level: '', rate: '' }]);
  };

  const handleDeleteRow = (id) => {
    setRows(rows.filter(row => row.id !== id));
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
      <table className="table-fixed w-full bg-white shadow-md rounded-lg ">
        <thead className="bg-[#f7f7f7] border">
          <tr>
            <th className="w-1/2 px-4 py-1">Level Name</th>
            <th className="w-1/2 px-4 py-1">Rate</th>
            <th className="  w-2/12 px-4 py-1"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id} className="border-b bg-[#EFF6FF] ">
              <td className="px-4 py-2">
                <select
                  value={row.level}
                  onChange={(e) => handleLevelChange(index, e.target.value)}
                  className="block w-full  px-4  rounded-md bg-[#EFF6FF] text-sm focus:outline-none"
                >
                  {/* Options for dropdown */}
                  <option value="">Select Level</option>
                  {levelnames.map((el, index) => (
                    <option key={index} value={el}>{el}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 ">
                <input
                  type="text"
                  value={row.rate}
                  onChange={(e) => handleRateChange(index, e.target.value)}
                  className="w-full py-1 px-4 border bg-[#EFF6FF] border-gray-300   text-sm focus:outline-none"
                />
              </td>
              <td className="px-4 py-2">
                <button onClick={() => handleDeleteRow(row.id)} className="text-red-600 hover:text-red-800"><MdDelete /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAddRow} className="mt-4 px-3 py-1 bg-green-500 text-white rounded">
        <MdPlaylistAdd />
      </button>
    
    </div>
  );
};

export default Table;
