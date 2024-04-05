import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDocs, collection } from "firebase/firestore";
import { db } from "./firebase.js"; // Assuming you have your Firebase setup

function Visitors() {
  // State Variables
  const [visitors, setVisitors] = useState([]);
  const [currentWeekNumber, setCurrentWeekNumber] = useState(getWeekNumber());

  // Fetch Visitors on Load
  useEffect(() => {
    const fetchVisitors = async () => {
      const visitorsSnapshot = await getDocs(collection(db, "visitors"));
      const visitorList = visitorsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVisitors(visitorList);
    };

    fetchVisitors();
  }, [currentWeekNumber]);

  // Handle click on a visitor name
  const handleVisitorClick = async (visitorId) => {
    try {
      const docRef = doc(db, "visitors", visitorId);
      const timeField = currentWeekNumber + "t";
      const uploadTime = new Date().toLocaleString();

      const visitor = visitors.find((v) => v.id === visitorId);
      const isVisitorPresent = visitor && visitor[currentWeekNumber];

      await updateDoc(docRef, {
        [currentWeekNumber]: !isVisitorPresent,
        [timeField]: !isVisitorPresent ? uploadTime : "",
      });

      // Update local visitors for immediate visual feedback
      setVisitors((prevVisitors) =>
        prevVisitors.map((visitor) =>
          visitor.id === visitorId
            ? {
                ...visitor,
                [currentWeekNumber]: !isVisitorPresent,
              }
            : visitor
        )
      );
    } catch (error) {
      console.error("Error updating Firebase: ", error);
    }
  };

  // Week Number Calculation
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentWeekNumber(getWeekNumber());
    }, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  function getWeekNumber() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    var week1 = new Date(date.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(
        ((date.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7
      )
    );
  }

  // Rendering Section
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col gap-2 w-full">
        <h3>Recent Visitors:</h3>
        <div className="flex flex-col gap-2">
          {visitors.map((visitor) => (
            <button
              key={visitor.id}
              className={`font-bold py-3 px-4 rounded-xl text-lg sm:text-xl md:text-2xl ${
                visitor[currentWeekNumber] ? "bg-green-500" : "bg-gray-500 hover:bg-blue-700"
              } text-white`}
              onClick={() => handleVisitorClick(visitor.id)}
            >
              {visitor.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Visitors;