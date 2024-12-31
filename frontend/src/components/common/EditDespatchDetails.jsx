/* eslint-disable react/prop-types */
import React, { useState } from 'react';

function EditDespatchDetails({ despatchDetails, updateDespatchDetails }) {


  console.log(despatchDetails);

  const handleInputChange = (key, value) => {
    updateDespatchDetails({ ...despatchDetails, [key]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the updated details to your backend
    console.log("Updated Despatch Details:", despatchDetails);
    // You can add API call or state update logic here
  };

  const formatLabel = (key) => {
    if (key === 'despatchThrough') {
      return 'Despatch Through';
    }
    return key.split(/(?=[A-Z])/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };


  return (
    <div className="edit-despatch-details mt-7 px-4 text-xs">
      <form onSubmit={handleSubmit}>
        {Object.entries(despatchDetails).map(([key, value]) => (
          <div key={key} className="detail-row flex items-center justify-between mt-2 " >
            <label htmlFor={key}>{formatLabel(key)}:</label>
            <input
              type="text"
              className='border-b border-x-0 border-t-0 text-xs'
              id={key}
              value={value}
              onChange={(e) => handleInputChange(key, e.target.value)}
              placeholder={formatLabel(key)}
              style={{ boxShadow: "none", borderColor: "#b6b6b6" }}
            />
          </div>
        ))}
      </form>
    </div>
  );
}

export default EditDespatchDetails;