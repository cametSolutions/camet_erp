import React, { useState } from 'react';

function YourComponent() {
  const [rows, setRows] = useState([{ id: 1, greaterThan: '', upto: '', taxabilityType: '', igstRate: '', cgstRate: '', sgstUtgstRate: '', basedOnValue: '', basedOnQuantity: '' }]);

  const handleAddRow = () => {
    const newRow = { id: rows.length + 1, greaterThan: '', upto: '', taxabilityType: '', igstRate: '', cgstRate: '', sgstUtgstRate: '', basedOnValue: '', basedOnQuantity: '' };
    setRows([...rows, newRow]);
  };

  const handleDeleteRow = (id) => {
    const updatedRows = rows.filter(row => row.id !== id);
    setRows(updatedRows);
  };

  const handleChange = (id, e) => {
    const { name, value } = e.target;
    const updatedRows = rows.map(row => {
      if (row.id === id) {
        return { ...row, [name]: value };
      }
      return row;
    });
    setRows(updatedRows);
  };

  const isExemptOrNilRatedOrNonGST = (taxabilityType) => {
    return taxabilityType === 'Exempt' || taxabilityType === 'Nil Rated' || taxabilityType === 'Non GST';
  };

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th>Actions</th>
            <th>Greater than</th>
            <th>Upto</th>
            <th>Taxability Type</th>
            <th>IGST Rate</th>
            <th>CGST Rate</th>
            <th>SGST/UTGST Rate</th>
            <th>Based On Value</th>
            <th>Based On Quantity</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <button onClick={() => handleDeleteRow(row.id)}>Delete</button>
              </td>
              <td><input type="text" name="greaterThan" value={row.greaterThan} onChange={(e) => handleChange(row.id, e)} /></td>
              <td><input type="text" name="upto" value={row.upto} onChange={(e) => handleChange(row.id, e)} /></td>
              <td>
                <select name="taxabilityType" value={row.taxabilityType} onChange={(e) => handleChange(row.id, e)}>
                  <option value="">Select</option>
                  <option value="Exempt">Exempt</option>
                  <option value="Nil Rated">Nil Rated</option>
                  <option value="Non GST">Non GST</option>
                  <option value="Taxable">Taxable</option>
                </select>
              </td>
              <td><input type="text" name="igstRate" value={row.igstRate} onChange={(e) => handleChange(row.id, e)} disabled={isExemptOrNilRatedOrNonGST(row.taxabilityType)} /></td>
              <td><input type="text" name="cgstRate" value={row.cgstRate} onChange={(e) => handleChange(row.id, e)} disabled={isExemptOrNilRatedOrNonGST(row.taxabilityType)} /></td>
              <td><input type="text" name="sgstUtgstRate" value={row.sgstUtgstRate} onChange={(e) => handleChange(row.id, e)} disabled={isExemptOrNilRatedOrNonGST(row.taxabilityType)} /></td>
              <td><input type="text" name="basedOnValue" value={row.basedOnValue} onChange={(e) => handleChange(row.id, e)} disabled={!isExemptOrNilRatedOrNonGST(row.taxabilityType)} /></td>
              <td><input type="text" name="basedOnQuantity" value={row.basedOnQuantity} onChange={(e) => handleChange(row.id, e)} disabled={!isExemptOrNilRatedOrNonGST(row.taxabilityType)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAddRow}>Add Row</button>
    </div>
  );
}

export default YourComponent;
