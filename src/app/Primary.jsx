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

  const handleClick = async (fieldName) => {
    try {
      const docRef = doc(db, "dvbs", "primary");
      const newValue = !primaryData[fieldName];
      const timeField = fieldName + "Updated";

      await updateDoc(docRef, {
        [fieldName]: newValue,
        [timeField]: newValue ? uploadTime : "",
      });

      setPrimaryData((prevData) => ({
        ...prevData,
        [fieldName]: newValue,
      }));
    } catch (error) {
      console.error("Error updating Firebase: ", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full text-gray-700 bg-white p-5 border rounded-lg shadow-lg mx-auto">
        <div className="flex flex-col gap-2 w-full">
          {Object.keys(primaryData).map((fieldName, index) =>
            fieldName.endsWith("name") ? (
              <button
                key={index}
                className={`hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl
                      ${primaryData[fieldName] ? "bg-[#A2C579]" : "bg-gray-200"}
                    `}
                onClick={() => handleClick(fieldName)}
              >
                {fieldName}
              </button>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

export default Primary;
