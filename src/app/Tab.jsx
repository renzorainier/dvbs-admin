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
      <div className="flex justify-center pt-10 items-center">
        <div className="w-full rounded-lg mx-auto " style={{ maxWidth: "90%" }}>
          <Switch
            checked={state}
            onChange={setState}
            className={`${
              state ? "bg-violet-400" : "bg-blue-400"
            } relative inline-flex h-[50px] w-full shrink-0 cursor-pointer rounded-lg border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}>
            <span
              aria-hidden="true"
              className={`${
                state ? "translate-x-full" : "translate-x-0"
              } pointer-events-none inline-block h-[47px] w-[50%] transform rounded-lg bg-gray-100 shadow-lg ring-0 transition duration-200 ease-in-out `}
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
      <div>
        {state ? (
          <div>
            <Visitors />
          </div>
        ) : (
          <div>
              <Members/>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tab;
