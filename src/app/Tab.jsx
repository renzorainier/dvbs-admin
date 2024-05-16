import React, { useState } from "react";
import { Switch } from "@headlessui/react";
import Visitors from "./Visitors.jsx";
import Primary from "./Primary.jsx";

const configurations = [
  {
    name: "Config 1",
    colors: { present: "bg-[#FFC100]", absent: "bg-gray-400" },
    dbPath: "dvbs/primary",
  },
  {
    name: "Config 2",
    colors: { present: "bg-[#34D399]", absent: "bg-gray-500" },
    dbPath: "dvbs/middlers",
  },
  {
    name: "Config 3",
    colors: { present: "bg-[#14e339]", absent: "bg-gray-500" },
    dbPath: "dvbs/juniors",
  },
  {
    name: "Config 4",
    colors: { present: "bg-[#00e0d9]", absent: "bg-gray-500" },
    dbPath: "dvbs/youth",
  },
];

function Tab() {
  const [state, setState] = useState(false);
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const currentConfig = configurations[currentConfigIndex];

  const toggleConfig = () => {
    setCurrentConfigIndex((prevIndex) => (prevIndex + 1) % configurations.length);
  };

  return (
    <div style={{ height: "100vh" }}>
      <div className="flex justify-center pt-7 pb-4 items-center">
        <div className="w-full rounded-lg mx-auto">
          <Switch
            checked={state}
            onChange={setState}
            className="relative inline-flex h-[50px] w-full shrink-0 cursor-pointer rounded-lg border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            style={{
              marginTop: "-0.5rem",
              transformOrigin: "top",
              borderBottomWidth: "1px",
              borderColor: "#E5E7EB",
              borderRadius: "0.5rem",
              boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -2px rgba(0,0,0,0.05)",
              ringWidth: "1px",
              ringColor: "rgba(0,0,0,0.2)",
              outline: "none",
            }}>
            <span
              aria-hidden="true"
              className={`${
                state ? "translate-x-full" : "translate-x-0"
              } pointer-events-none inline-block h-[47px] w-[50%] transform rounded-lg bg-gray-100 shadow-lg ring-0 transition duration-200 ease-in-out`}
            />
            <div className="absolute top-1/2 transform -translate-y-1/2 font-bold text-4xl flex container">
              <div className="column">
                <div>List</div>
              </div>
              <div className="column">
                <div>Add</div>
              </div>
            </div>
          </Switch>
        </div>
      </div>
      <button
        onClick={toggleConfig}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Toggle Configuration
      </button>
      <div>
        {state ? (
          <Visitors />
        ) : (
          <Primary config={currentConfig} />
        )}
      </div>
    </div>
  );
}

export default Tab;


// import React, { useState, useEffect } from "react";
// import { doc, updateDoc, getDocs, collection } from "firebase/firestore";
// import { db } from "./firebase.js";
// import { Switch } from "@headlessui/react";
// import Visitors from "./Visitors.jsx";
// import Primary from "./Primary.jsx";

// function Tab() {
//   const [state, setState] = useState(false);

//   return (
//     <div style={{ height: "100vh" }}>
//       <div className="flex justify-center pt-7 pb-4 items-center">
//         <div className="w-full rounded-lg mx-auto">
//           <Switch
//             checked={state}
//             onChange={setState}
//             className="relative inline-flex h-[50px] w-full shrink-0 cursor-pointer rounded-lg border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
//             style={{
//               // Translate Tailwind classes to inline styles
//               marginTop: "-0.5rem", // equivalent to mt-2
//               transformOrigin: "top", // equivalent to origin-top
//               borderBottomWidth: "1px", // equivalent to divide-y
//               borderColor: "#E5E7EB", // equivalent to divide-gray-100
//               borderRadius: "0.5rem", // equivalent to rounded-lg
//               boxShadow:
//                 "0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -2px rgba(0,0,0,0.05)", // equivalent to shadow-xl
//               ringWidth: "1px", // equivalent to ring-1
//               ringColor: "rgba(0,0,0,0.2)", // equivalent to ring-black/5
//               outline: "none", // equivalent to focus:outline-none
//             }}>
//             <span
//               aria-hidden="true"
//               className={`${
//                 state ? "translate-x-full" : "translate-x-0"
//               } pointer-events-none inline-block h-[47px] w-[50%] transform rounded-lg bg-gray-100 shadow-lg ring-0 transition duration-200 ease-in-out`}
//             />

//             <div className="absolute top-1/2 transform -translate-y-1/2 font-bold text-4xl flex container">
//               <div className="column">
//                 <div>List</div>
//               </div>
//               <div className="column">
//                 <div>Add</div>
//               </div>
//             </div>
//           </Switch>
//         </div>
//       </div>
//       <div>
//         {state ? (
//           <div>
//             <Visitors />
//           </div>
//         ) : (
//           <div>
//             <Primary />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Tab;
