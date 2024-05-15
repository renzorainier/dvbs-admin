import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase.js"; // Import your Firebase config

function Primary() {
  const uploadTime = new Date().toLocaleString();
  const [primaryData, setPrimaryData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

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
    const days = ["A", "B", "C", "D", "E"];
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
    return primaryData[fieldToCheck] ? "bg-[#FFC100]" : "bg-gray-400";
  };

  // Function to count the number of present students for the current day
  const countPresentForToday = () => {
    const dayLetter = getCurrentDayLetter();
    return Object.keys(primaryData).filter(
      (key) => key.endsWith(dayLetter) && primaryData[key]
    ).length;
  };

  // Function to count the number of absent students for the current day
  const countAbsentForToday = () => {
    const dayLetter = getCurrentDayLetter();
    const totalStudents = Object.keys(primaryData).filter((key) =>
      key.endsWith(dayLetter)
    ).length;
    const presentCount = countPresentForToday();
    return totalStudents - presentCount;
  };

  // Extract and sort the "name" fields alphabetically
  const sortedNames = Object.keys(primaryData)
    .filter((fieldName) => fieldName.endsWith("name"))
    .map((fieldName) => primaryData[fieldName])
    .sort();

  // Filter the sortedNames based on the search query
  const filteredNames = sortedNames.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col items-center">
        <div className="w-full text-gray-700 bg-white p-5 border rounded-lg shadow-lg mx-auto">
          <input
            type="text"
            placeholder="Search names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
          <div className="flex justify-between items-center mb-4"></div>

          <div className="flex flex-col gap-2 w-full">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                    <th key={day}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredNames.map((name, index) => (
                  <tr key={index}>
                    <td>{name}</td>
                    {['A', 'B', 'C', 'D', 'E'].map(dayLetter => {
                      const fieldName = `${name.slice(0, 2)}${dayLetter}`;
                      return (
                        <td key={dayLetter}>
                          <button
                            className={`hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-xl ${getButtonColor(fieldName)}`}
                            onClick={() => handleClick(fieldName)}
                          >
                            {primaryData[fieldName] ? "Present" : "Absent"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

}

export default Primary;








// <div className="flex justify-center mb-5">
// <div className="flex items-center bg-white border rounded-lg shadow-md p-4">
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     fill="none"
//     viewBox="0 0 24 24"
//     strokeWidth={1.5}
//     stroke="currentColor"
//     className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-[#FFC100]">
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632"
//     />
//   </svg>

//   <p className="text-gray-800 font-bold  ml-2 text-sm sm:text-base md:text-lg lg:text-xl">
//     {countPresentForToday()}
//   </p>
// </div>
// <div className="flex items-center bg-white border rounded-lg shadow-md p-4 ml-4">
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     fill="none"
//     viewBox="0 0 24 24"
//     strokeWidth={1.5}
//     stroke="currentColor"
//     className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-[#FFC100]">
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M6 18L18 6M6 6l12 12"
//     />
//   </svg>

//   <p className="text-gray-800 font-bold  ml-2 text-lg sm:text-base md:text-lg lg:text-xl">
//     {countAbsentForToday()}
//   </p>
// </div>
// </div>