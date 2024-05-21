"use client";

import React, { useState, useEffect } from "react";
import Visitors from "./Visitors";
import Tab from "./Tab";
import Primary from "./Primary";
import InitializeData from "./InitializeData";
import AttendanceChart from "./AttendanceChart";
import StudentOutTime from "./StudentOutTime";
import PointingSystemGraph from "./PointingSystemGraph";
import ScrollToTopButton from "./Scroll";

function Main() {
  const [currentComponent, setCurrentComponent] = useState(null);

  const handleButtonClick = (componentName) => {
    setCurrentComponent(componentName);
  };

  const handleBackButtonClick = () => {
    setCurrentComponent(null);
  };

  const renderCurrentComponent = () => {
    switch (currentComponent) {
      case "Tab":
        return <Tab />;
      case "Out":
        return <StudentOutTime />;
      case "Point":
        return <PointingSystemGraph />;
      case "Attendance":
        return <AttendanceChart />;
      // render other components as needed
      default:
        return (
          <div className="flex justify-center h-screen">
            <div className="mt-4 ax-w-screen-lg mx-auto">
              <div className="ml-5 text-white mr-5 mt-3 grid grid-cols-2 gap-4">
                <button
                  className="bg-blue-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 font-bold text-xl py-10 rounded-lg shadow-lg"
                  onClick={() => handleButtonClick("Tab")}
                  style={{ animation: "slide-from-left 1s ease forwards" }}>
                  Tab
                </button>

                <button
                  className="bg-violet-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 font-bold text-xl py-10 rounded-lg shadow-lg"
                  onClick={() => handleButtonClick("Out")}
                  style={{ animation: "slide-from-right 1s ease forwards" }}>
                  Out
                </button>

                <button
                  className="bg-blue-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 font-bold text-xl py-10 rounded-lg shadow-lg"
                  onClick={() => handleButtonClick("Point")}
                  style={{ animation: "slide-from-left 1s ease forwards" }}>
                  Point
                </button>

                <button
                  className="bg-violet-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 font-bold text-xl py-10 rounded-lg shadow-lg"
                  onClick={() => handleButtonClick("Attendance")}
                  style={{ animation: "slide-from-right 1s ease forwards" }}>
                  Attendance
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  // Style the back button with modern UI
  const backButton = currentComponent ? (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        className="bg-gradient-to-r from-blue-400 to-violet-400 hover:from-blue-500 hover:to-violet-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={handleBackButtonClick}>
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ transform: "rotate(270deg)" }}>
          <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  ) : null;

  const currentYear = new Date().getFullYear();

  return (
    <div className="fade-in">
      <div className="fade-in">
        <div>
          {backButton}
          {/* <ScrollToTopButton /> */}
          {renderCurrentComponent()}
          {/* <Analytics />  */}
        </div>
      </div>
    </div>
  );
}

export default Main;

// "use client";

// import React from "react";
// import Visitors from "./Visitors";
// import Tab from "./Tab";
// import Primary from "./Primary"
// import InitializeData from "./InitializeData"
// import AttendanceChart from "./AttendanceChart"
// import StudentOutTime from "./StudentOutTime"
// import PointingSystemGraph from "./PointingSystemGraph"

// function Main({ configurations, currentConfigIndex, setCurrentConfigIndex  }) {
//   return (
//     <div>
//       <AttendanceChart/>
// <Tab configurations={configurations} currentConfigIndex={currentConfigIndex}
//   setCurrentConfigIndex={setCurrentConfigIndex}/>
//       <StudentOutTime/>
//       <PointingSystemGraph/>

//     </div>
//   );
// }

// export default Main;
