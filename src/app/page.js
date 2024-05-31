"use client";
import Image from "next/image.js";
import Main from "./Main.jsx";
import Head from "next/head.js";
import React, { useState, Fragment } from "react";

export default function Home() {


  return (
    <>
      <Head>
        <title>Attendance</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
      </Head>

      <div>
        {/* <div className="flex justify-center items-center overflow-auto">
          <div
            className="w-full rounded-lg mx-auto"
            style={{ maxWidth: "90%" }}> */}
            <Main
            // configurations={configurations}
            // currentConfigIndex={currentConfigIndex}
            // setCurrentConfigIndex={setCurrentConfigIndex}
            />
          {/* </div>
        </div> */}
      </div>
    </>
  );
}
