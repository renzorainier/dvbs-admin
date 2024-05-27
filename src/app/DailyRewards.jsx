import React, { useState, useEffect, useRef } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase.js"; // Import your Firebase config
import Confetti from "react-confetti";

function DailyRewards() {
  const [primaryData, setPrimaryData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [studentToMarkAbsent, setStudentToMarkAbsent] = useState(null);
  const [showBiblePopup, setShowBiblePopup] = useState(false);
  const [studentToUpdateBible, setStudentToUpdateBible] = useState(null);
  const audioRef = useRef(null);





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

  const currentConfig = configurations[currentConfigIndex];


  const uploadTime = new Date().toLocaleString();

  useEffect(() => {
    const fetchPrimary = async () => {
      const docRef = doc(
        db,
        config.dbPath.split("/")[0],
        config.dbPath.split("/")[1]
      );
      const primarySnapshot = await getDoc(docRef);
      if (primarySnapshot.exists()) {
        setPrimaryData(primarySnapshot.data());
      } else {
        console.error("No such document!");
      }
    };

    fetchPrimary();
  }, [config.dbPath]);

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
      // Show confirmation prompt
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
        config.dbPath.split("/")[0],
        config.dbPath.split("/")[1]
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
        config.dbPath.split("/")[0],
        config.dbPath.split("/")[1]
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
      ? config.colors.present
      : config.colors.absent;
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
                }>
                Yes
              </button>
              <button
                className="bg-gray-500 text-white font-bold py-2 px-4 rounded"
                onClick={() => setShowConfirmation(false)}>
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
                onClick={() => updateBibleStatus(studentToUpdateBible, true)}>
                Yes
              </button>
              <button
                className="bg-red-500 text-white font-bold py-2 px-4 rounded"
                onClick={() => updateBibleStatus(studentToUpdateBible, false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}


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
                        } mr-1`}></div>
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
