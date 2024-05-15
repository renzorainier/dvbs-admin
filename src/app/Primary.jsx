import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase.js"; // Import your Firebase config

function Primary() {
  const uploadTime = new Date().toLocaleString();
  const [primaryData, setPrimaryData] = useState({});

  useEffect(() => {
    const fetchPrimary = async () => {
      const docRef = doc(db, "dvbs", "primary");
      const primarySnapshot = await getDoc(docRef);
      if (primarySnapshot.exists()) {
        setPrimaryData(primarySnapshot.data());
      } else {
        console.error("No such document!");
      }
    };

    fetchPrimary();
  }, []);

  const getCurrentDayLetter = () => {
    const days = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    return days[dayIndex === 0 ? 6 : dayIndex - 1]; // Adjust to make A = Monday
  };

  const handleClick = async (fieldName) => {
    try {
      const docRef = doc(db, "dvbs", "primary");
      const prefix = fieldName.slice(0, 2); // Get the two-digit prefix from the field name
      const dayLetter = getCurrentDayLetter();
      const fieldToUpdate = `${prefix}${dayLetter}`;

      const newValue = primaryData[fieldToUpdate] ? "" : uploadTime;

      await updateDoc(docRef, {
        [fieldToUpdate]: newValue,
      });

      setPrimaryData((prevData) => ({
        ...prevData,
        [fieldToUpdate]: newValue,
      }));
    } catch (error) {
      console.error("Error updating Firebase: ", error);
    }
  };

  const getButtonColor = (fieldName) => {
    const prefix = fieldName.slice(0, 2); // Get the two-digit prefix from the field name
    const dayLetter = getCurrentDayLetter();
    const fieldToCheck = `${prefix}${dayLetter}`;
    return primaryData[fieldToCheck] ? "bg-[#A2C579]" : "bg-gray-200";
  };

  // Extract and sort the "name" fields alphabetically
  const sortedNames = Object.keys(primaryData)
    .filter(fieldName => fieldName.endsWith("name"))
    .map(fieldName => primaryData[fieldName])
    .sort();

  return (
    <div className="flex flex-col items-center">
      <div className="w-full text-gray-700 bg-white p-5 border rounded-lg shadow-lg mx-auto">
        <div className="flex flex-col gap-2 w-full">
          {sortedNames.map((name, index) => (
            <button
              key={index}
              className={`hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl ${getButtonColor(fieldName)}`}
              onClick={() => handleClick(fieldName)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Primary;
