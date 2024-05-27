import React, { useState, useEffect, useRef } from "react";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase.js"; // Import your Firebase config
import Confetti from "react-confetti";
import { Menu, Transition } from "@headlessui/react";

function DailyRewards() {
  const [primaryData, setPrimaryData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [studentToMarkAbsent, setStudentToMarkAbsent] = useState(null);
  const [showBiblePopup, setShowBiblePopup] = useState(false);
  const [studentToUpdateBible, setStudentToUpdateBible] = useState(null);
  const [selectedField, setSelectedField] = useState(null); // New state for selected field
  const audioRef = useRef(null);

  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);

  const configurations = [
    {
      name: "Primary",
      dbPath: "dvbs/primary",
      color: "#FFC100",
    },
    {
      name: "Middlers",
      dbPath: "dvbs/middlers",
      color: "#04d924",
    },
    {
      name: "Juniors",
      dbPath: "dvbs/juniors",
      color: "#027df7",
    },
    {
      name: "Youth",
      dbPath: "dvbs/youth",
      color: "#f70233",
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
    const fieldToUpdate = `${prefix}${dayLetter}`;

    if (selectedField) {
      try {
        const docRef = doc(
          db,
          currentConfig.dbPath.split("/")[0],
          currentConfig.dbPath.split("/")[1],
          `${fieldName}${dayLetter}${selectedField}` // Constructing the document ID
        );

        // Add the document to Firebase with the selected field set to true
        await setDoc(docRef, { [selectedField]: true });

        // Update the local state to reflect the change
        setPrimaryData((prevData) => ({
          ...prevData,
          [`${fieldName}${dayLetter}${selectedField}`]: true,
        }));
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    } else {
      // Handle if no field is selected
      console.error("No field selected!");
    }
  };

  const updateStudentAttendance = async (fieldName, fieldToUpdate) => {
    try {
      const docRef = doc(
        db,
        currentConfig.dbPath.split("/")[0],
        currentConfig.dbPath.split("/")[1]
      );
      const newValue = primaryData[fieldToUpdate] ? "" : uploadTime;
      const bibleField = `${fieldToUpdate}bible`;

      await updateDoc(docRef, {
        [fieldToUpdate]: newValue,
        [bibleField]: newValue ? "" : false, // Reset Bible status to false instead of null
      });

      setPrimaryData((prevData) => ({
        ...prevData,
        [fieldToUpdate]: newValue,
        [bibleField]: newValue ? "" : false, // Reset Bible status to false instead of null
      }));

      // Play sound if student is marked present
      if (newValue) {
        playEnterSound();
        setStudentToUpdateBible(fieldName);
        setShowBiblePopup(true);
      }
    } catch (error) {
      console.error("Error updating Firebase: ", error);
    }

    setShowConfirmation(false);
    setStudentToMarkAbsent(null);
  };

  const updateBibleStatus = async (fieldName, broughtBible) => {
    try {
      const docRef = doc(
        db,
        currentConfig.dbPath.split("/")[0],
        currentConfig.dbPath.split("/")[1]
      );
      const dayLetter = getCurrentDayLetter();
      const bibleField = `${fieldName.slice(0, 2)}${dayLetter}bible`;

      await updateDoc(docRef, {
        [bibleField]: broughtBible ? true : false,
      });

      setPrimaryData((prevData) => ({
        ...prevData,
        [bibleField]: broughtBible ? true : false,
      }));
    } catch (error) {
      console.error("Error updating Firebase: ", error);
    }

    setShowBiblePopup(false);
    setStudentToUpdateBible(null);
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

  const playEnterSound = () => {
    const audio = new Audio("/point.wav");
    audio.play();
  };

  return (
    <div className="flex flex-col items-center">
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50" />
          <div className="bg-white rounded-lg p-5 shadow-md z-10 flex flex-col items-center">
            <p className="mb-2">Mark student as absent?</p>
            <div className="flex space-x-4">
              <button
                className="bg-red-500 text-white font-bold py-2 px-4 rounded"
                onClick={() =>
                  updateStudentAttendance(
                    studentToMarkAbsent.fieldName,
                    studentToMarkAbsent.fieldToUpdate
                  )
                }
              >
                Yes
              </button>
              <button
                className="bg-gray-500 text-white font-bold py-2 px-4 rounded"
                onClick={() => setShowConfirmation(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showBiblePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black opacity-50" />
        <div className="bg-white rounded-lg p-5 shadow-md z-10 flex flex-col items-center">
          <p className="mb-2">Did the student bring their Bible today?</p>
          <div className="flex space-x-4">
            <button
              className="bg-green-500 text-white font-bold py-2 px-4 rounded"
              onClick={() => updateBibleStatus(studentToUpdateBible, true)}
            >
              Yes
            </button>
            <button
              className="bg-red-500 text-white font-bold py-2 px-4 rounded"
              onClick={() => updateBibleStatus(studentToUpdateBible, false)}
            >
              No
            </button>
          </div>
        </div>
      </div>
    )}

    <Menu as="div" className="relative inline-block mt-4">
      <div>
        <Menu.Button className="inline-flex justify-center w-full rounded-md bg-black/20 px-4 py-2 text-sm font-bold text-white hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
          <h2 className="text-4xl font-bold">{configurations[currentConfigIndex].name}</h2>
        </Menu.Button>
      </div>
      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute mt-2 origin-top divide-y divide-gray-100 rounded-lg bg-gradient-to-b from-gray-100 to-white shadow-xl ring-1 ring-black/5 focus:outline-none flex flex-col items-center z-50">
          {configurations.map((config, index) => (
            <Menu.Item key={index}>
              {({ active }) => (
                <button
                  onClick={() => setCurrentConfigIndex(index)}
                  className={`${
                    active ? "bg-blue-500 text-white" : "text-gray-900"
                  } flex w-full items-center rounded-lg px-4 py-4 text-2xl font-semibold hover:bg-blue-100 transition-colors duration-200`}
                >
                  {config.name}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>

    {/* New menu selector for choosing the field to modify */}
    <Menu as="div" className="relative inline-block mt-4">
      <div>
        <Menu.Button className="inline-flex justify-center w-full rounded-md bg-black/20 px-4 py-2 text-sm font-bold text-white hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
          Select Field to Modify
        </Menu.Button>
      </div>
      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute mt-2 origin-top divide-y divide-gray-100 rounded-lg bg-gradient-to-b from-gray-100 to-white shadow-xl ring-1 ring-black/5 focus:outline-none flex flex-col items-center z-50">
          {/* Menu items for different fields */}
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => setSelectedField("memoryVerse")} // Update the selected field
                className={`${
                  active ? "bg-blue-500 text-white" : "text-gray-900"
                } flex w-full items-center rounded-lg px-4 py-4 text-2xl font-semibold hover:bg-blue-100 transition-colors duration-200`}
              >
                Memory Verse
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => setSelectedField("bestInCraft")} // Update the selected field
                className={`${
                  active ? "bg-blue-500 text-white" : "text-gray-900"
                } flex w-full items-center rounded-lg px-4 py-4 text-2xl font-semibold hover:bg-blue-100 transition-colors duration-200`}
              >
                Best in Craft
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => setSelectedField("bestInActivitySheet")} // Update the selected field
                className={`${
                  active ? "bg-blue-500 text-white" : "text-gray-900"
                } flex w-full items-center rounded-lg px-4 py-4 text-2xl font-semibold hover:bg-blue-100 transition-colors duration-200`}
              >
                Best in Activity Sheet
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>

    <div className="w-full max-w-md text-gray-700 bg-white p-5 border rounded-lg shadow-lg mx-auto">
      <input
        type="text"
        placeholder="Search names..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 mb-4"
      />
      <div className="flex flex-col gap-4">
        {filteredNames.map((name, index) => {
          const studentIndex = Object.keys(primaryData).find(
            (key) => primaryData[key] === name
          );

          return (
            <div key={index} className="flex items-center">
              <button
                className={`w-70-percent hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg ${getButtonColor(
                    studentIndex
                  )}`}
                  onClick={() => {
                    handleClick(studentIndex);
                  }}
                >
                  {name}
                </button>
                <div className="flex flex-row ml-1">
                  {["A", "B", "C", "D", "E"].map((dayLetter) => {
                    const fieldName = `${studentIndex.slice(0, 2)}${dayLetter}`;
                    return (
                      <div
                        key={dayLetter}
                        className={`w-4 h-9  rounded-lg ${
                          primaryData[fieldName]
                        } mr-1`}
                      ></div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <audio ref={audioRef} />
    </div>
  );
}

export default DailyRewards;


