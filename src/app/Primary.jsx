import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDocs, collection } from "firebase/firestore";
import { db } from "./firebase.js"; // Import your Firebase config

function Primary() {
  const uploadTime = new Date().toLocaleString();
  const [primaryData, setPrimaryData] = useState([]);

  useEffect(() => {
    const fetchPrimary = async () => {
      const primarySnapshot = await getDocs(collection(db, "primary"));
      const primaryData = primarySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPrimaryData(primaryData);
    };

    fetchPrimary();
  }, []);

  const handleClick = async (primaryId) => {
    try {
      const docRef = doc(db, "primary", primaryId);

      await updateDoc(docRef, {
        updatedAt: uploadTime,
        active: !primaryData.find((p) => p.id === primaryId).active,
      });

      setPrimaryData((prevData) =>
        prevData.map((primary) =>
          primary.id === primaryId
            ? {
                ...primary,
                active: !primary.active,
              }
            : primary
        )
      );
    } catch (error) {
      console.error("Error updating Firebase: ", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full text-gray-700 bg-white p-5 border rounded-lg shadow-lg mx-auto">
        <div className="flex flex-col gap-2 w-full">
          {primaryData.map((primary, index) => (
            <button
              key={index}
              className={`hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl
                    ${primary.active ? "bg-[#A2C579]" : "bg-gray-200"}
                  `}
              onClick={() => handleClick(primary.id)}
            >
              {primary.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Primary;
