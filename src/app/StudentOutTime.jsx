import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase.js"; // Import your Firebase config

function StudentOutTime() {
  const [students, setStudents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [studentToMarkOut, setStudentToMarkOut] = useState(null);

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
          for (const key in group) {
            if (key.endsWith(currentDayLetter)) {
              const prefix = key.slice(0, 2);
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

  const handleClick = (groupId, prefix, inTimeField, outTimeField, outTime) => {
    if (outTime) {
      setStudentToMarkOut({ groupId, prefix, inTimeField, outTimeField });
      setShowConfirmation(true);
    } else {
      updateStudentOutTime(groupId, prefix, inTimeField, outTimeField, uploadTime);
    }
  };

  const updateStudentOutTime = async (groupId, prefix, inTimeField, outTimeField, newValue) => {
    const docRef = doc(db, "dvbs", groupId);

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

    setShowConfirmation(false);
    setStudentToMarkOut(null);
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
              onClick={() => handleClick(student.id, student.prefix, student.inTimeField, student.outTimeField, student.outTime)}
            >
              {student.name} {/* Display the student's name */}
            </button>
          </div>
        ))}
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50" />
          <div className="bg-white rounded-lg p-5 shadow-md z-10 flex flex-col items-center">
            <p className="mb-2">Unmark student as out?</p>
            <div className="flex space-x-4">
              <button
                className="bg-red-500 text-white font-bold py-2 px-4 rounded"
                onClick={() => updateStudentOutTime(studentToMarkOut.groupId, studentToMarkOut.prefix, studentToMarkOut.inTimeField, studentToMarkOut.outTimeField, '')}
              >
                Yes
              </button>
              <button
                className="bg-gray-500 text-white font-bold py-2 px-4 rounded"
                onClick={() => setShowConfirmation(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentOutTime;
