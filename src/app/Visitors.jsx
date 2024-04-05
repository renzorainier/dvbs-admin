import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, getDocs, collection, setDoc, addDoc } from "firebase/firestore";
import { db } from "./firebase.js";

function Visitors() {
  // State Variables
  const [visitors, setVisitors] = useState([]);
  const [recentVisitors, setRecentVisitors] = useState([]);
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
      filterVisitors(visitorList);
    } catch (error) {
      console.error("Error fetching visitors: ", error);
    }
  };

  const filterVisitors = (visitorList) => {
    const recentWeeksThreshold = currentWeekNumber - 4;
    const recentVisitors = visitorList.filter((visitor) => {
      const highestWeek = Math.max(
        ...Object.keys(visitor).filter((key) => !isNaN(key))
      );
      return highestWeek >= recentWeeksThreshold;
    });
    setRecentVisitors(recentVisitors);
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
      <div className="flex flex-col gap-2 w-full">
        <h3>Recent Visitors:</h3>
        <div className="flex flex-col gap-2">
          {recentVisitors.map((visitor) => (
            <VisitorButton key={visitor.id} visitor={visitor} onClick={handleVisitorClick} />
          ))}
        </div>
      </div>

      <VisitorInput newVisitorName={newVisitorName} onChange={handleInputChange} onClick={addVisitor} />

    </div>
  );
}

const VisitorButton = ({ visitor, onClick }) => {
  const currentWeekNumber = getWeekNumber();
  return (
    <button
      className={`font-bold py-3 px-4 rounded-xl text-lg sm:text-xl md:text-2xl ${
        visitor[currentWeekNumber] ? "bg-green-500" : "bg-gray-500 hover:bg-blue-700"
      } text-white`}
      onClick={() => onClick(visitor.id)}
    >
      {visitor.name}
    </button>
  );
};

const VisitorInput = ({ newVisitorName, onChange, onClick }) => {
  return (
    <div className="flex flex-col items-center gap-2 justify-center mt-6 bg-gray-100 border border-gray-300 rounded-md p-4">
      <input
        type="text"
        value={newVisitorName}
        onChange={onChange}
        placeholder="Enter visitor name"
        className="border border-gray-400 rounded p-3 w-64"
      />
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded mx-2"
        onClick={onClick}
      >
        Add Visitor
      </button>
    </div>
  );
};

export default Visitors;
