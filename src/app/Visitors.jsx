import React, { useState, useEffect } from "react";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { db } from "./firebase.js"; // Assuming you have your Firebase setup

function Visitors() {
  // State Variables
  const [visitors, setVisitors] = useState([]); // Array to store fetched visitors
  const [newVisitorName, setNewVisitorName] = useState(""); // Input field for new visitor
  const [currentWeekNumber, setCurrentWeekNumber] = useState(getWeekNumber());

  // --- Visitor Management ---

  // Fetch existing visitors when the component loads
  useEffect(() => {
    const fetchVisitors = async () => {
      const visitorsSnapshot = await getDocs(collection(db, "visitors"));
      const visitorList = visitorsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVisitors(visitorList);
    };

    fetchVisitors(); // Call the function to fetch data
  }, []);

  // Handle changes to the new visitor input field
  const handleInputChange = (event) => {
    setNewVisitorName(event.target.value);
  };

  // Add a new visitor to Firestore
  const addVisitor = async () => {
    if (newVisitorName.trim() !== "") {
      try {
        // Create a Firestore document reference
        const docRef = await setDoc(doc(db, "visitors", newVisitorName), {
          name: newVisitorName,
          [currentWeekNumber]: true, // Mark attendance for the current week
        });

        // Update the local visitors list
        setVisitors([...visitors, { id: docRef.id, name: newVisitorName }]);
        setNewVisitorName("");
        console.log("Visitor added with ID: ", docRef.id);
      } catch (error) {
        console.error("Error adding visitor: ", error);
      }
    }
  };

  const [filteredVisitors, setFilteredVisitors] = useState([]);

  useEffect(() => {
    const filterRecentVisitors = () => {
      const recentWeeksThreshold = currentWeekNumber - 4; // Adjust the number '4' if needed 
      const recentVisitors = visitors.filter((visitor) => {
        // Find the highest week field in the visitor's data
        const highestWeek = Math.max(...Object.keys(visitor).filter(key => !isNaN(key)));
        return highestWeek >= recentWeeksThreshold;
      });
      setFilteredVisitors(recentVisitors);
    };

    filterRecentVisitors(); // Call initially
    
    // Update the filter whenever visitors or currentWeekNumber changes
    const dependencies = [visitors, currentWeekNumber];
    useEffect(filterRecentVisitors, dependencies);

  }, [visitors, currentWeekNumber]); 

  useEffect(() => {
    // Update the week number periodically (if needed)
    const intervalId = setInterval(() => {
      setCurrentWeekNumber(getWeekNumber());
    }, 60000); // Update every minute

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  function getWeekNumber() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    var week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }




  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-semibold bg-gray-100 p-5 rounded-md shadow-lg mb-4">
        Visitors:
      </h2>

      <div className="flex flex-col gap-2 w-full">
        <ul>
          {filteredVisitors.map((visitor) => (
            <li key={visitor.id}>{visitor.name}</li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2 justify-center">
        <input
          type="text"
          value={newVisitorName}
          onChange={handleInputChange}
          placeholder="Enter visitor name"
          className="border border-gray-400 rounded p-2"
        />
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={addVisitor}
        >
          Add Visitor
        </button>
      </div>
    </div>
  );
}

export default Visitors;




// return (
//     <div className="flex flex-col items-center">
//

//       <div className="flex gap-2 justify-center">
//         <input
//           type="text"
//           value={newVisitorName}
//           onChange={handleInputChange}
//           placeholder="Enter visitor name"
//           className="border border-gray-400 rounded p-2"
//         />
//         <button
//           className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//           onClick={addVisitor}
//         >
//           Add Visitor
//         </button>
//       </div>
//     </div>
//   );