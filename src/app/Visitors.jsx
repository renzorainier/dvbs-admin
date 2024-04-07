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
  const [newVisitorAddress, setNewVisitorAddress] = useState("");
  const [invitedBy, setInvitedBy] = useState("");
  const [contactNumber, setContactNumber] = useState("");
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

  const handleInputChange = (event, field) => {
    switch (field) {
      case "name":
        setNewVisitorName(event.target.value);
        break;
      case "address":
        setNewVisitorAddress(event.target.value);
        break;
      case "invitedBy":
        setInvitedBy(event.target.value);
        break;
      case "contactNumber":
        setContactNumber(event.target.value);
        break;
      default:
        break;
    }
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
          address: newVisitorAddress,
          invitedBy: invitedBy,
          contactNumber: contactNumber,
          [currentWeekNumber]: true,
        });
        setNewVisitorName("");
        setNewVisitorAddress("");
        setInvitedBy("");
        setContactNumber("");
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
    <div className="flex flex-col items-center pb-5">
      <div className="w-full bg-white shadow-md rounded-lg border overflow-hidden mx-auto">
        <div className="p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Add New Visitor
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              value={newVisitorName}
              onChange={(e) => handleInputChange(e, "name")}
              placeholder="Visitor Name"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-[#61A3BA]"
            />
            <input
              type="text"
              value={newVisitorAddress}
              onChange={(e) => handleInputChange(e, "address")}
              placeholder="Visitor Address"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-[#61A3BA]"
            />
            <input
              type="text"
              value={invitedBy}
              onChange={(e) => handleInputChange(e, "invitedBy")}
              placeholder="Invited By"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-[#61A3BA]"
            />
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => handleInputChange(e, "contactNumber")}
              placeholder="Contact Number"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-[#61A3BA]"
            />
        <button
  className="bg-[#61A3BA] hover:bg-[#61A3BA] text-white font-bold py-3 px-6 rounded-lg mt-4 w-full flex items-center justify-center space-x-2 transition duration-300 ease-in-out"
  onClick={addVisitor}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-white"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M13 11a1 1 0 0 1 0 2h-2v2a1 1 0 0 1-2 0v-2H7a1 1 0 0 1 0-2h2V9a1 1 0 0 1 2 0v2h2zM10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 14a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"
      clipRule="evenodd"
    />
  </svg>
  <span>Add Visitor</span>
</button>

          </div>
        </div>
      </div>

      <div className="w-full text-gray-700 bg-white p-5 border rounded-lg shadow-lg mx-auto mt-5">
        <div className="flex flex-col gap-2 w-full">
          <h3>Recent Visitors:</h3>
          <div className="flex flex-col gap-2">
            {recentVisitors.map((visitor) => (
              <button
                key={visitor.id}
                className={`font-bold py-3 px-4 rounded-xl text-lg sm:text-xl md:text-2xl ${
                  visitor[currentWeekNumber]
                    ? "bg-[#61A3BA]"
                    : "bg-gray-200 hover:bg-[#61A3BA]"
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
                    ? "bg-[#61A3BA]"
                    : "bg-gray-200 hover:bg-[#61A3BA]"
                } text-white`}
                onClick={() => handleVisitorClick(visitor.id)}>
                {visitor.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Visitors;

// <div className="w-full text-gray-700 bg-white p-5 border rounded-lg shadow-lg mx-auto mt-5">
// <div className="flex flex-col gap-2 w-full">
//   <h3>Recent Visitors:</h3>
//   <div className="flex flex-col gap-2">
//     {recentVisitors.map((visitor) => (
//       <button
//         key={visitor.id}
//         className={`font-bold py-3 px-4 rounded-xl text-lg sm:text-xl md:text-2xl ${
//           visitor[currentWeekNumber]
//             ? "bg-[#61A3BA]"
//             : "bg-gray-200 hover:bg-[#61A3BA]"
//         } text-white`}
//         onClick={() => handleVisitorClick(visitor.id)}>
//         {visitor.name}
//       </button>
//     ))}
//   </div>
// </div>

// <div className="flex flex-col gap-2 w-full">
//   <h3>Older Visitors:</h3>
//   <div className="flex flex-col gap-2">
//     {olderVisitors.map((visitor) => (
//       <button
//         key={visitor.id}
//         className={`font-bold py-3 px-4 rounded-xl text-lg sm:text-xl md:text-2xl ${
//           visitor[currentWeekNumber]
//             ? "bg-[#61A3BA]"
//             : "bg-gray-200 hover:bg-[#61A3BA]"
//         } text-white`}
//         onClick={() => handleVisitorClick(visitor.id)}>
//         {visitor.name}
//       </button>
//     ))}
//   </div>
// </div>
// </div>
