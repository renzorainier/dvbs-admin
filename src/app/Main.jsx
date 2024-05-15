"use client";

import React from "react";
import Fetch from "./Fetch";
import Upload from "./Upload";
import Visitors from "./Visitors";
import Tab from "./Tab";
import Primary from "./Primary"
import IniitializeData from "./InitializeData"


function Main() {
  return (
    <div>
      {/* <Fetch />
      <Visitors/> */}
      {/* <Upload /> */}
      <Tab/>
      <IniitializeData/>

    </div>
  );
}

export default Main;
