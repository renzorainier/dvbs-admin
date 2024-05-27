import React, { useState, useEffect, useRef, Fragment } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase.js"; // Import your Firebase config
import Confetti from "react-confetti";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";

const configurations = [
  {
    name: "Primary",
    colors: { present: "bg-[#FFC100]", absent: "bg-gray-400" },
    dbPath: "dvbs/primary",
    color: "#FFC100",
    ageRange: [4, 5, 6],
  },
  {
    name: "Middlers",
    colors: { present: "bg-[#04d924]", absent: "bg-gray-500" },
    dbPath: "dvbs/middlers",
    color: "#04d924",
    ageRange: [7, 8, 9],
  },
  {
    name: "Juniors",
    colors: { present: "bg-[#027df7]", absent: "bg-gray-500" },
    dbPath: "dvbs/juniors",
    color: "#027df7",
    ageRange: [10, 11, 12],
  },
  {
    name: "Youth",
    colors: { present: "bg-[#f70233]", absent: "bg-gray-500" },
    dbPath: "dvbs/youth",
    color: "#f70233",
    ageRange: [13, 14, 15],
  },
];

function DailyRewards() {
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const [primaryData, setPrimaryData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [studentToMarkAbsent, setStudentToMarkAbsent] = useState(null);
  const [showBiblePopup, setShowBiblePopup] = useState(false);
  const [studentToUpdateBible, setStudentToUpdateBible] = useState(null);
  const audioRef = useRef(null);

  const currentConfig = configurations[currentConfigIndex];
  const uploadTime = new Date().toLocaleString();

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

  const handleClick = (fieldName) => {
    const prefix = fieldName.slice(0, 2);
    const dayLetter = getCurrentDayLetter();
    const fieldToUpdate = `${prefix}${dayLetter}`;

    if (primaryData[fieldToUpdate]) {
      setStudentToMarkAbsent({ fieldName, fieldToUpdate });
      setShowConfirmation(true);
    } else {
      updateStudentAttendance(fieldName, fieldToUpdate);
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
        [bibleField]: newValue ? "" : false,
      });

      setPrimaryData((prevData) => ({
        ...prevData,
        [fieldToUpdate]: newValue,
        [bibleField]: newValue ? "" : false,
      }));

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
    return primaryData[fieldToCheck]
      ? currentConfig.colors.present
      : currentConfig.colors.absent;
  };

  const countPresentForToday = () => {
    const dayLetter = getCurrentDayLetter();
    return Object.keys(primaryData).filter(
      (key) => key.endsWith(dayLetter) && primaryData[key]
    ).length;
  };

  const countAbsentForToday = () => {
    const dayLetter = getCurrentDayLetter();
    const totalStudents = Object.keys(primaryData).filter((key) =>
      key.endsWith(dayLetter)
    ).length;
    const presentCount = countPresentForToday();
    return totalStudents - presentCount;
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

      <Menu as="div" className="relative inline-block justify-center text-center mt-4">
        <div>
          <Menu.Button className="inline-flex w-full justify-center rounded-md bg-black/20 px-4 py-2 text-sm font-bold text-white hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
            <h2 className="text-4xl font-bold">{currentConfig.name}</h2>
            <ChevronDownIcon className="ml-2 -mr-1 h-10 w-10" aria-hidden="true" />
          </Menu.Button>

          <Transition
      as={Fragment}
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

  <div className="flex justify-center mb-5 font-bold">
    <div className="flex items-center bg-white border rounded-lg shadow-md p-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 sm:h-10 lg:w-12 lg:h-12"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632"
        />
      </svg>
      <p className="text-gray-800 font-bold ml-2 text-lg sm:text-base md:text-lg lg:text-xl">
        {countPresentForToday()}
      </p>
    </div>
    <div className="flex items-center bg-white border rounded-lg shadow-md p-4 ml-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 sm:h-10 lg:w-12 lg:h-12"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
      <p className="text-gray-800 font-bold ml-2 text-lg sm:text-base md:text-lg lg:text-xl">
        {countAbsentForToday()}
      </p>
    </div>

    <div className="flex items-center bg-white border rounded-lg shadow-md p-4 ml-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
        />
      </svg>
      <p className="text-gray-800 font-bold ml-2 text-lg sm:text-base md:text-lg lg:text-xl">
        {countPresentForToday() + countAbsentForToday()}
      </p>
    </div>
  </div>
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
              className={`w-70percent hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg ${getButtonColor(
                studentIndex
              )}`}
              onClick={() => {
              handleClick(studentIndex);
              }}>
              {name}
              </button>

              <div className="flex flex-row ml-1">
                {["A", "B", "C", "D", "E"].map((dayLetter) => {
                  const fieldName = `${studentIndex.slice(0, 2)}${dayLetter}`;
                  return (
                    <div
                      key={dayLetter}
                      className={`w-4 h-9 rounded-lg ${
                        primaryData[fieldName]
                          ? config.colors.present
                          : config.colors.absent
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
