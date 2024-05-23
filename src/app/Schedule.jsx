import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db3 } from "./firebaseConfig3.js"; // Import your Firebase config
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function Schedule() {
  const [scheduleData, setScheduleData] = useState({});
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);

  const configurations = [
    {
      name: "Primary",
      db3Path: "sched/primary",
      color: "#FFC100",
    },
    {
      name: "Middlers",
      db3Path: "sched/middlers",
      color: "#04d924",
    },
    {
      name: "Juniors",
      db3Path: "sched/juniors",
      color: "#027df7",
    },
    {
      name: "Youth",
      db3Path: "sched/youth",
      color: "#f70233",
    },
  ];

  const currentConfig = configurations[currentConfigIndex];

  useEffect(() => {
    const fetchSchedule = async () => {
      const docRef = doc(
        db3,
        currentConfig.db3Path.split("/")[0],
        currentConfig.db3Path.split("/")[1]
      );
      const scheduleSnapshot = await getDoc(docRef);
      if (scheduleSnapshot.exists()) {
        const data = scheduleSnapshot.data();
        console.log(data);
        setScheduleData(data);
      } else {
        console.error("No such document!");
      }
    };

    fetchSchedule();
  }, [currentConfig.db3Path]);

  const renderSchedule = () => {
    const segments = Object.keys(scheduleData).filter((key) => key.length === 1);
    return segments.map((segment) => (
      <div key={segment} className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
        <h3 className="text-xl font-semibold">{scheduleData[segment]}</h3>
        <p><strong>Location:</strong> {scheduleData[`${segment}loc`]}</p>
        <p><strong>Start Time:</strong> {scheduleData[`${segment}start`]}</p>
        <p><strong>End Time:</strong> {scheduleData[`${segment}end`]}</p>
      </div>
    ));
  };

  return (
    <div
      style={{
        backgroundColor: `${configurations[currentConfigIndex].color}`,
      }}
      className="flex flex-col items-center">
      <Menu
        as="div"
        className="relative inline-block justify-center text-center mt-4">
        <div>
          <Menu.Button className="inline-flex w-full justify-center rounded-md bg-black/20 px-4 py-2 text-sm font-bold text-white hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
            <h2 className="text-4xl font-bold">
              {configurations[currentConfigIndex].name}
            </h2>
            <ChevronDownIcon
              className="ml-2 -mr-1 h-10 w-10"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>

        <Transition
          as={React.Fragment}
          enter="transition ease-out duration-200"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95">
          <Menu.Items className="absolute mt-2 origin-top divide-y divide-gray-100 rounded-lg bg-gradient-to-b from-gray-100 to-white shadow-xl ring-1 ring-black/5 focus:outline-none flex flex-col items-center z-50">
            {configurations.map((config, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <button
                    onClick={() => setCurrentConfigIndex(index)}
                    className={`${
                      active ? "bg-blue-500 text-white" : "text-gray-900"
                    } flex w-full items-center rounded-lg px-4 py-4 text-2xl font-semibold hover:bg-blue-100 transition-colors duration-200`}>
                    {config.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>

      <div className="w-full max-w-md text-gray-700 bg-white p-5 border rounded-lg shadow-lg mx-auto">
        {Object.keys(scheduleData).length > 0 ? (
          renderSchedule()
        ) : (
          <p className="text-center font-bold text-xl">Loading...</p>
        )}
      </div>
    </div>
  );
}

export default Schedule;
