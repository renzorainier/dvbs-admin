"use client";

import React from "react";
import Visitors from "./Visitors";
import Tab from "./Tab";
import Primary from "./Primary"
import InitializeData from "./InitializeData"
import AttendanceChart from "./AttendanceChart"


function Main({ configurations, currentConfigIndex, setCurrentConfigIndex  }) {
  return (
    <div>
      {/* <AttendanceChart/> */}
      <Tab configurations={configurations} currentConfigIndex={currentConfigIndex}
        setCurrentConfigIndex={setCurrentConfigIndex}/>
      {/* <InitializeData/> */}
    </div>
  );
}

export default Main;
