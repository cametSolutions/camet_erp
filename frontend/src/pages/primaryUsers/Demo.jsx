import React, { useState } from 'react';

const Demo = () => {
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle submission logic here
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        TYPE THE DESCRIPTION OF YOUR CASE BELOW
      </h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="START TYPING HERE"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            SUBMIT
          </button>
          <button
            type="button"
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            SEE RANK
          </button>
        </div>
      </form>
    </div>
  );
};

export default Demo;