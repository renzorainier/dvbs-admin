import React, { useState, useEffect, useRef } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function DailyRewards() {
  const [primaryData, setPrimaryData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState("memoryVerse");
  const audioRef = useRef(null);
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);

  const configurations = [
    {
      name: "Primary",
      dbPath: "dvbs/primary",
      color: "#FFC100",
      fields: ["memoryVerse", "bestInCraft", "bestInActivitySheet", "bible"],
    },
    {
      name: "Middlers",
      dbPath: "dvbs/middlers",
      color: "#04d924",
      fields: ["memoryVerse", "bestInCraft", "bestInActivitySheet", "bible"],
    },
    {
      name: "Juniors",
      dbPath: "dvbs/juniors",
      color: "#027df7",
      fields: ["memoryVerse", "bestInCraft", "bestInActivitySheet", "bible"],
    },
    {
      name: "Youth",
      dbPath: "dvbs/youth",
      color: "#f70233",
      fields: ["memoryVerse", "bestInCraft", "bestInActivitySheet", "bible"],
    },
  ];

  const currentConfig = configurations[currentConfigIndex];

  useEffect(() => {
    const fetchPrimary = async () => {
      const docRef = doc(
        db,
        currentConfig.dbPath.split("/")[0],
        currentConfig.dbPath.split("/")[1]
      );
      const primarySnapshot = await getDoc(docRef);
      if (primarySnapshot.exists()) {
        setPrimaryData(primarySnapshot.data());
      } else {
        console.error("No such document!");
      }
    };

    fetchPrimary();
  }, [currentConfig.dbPath]);

  const getCurrentDayLetter = () => {
    const days = ["A", "B", "C", "D", "E"];
    const dayIndex = new Date().getDay();
    return days[dayIndex === 0 ? 6 : dayIndex - 1];
  };

  const handleClick = async (fieldName) => {
    const prefix = fieldName.slice(0, 2);
    const dayLetter = getCurrentDayLetter();
    const fieldToUpdate = `${prefix}${dayLetter}${selectedField}`;

    if (selectedField) {
      try {
        const docRef = doc(
          db,
          currentConfig.dbPath.split("/")[0],
          currentConfig.dbPath.split("/")[1]
        );

        // Toggle the field value
        const newValue = !primaryData[fieldToUpdate];

        await updateDoc(docRef, { [fieldToUpdate]: newValue });

        setPrimaryData((prevData) => ({
          ...prevData,
          [fieldToUpdate]: newValue,
        }));
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    } else {
      console.error("No field selected!");
    }
  };

  const getButtonColor = (fieldName) => {
    const prefix = fieldName.slice(0, 2);
    const dayLetter = getCurrentDayLetter();
    const fieldToCheck = `${prefix}${dayLetter}`;
    return primaryData[fieldToCheck];
  };

  const sortedNames = Object.keys(primaryData)
    .filter((fieldName) => fieldName.endsWith("name"))
    .map((fieldName) => primaryData[fieldName])
    .sort();

  const filteredNames = sortedNames.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="h-screen overflow-auto"
      style={{ backgroundColor: currentConfig.color }}
    >
      <div className="flex justify-center items-center overflow-auto">
        <div className="w-full rounded-lg mx-auto " style={{ maxWidth: "90%" }}>
          <div className="flex flex-col gap-4">
            {/* Dropdown for selecting configuration */}
            {/* Dropdown for selecting field to modify */}
            <div className="w-full max-w-md text-gray-700 bg-white p-5 border rounded-lg shadow-lg mx-auto">
              {/* Search input */}
              <input
                type="text"
                placeholder="Search names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 mb-4"
              />
              {/* Render student names */}
              <div className="flex flex-col gap-4 w-full max-w-md">
                {filteredNames.map((name, index) => {
                  const studentIndex = Object.keys(primaryData).find(
                    (key) => primaryData[key] === name
                  );

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      {/* Button for marking/unmarking */}
                      <button
                        className="flex-grow hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg"
                        style={{
                          backgroundColor: primaryData[
                            `${studentIndex.slice(
                              0,
                              2
                            )}${getCurrentDayLetter()}${selectedField}`
                          ]
                            ? currentConfig.color
                            : "#E5E7EB",
                        }}
                        onClick={() => {
                          handleClick(studentIndex);
                        }}
                      >
                        {name}
                      </button>
                      {/* Indicator */}
                      <div className="flex ml-1">
                        {["A", "B", "C", "D", "E"].map((dayLetter) => {
                          const fieldName = `${studentIndex.slice(
                            0,
                            2
                          )}${dayLetter}${selectedField}`;
                          const indicatorColor = primaryData[fieldName]
                            ? currentConfig.color
                            : "#E5E7EB";
                          return (
                            <div
                              key={dayLetter}
                              className="w-4 h-9 rounded-lg mr-1"
                              style={{ backgroundColor: indicatorColor }}
                            ></div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <audio ref={audioRef} />
    </div>
  );
}

export default DailyRewards;
