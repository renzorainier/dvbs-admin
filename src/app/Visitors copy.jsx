import React, { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  getDocs,
  collection,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase.js"; // Assuming you have your Firebase setup

function Visitors() {
  // State Variables
  const [visitors, setVisitors] = useState([]);
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [olderVisitors, setOlderVisitors] = useState([]);
  const [newVisitorName, setNewVisitorName] = useState("");
  const [currentWeekNumber, setCurrentWeekNumber] = useState(getWeekNumber());
  const [selectedVisitors, setSelectedVisitors] = useState([]);

  // Fetch Visitors on Load
  useEffect(() => {
    const fetchVisitors = async () => {
      const visitorsSnapshot = await getDocs(collection(db, "visitors"));
      const visitorList = visitorsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter recent and older visitors
      const recentWeeksThreshold = currentWeekNumber - 4;
      const recentVisitors = visitorList.filter((visitor) => {
        const highestWeek = Math.max(
          ...Object.keys(visitor).filter((key) => !isNaN(key))
        );
        return highestWeek >= recentWeeksThreshold;
      });
      const olderVisitors = visitorList.filter((visitor) => {
        const highestWeek = Math.max(
          ...Object.keys(visitor).filter((key) => !isNaN(key))
        );
        return highestWeek < recentWeeksThreshold;
      });

      setVisitors(visitorList);
      setRecentVisitors(recentVisitors);
      setOlderVisitors(olderVisitors);
    };

    fetchVisitors();
  }, [currentWeekNumber]);

  // Handle Input Change
  const handleInputChange = (event) => {
    setNewVisitorName(event.target.value);
  };

  // Add a New Visitor
  const addVisitor = async () => {
    if (newVisitorName.trim() !== "") {
      try {
        const docRef = await setDoc(doc(db, "visitors", newVisitorName), {
          name: newVisitorName,
          [currentWeekNumber]: true,
        });

        setVisitors([...visitors, { id: docRef.id, name: newVisitorName }]);
        setNewVisitorName("");
        console.log("Visitor added with ID: ", docRef.id);
      } catch (error) {
        console.error("Error adding visitor: ", error);
      }
    }
  };

  // Handle click on a visitor name
  const handleVisitorClick = (visitorName) => {
    const nameIndex = selectedVisitors.indexOf(visitorName);
    if (nameIndex === -1) {
      setSelectedVisitors([...selectedVisitors, visitorName]);
    } else {
      setSelectedVisitors([
        ...selectedVisitors.slice(0, nameIndex),
        ...selectedVisitors.slice(nameIndex + 1),
      ]);
    }
  };

  // Update Firebase
  const updateFirebase = async () => {
    try {
      const visitorsSnapshot = await getDocs(collection(db, "visitors"));
      const allVisitorNames = visitorsSnapshot.docs.map((doc) => doc.id);

      for (const name of allVisitorNames) {
        const docRef = doc(db, "visitors", name);
        const timeField = currentWeekNumber + "t";
        const uploadTime = new Date().toLocaleString();

        await updateDoc(docRef, {
          [currentWeekNumber]: selectedVisitors.includes(name),
          [timeField]: selectedVisitors.includes(name) ? uploadTime : "",
        });
      }

      setSelectedVisitors([]); // Clear the selection
      console.log("Firebase documents updated successfully!");
    } catch (error) {
      console.error("Error updating Firebase documents: ", error);
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
          {recentVisitors.map((visitor) => (
            <button
              key={visitor.id}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-lg sm:text-xl md:text-2xl
                ${
                  selectedVisitors.includes(visitor.name) ? "bg-gray-500" : ""
                }`}
              onClick={() => handleVisitorClick(visitor.name)}>
              {visitor.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <h3>Older Visitors:</h3>
        <div className="flex flex-col gap-2">
          {olderVisitors.map((visitor) => (
            <button
              key={visitor.id}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-lg sm:text-xl md:text-2xl
                ${
                  selectedVisitors.includes(visitor.name) ? "bg-gray-500" : ""
                }`}
              onClick={() => handleVisitorClick(visitor.name)}>
              {visitor.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 justify-center mt-6 bg-gray-100 border border-gray-300 rounded-md p-4">
        <input
          type="text"
          value={newVisitorName}
          onChange={handleInputChange}
          placeholder="Enter visitor name"
          className="border border-gray-400 rounded p-3 w-64"
        />
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded mx-2"
          onClick={addVisitor}>
          Add Visitor
        </button>
      </div>
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded mx-2"
        onClick={updateFirebase}>
        Button to Upload to Firebase
      </button>
    </div>
  );
}

export default Visitors;
