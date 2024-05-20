import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase.js"; // Import your Firebase config

function StudentOutTime() {
  const [students, setStudents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loading, setLoading] = useState(true);

  const uploadTime = new Date().toLocaleString();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "dvbs"));
        const studentData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched Student Data:", studentData); // Log the fetched data

        const currentDayLetter = getCurrentDayLetter();
        const presentStudents = studentData.map((group) => {
          const groupStudents = [];
          for (let i = 1; i <= 2; i++) { // Assuming you have up to "02" prefix
            const prefix = `0${i}`;
            const inTimeField = `${prefix}${currentDayLetter}`;
            const outTimeField = `${prefix}${currentDayLetter}out`;
            if (group[inTimeField]) {
              groupStudents.push({
                id: group.id,
                prefix,
                inTimeField,
                outTimeField,
                name: group[`${prefix}name`],
                location: group[`${prefix}loc`], // Include location in the student data
                outTime: group[outTimeField], // Include outTime in the student data
              });
            }
          }
          return groupStudents;
        }).flat();

        const uniqueLocations = [...new Set(presentStudents.map(student => student.location))];

        setStudents(presentStudents);
        setLocations(uniqueLocations);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students: ", error);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const getCurrentDayLetter = () => {
    const days = ["A", "B", "C", "D", "E"];
    const dayIndex = new Date().getDay();
    return days[dayIndex === 0 ? 6 : dayIndex - 1];
  };

  const handleClick = async (groupId, prefix, inTimeField, outTimeField) => {
    const docRef = doc(db, "dvbs", groupId);
    const newValue = uploadTime;

    try {
      await updateDoc(docRef, {
        [outTimeField]: newValue,
      });

      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === groupId && student.prefix === prefix
            ? { ...student, outTime: newValue }
            : student
        )
      );
    } catch (error) {
      console.error("Error updating Firebase: ", error);
    }
  };

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  const filteredStudents = selectedLocation
    ? students.filter(student => student.location === selectedLocation)
    : students;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">Present Students</h1>
      <div className="w-full max-w-md text-gray-700 bg-white p-5 border rounded-lg shadow-lg mx-auto">
        <select
          className="mb-4 p-2 border rounded-lg w-full"
          value={selectedLocation}
          onChange={handleLocationChange}
        >
          <option value="">All Locations</option>
          {locations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
        {filteredStudents.map((student) => (
          <div key={`${student.id}-${student.prefix}`} className="flex items-center mb-4">
            <button
              className={`w-full text-white font-bold py-2 px-4 rounded-lg ${
                student.outTime ? 'bg-green-500 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-700'
              }`}
              onClick={() => handleClick(student.id, student.prefix, student.inTimeField, student.outTimeField)}
            >
              {student.name} {/* Display the student's name */}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentOutTime;
