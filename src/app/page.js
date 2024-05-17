"use client";
import Image from "next/image.js";
import Main from "./Main.jsx";
import Head from "next/head.js";
import React, { useState, Fragment } from "react";

export default function Home() {
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);

  const configurations = [
    {
      name: "Primary",
      colors: { present: "bg-[#FFC100]", absent: "bg-gray-400" },
      dbPath: "dvbs/primary",
      color: "#FFC100", // Corrected property name
    },
    {
      name: "Middlers",
      colors: { present: "bg-[#04d924]", absent: "bg-gray-500" },
      dbPath: "dvbs/middlers",
      color: "#04d924", // Added color property
    },
    {
      name: "Juniors",
      colors: { present: "bg-[#027df7]", absent: "bg-gray-500" },
      dbPath: "dvbs/juniors",
      color: "#027df7", // Added color property
    },
    {
      name: "Youth",
      colors: { present: "bg-[#f70233]", absent: "bg-gray-500" },
      dbPath: "dvbs/youth",
      color: "#f70233", // Added color property
    },
  ];

  return (
    <>
      <Head>
        <title>Attendance</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400&amp;display=swap"
          rel="stylesheet"
        />
      </Head>

      <div style={{ backgroundColor: `${configurations[currentConfigIndex].color}` }}>
        <div className="flex justify-center items-center">
          <div className="w-full rounded-lg mx-auto"
style={{ maxWidth: "90%" }}
           >
            <Main
              configurations={configurations}
              currentConfigIndex={currentConfigIndex}
              setCurrentConfigIndex={setCurrentConfigIndex}
            />
          </div>
        </div>
      </div>
    </>
  );
}


