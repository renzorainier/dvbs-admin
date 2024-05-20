import React, { useState, useEffect, Fragment } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase.js"; // Import your Firebase config
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

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

        console.log("Fetched Student Data:", studentData);

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
                  location: group[`${prefix}loc`],
                  outTime: group[outTimeField],
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

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const filteredStudents = selectedLocation
    ? students.filter(student => student.location === selectedLocation)
    : students;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">Present Students</h1>
      <div className="w-full max-w-md text-gray-700 bg-white p-5 border rounded-lg shadow-lg mx-auto">
        <Menu as="div" className="relative inline-block text-left w-full mb-4">
          <div>
            <Menu.Button className="inline-flex w-full justify-between rounded-md bg-black/20 px-4 py-2 text-sm font-bold text-white hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
              <span>{selectedLocation || "All Locations"}</span>
              <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                      } block px-4 py-2 text-sm w-full text-left`}
                      onClick={() => handleLocationChange("")}
                    >
                      All Locations
                    </button>
                  )}
                </Menu.Item>
                {locations.map((location) => (
                  <Menu.Item key={location}>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                        } block px-4 py-2 text-sm w-full text-left`}
                        onClick={() => handleLocationChange(location)}
                      >
                        {location}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
        {filteredStudents.map((student) => (
          <div key={`${student.id}-${student.prefix}`} className="flex items-center mb-4">
            <button
              className={`w-full text-white font-bold py-2 px-4 rounded-lg ${
                student.outTime ? 'bg-green-500 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-700'
              }`}
              onClick={() => handleClick(student.id, student.prefix, student.inTimeField, student.outTimeField, student.outTime)}
            >
              {student.name}
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
