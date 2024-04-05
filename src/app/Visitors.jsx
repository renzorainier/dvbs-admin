import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  getDocs,
  collection,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "./firebase.js";

function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [olderVisitors, setOlderVisitors] = useState([]);
  const [newVisitorName, setNewVisitorName] = useState("");
  const [currentWeekNumber, setCurrentWeekNumber] = useState(getWeekNumber());

  useEffect(() => {
    fetchVisitors();
  }, [currentWeekNumber]);

  const fetchVisitors = async () => {
    try {
      const visitorsSnapshot = await getDocs(collection(db, "visitors"));
      const visitorList = visitorsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVisitors(visitorList);

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

      setRecentVisitors(recentVisitors);
      setOlderVisitors(olderVisitors);
    } catch (error) {
      console.error("Error fetching visitors: ", error);
    }
  };

  const handleInputChange = (event) => {
    setNewVisitorName(event.target.value);
  };

  const addVisitor = async () => {
    if (newVisitorName.trim() !== "") {
      try {
        const docRef = doc(collection(db, "visitors"), newVisitorName.trim());
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          console.error("Visitor already exists!");
          return;
        }
        await setDoc(docRef, {
          name: newVisitorName,
          [currentWeekNumber]: true,
        });
        setNewVisitorName("");
        fetchVisitors();
      } catch (error) {
        console.error("Error adding visitor: ", error);
      }
    }
  };

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

      fetchVisitors();
    } catch (error) {
      console.error("Error updating Firebase: ", error);
    }
  };

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

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center mt-6">
        <input
          type="text"
          value={newVisitorName}
          onChange={handleInputChange}
          placeholder="Enter visitor name"
          className="border border-gray-400 rounded-lg p-3 w-80 focus:outline-none focus:border-green-500"
        />
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg mt-4 transition duration-300 ease-in-out"
          onClick={addVisitor}>
          Add Visitor
        </button>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <h3>Recent Visitors:</h3>
        <div className="flex flex-col gap-2">
          {recentVisitors.map((visitor) => (
            <button
              key={visitor.id}
              className={`font-bold py-3 px-4 rounded-xl text-lg sm:text-xl md:text-2xl ${
                visitor[currentWeekNumber]
                  ? "bg-green-500"
                  : "bg-gray-500 hover:bg-blue-700"
              } text-white`}
              onClick={() => handleVisitorClick(visitor.id)}>
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
              className={`font-bold py-3 px-4 rounded-xl text-lg sm:text-xl md:text-2xl ${
                visitor[currentWeekNumber]
                  ? "bg-green-500"
                  : "bg-gray-500 hover:bg-blue-700"
              } text-white`}
              onClick={() => handleVisitorClick(visitor.id)}>
              {visitor.name}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Visitors;
