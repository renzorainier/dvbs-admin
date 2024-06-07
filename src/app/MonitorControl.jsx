import React, { useState, useEffect, Fragment } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db2 } from "./firebaseConfig2"; // Adjust the path if necessary
import { Transition } from "@headlessui/react";

const MonitorControl = () => {
  const [selectedMonitor, setSelectedMonitor] = useState("");
  const [selectedComponent, setSelectedComponent] = useState("");
  const [currentComponent, setCurrentComponent] = useState("");
  const [monitorComponents, setMonitorComponents] = useState({});

  useEffect(() => {
    // Fetch current components for all monitors when component mounts
    const fetchMonitorComponents = async () => {
      const promises = monitors.map(async (monitor) => {
        const docRef = doc(db2, "points", monitor);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { [monitor]: docSnap.data().component || "" };
        } else {
          return { [monitor]: "" };
        }
      });
      const results = await Promise.all(promises);
      const componentsObj = Object.assign({}, ...results);
      setMonitorComponents(componentsObj);
    };

    fetchMonitorComponents();
  }, []); // Empty dependency array ensures it runs only once on mount

  useEffect(() => {
    if (selectedMonitor) {
      const docRef = doc(db2, "points", selectedMonitor);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          setCurrentComponent(docSnap.data().component || "");
        } else {
          setCurrentComponent("");
        }
      });
    }
  }, [selectedMonitor]);

  const handleUpdateFirebase = () => {
    if (selectedMonitor && selectedComponent) {
      const docRef = doc(db2, "points", selectedMonitor);

      const dataToUpdate = {
        component: selectedComponent,
      };

      setDoc(docRef, dataToUpdate, { merge: true })
        .then(() => {
          console.log("Document successfully updated!");
          setCurrentComponent(selectedComponent);
          setMonitorComponents((prev) => ({
            ...prev,
            [selectedMonitor]: selectedComponent,
          }));
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    }
  };

  const monitors = ["monitor1", "monitor2", "monitor3"];
  const components = ["Point", "Attendance", "Rank"];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 p-4">
      <div className="monitor-control p-8 bg-white rounded-lg shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
          Select Monitor
        </h2>
        <div className="mb-4 flex justify-center space-x-4">
          {monitors.map((monitor, index) => (
            <button
              key={index}
              className={`${
                selectedMonitor === monitor
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 text-gray-800"
              } py-2 px-6 rounded-lg font-semibold  transition-colors duration-300`}
              onClick={() => setSelectedMonitor(monitor)}>
              {monitor}
            </button>
          ))}
        </div>

        {selectedMonitor && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-center text-white bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 rounded-lg p-4 shadow-md">
              {monitorComponents[selectedMonitor]}
            </h3>
          </div>
        )}

        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
          Select Component
        </h2>
        <div className="relative inline-block text-left w-full mb-4">
          <div>
            <button
              className="inline-flex w-full justify-center rounded-lg bg-yellow-500 px-4 py-3 text-lg font-bold text-white  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
              onClick={() =>
                setSelectedComponent(selectedComponent ? "" : "")
              }>
              {selectedComponent || "Select a Component"}
            </button>
          </div>
          <Transition
            show={selectedComponent === ""} // Show when selectedComponent is set to "open"
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95">
            <div className="absolute mt-2 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="py-1">
                {components.map((component, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedComponent(component)}
                    className="text-gray-900 text-lg group flex w-full items-center px-4 py-2 hover:bg-gray-100">
                    {component}
                  </button>
                ))}
              </div>
            </div>
          </Transition>
        </div>

        <button
          onClick={handleUpdateFirebase}
          className="w-full py-3 px-4 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-colors duration-300">
          Confirm
        </button>
      </div>
    </div>
  );
};

export default MonitorControl;
