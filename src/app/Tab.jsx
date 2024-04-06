import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDocs, collection } from "firebase/firestore";
import { db } from "./firebase.js";
import { Switch } from "@headlessui/react";
import Fetch from "./Fetch";
import Visitors from "./Visitors";
import Members from "./Members";

function Tab() {
  const [state, setState] = useState(false);
  return (
    <div>
      <div className="flex justify-center py-5 items-center">
        <div className="w-full rounded-lg mx-auto ">
          <Switch
            checked={state}
            onChange={setState}
            className={`${
              state ? "bg-violet-400" : "bg-blue-400"
            } relative inline-flex h-[50px] w-full shrink-0 cursor-pointer rounded-lg border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
          >
            <span
              aria-hidden="true"
              className={`${
                state ? "translate-x-full" : "translate-x-0"
              } pointer-events-none inline-block h-[47px] w-[50%] transform rounded-lg bg-gray-100 shadow-lg ring-0 transition duration-200 ease-in-out`}
            />
            <div className="absolute top-1/2 left-[12%] transform -translate-y-1/2 font-bold text-lg">
              Members
            </div>
            <div className="absolute top-1/2 right-[18%] transform -translate-y-1/2 font-bold text-lg">
              Visitors
            </div>
          </Switch>
        </div>
      </div>
      <div className="flex justify-center py-5 items-center">
        <div className="absolute mt-2 origin-top divide-y divide-gray-100 rounded-lg bg-gradient-to-b from-gray-100 to-white shadow-xl ring-1 ring-black/5 focus:outline-none flex flex-col items-center">
          <div className="w-full divide-y divide-gray-100">
            <div className="w-full">
              {state ? (
                <Members members={firstColumn} />
              ) : (
                <Visitors />
              )}
            </div>
            <div className="w-full">
              {state ? (
                <Members members={secondColumn} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}

export default Tab;
