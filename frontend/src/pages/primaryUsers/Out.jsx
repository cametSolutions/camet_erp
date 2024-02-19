import React from "react";

function Out() {
  return (
    <div className="flex">
      <div className="overflow-y-hidden" style={{ height: "100vh" }}>
        <Sidebar onTabChange={handleTabChange} />
      </div>
    </div>
  );
}

export default Out;
