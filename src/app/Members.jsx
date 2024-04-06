import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDocs, collection } from "firebase/firestore";
import { db } from "./firebase.js"; // Import your Firebase config

function Members() {
  const uploadTime = new Date().toLocaleString();
  const [memberData, setMemberData] = useState([]);
  const [currentWeekNumber, setCurrentWeekNumber] = useState(getWeekNumber());

  // Fetch member data on component mount
  useEffect(() => {
    const fetchMembers = async () => {
      const membersSnapshot = await getDocs(collection(db, "memberRecords"));
      const memberData = membersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMemberData(memberData);
    };

    fetchMembers();
  }, []);

  // Handle click on a member button
  const handleClick = async (memberId) => {
    try {
      const docRef = doc(db, "memberRecords", memberId);
      const timeField = currentWeekNumber + "t";

      await updateDoc(docRef, {
        [currentWeekNumber]: !memberData.find((m) => m.id === memberId)[currentWeekNumber],
        [timeField]: !memberData.find((m) => m.id === memberId)[currentWeekNumber] ? uploadTime : "",
      });

      // Update local memberData for immediate visual feedback
      setMemberData((prevData) =>
        prevData.map((member) =>
          member.id === memberId
            ? {
                ...member,
                [currentWeekNumber]: !member[currentWeekNumber],
              }
            : member
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


  return (
    <div className="flex flex-col items-center">
      <div
        className="w-full text-gray-700 bg-white p-5 border rounded-lg shadow-lg mx-auto"

      >
        <div className="flex flex-col gap-2 w-full">
          {memberData.map((member, index) => (
            <button
              key={index}
              className={`bg-gray-200 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl
                    ${member[currentWeekNumber] ? "bg-[#A2C579]" : ""}
                  `}
              onClick={() => handleClick(member.id)}
            >
              {member.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Members;



