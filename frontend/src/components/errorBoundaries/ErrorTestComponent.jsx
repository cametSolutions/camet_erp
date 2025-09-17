import  { useState } from 'react';

// Test component that throws an error on button click
export const ErrorTestComponent = () => {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('This is a test error to check Error Boundary!');
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', margin: '10px' }}>
      <h3>Error Boundary Test Component</h3>
      <p>Click the button below to trigger an error and test the Error Boundary:</p>
      <button 
        onClick={() => setShouldError(true)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Trigger Error
      </button>
    </div>
  );
};