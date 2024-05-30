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
import Schedule from "./Schedule";
import CopyScheduleData from "./CopyScheduleData";
import DailyRewards from "./DailyRewards";
import SalvationDecision from "./SalvationDecision";
import CopyPreviousDayPoints from "./CopyPreviousDayPoints"

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
      case "Schedule":
        return <Schedule />;
        case "Rewards":
          return <DailyRewards />;
          case "SalvationDecision":
            return <SalvationDecision/>;
            // case "Copy":
            //   return <CopyPreviousDayPoints/>;
      // render other components as needed
      default:
        return (
          <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-800 to-purple-800">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button
                  className="focus:outline-none bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                  onClick={() => handleButtonClick("Tab")}
                  style={{ animation: "slide-from-left 1s ease forwards" }}>
                  Attendance
                </button>
                <button
                  className="focus:outline-none bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                  onClick={() => handleButtonClick("Attendance")}
                  style={{ animation: "slide-from-right 1s ease forwards" }}>
                  List
                </button>

                <button
                  className="focus:outline-none bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                  onClick={() => handleButtonClick("Schedule")}
                  style={{ animation: "slide-from-right 1s ease forwards" }}>
                  Schedules
                </button>

                <button
                  className="focus:outline-none bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                  onClick={() => handleButtonClick("Point")}
                  style={{ animation: "slide-from-left 1s ease forwards" }}>
                  Points
                </button>



                <button
                  className="focus:outline-none bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                  onClick={() => handleButtonClick("Rewards")}
                  style={{ animation: "slide-from-right 1s ease forwards" }}>
                  Rewards
                </button>
                <button
                  className="focus:outline-none bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                  onClick={() => handleButtonClick("SalvationDecision")}
                  style={{ animation: "slide-from-right 1s ease forwards" }}>
                  Salvation
                </button>

                <button
                  className="focus:outline-none bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                  onClick={() => handleButtonClick("Out")}
                  style={{ animation: "slide-from-right 1s ease forwards" }}>
                  Out
                </button>
                {/* <button
                  className="focus:outline-none bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                  onClick={() => handleButtonClick("Copy")}
                  style={{ animation: "slide-from-right 1s ease forwards" }}>
                  Copy
                </button> */}

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
        className="bg-gray-500   text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 "
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
          {/* <CopyScheduleData/> */}
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
