import React, { useState, useEffect, Fragment } from "react";
import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import { Menu, Transition } from '@headlessui/react';

function Visitors() {
  const [newVisitorName, setNewVisitorName] = useState("");
  const [newVisitorAddress, setNewVisitorAddress] = useState("");
  const [invitedBy, setInvitedBy] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [age, setAge] = useState("");
  const [primaryData, setPrimaryData] = useState({});

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
    const days = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    return days[dayIndex === 0 ? 6 : dayIndex - 1]; // Adjust to make A = Monday
  };

  const handleInputChange = (event, field) => {
    switch (field) {
      case "name":
        setNewVisitorName(event.target.value);
        break;
      case "loc":
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

  const handleAgeSelect = (age) => {
    setAge(age);
  };

  const addVisitor = async () => {
    if (newVisitorName.trim() !== "") {
      try {
        const docRef = doc(db, "dvbs", "primary");

        // Find the highest index for existing visitors
        const existingIndexes = Object.keys(primaryData)
          .filter((key) => key.match(/^\d+/))
          .map((key) => parseInt(key.match(/^\d+/)[0]));
        const newIndex = existingIndexes.length ? Math.max(...existingIndexes) + 1 : 1;

        // Convert newIndex to a two-digit string
        const paddedIndex = String(newIndex).padStart(2, '0');

        // Define the new field names
        const newFields = {
          [`${paddedIndex}name`]: newVisitorName,
          [`${paddedIndex}loc`]: newVisitorAddress,
          [`${paddedIndex}invitedBy`]: invitedBy,
          [`${paddedIndex}contactNumber`]: contactNumber,
          [`${paddedIndex}age`]: age,
        };

        // Set the values for fields `${paddedIndex}A` to `${paddedIndex}E` with the current time for the current day
        const currentDayLetter = getCurrentDayLetter();
        const currentTime = new Date().toLocaleString();
        ['A', 'B', 'C', 'D', 'E'].forEach((letter) => {
          newFields[`${paddedIndex}${letter}`] = letter === currentDayLetter ? currentTime : "";
        });

        // Update the document with the new visitor data
        await updateDoc(docRef, newFields);

        // Clear input fields
        setNewVisitorName("");
        setNewVisitorAddress("");
        setInvitedBy("");
        setContactNumber("");
        setAge("");
        console.log("Visitor added successfully!");

        // Update local state with new visitor data
        setPrimaryData((prevData) => ({
          ...prevData,
          ...newFields,
        }));
      } catch (error) {
        console.error("Error adding visitor: ", error);
      }
    }
  };

  const ageOptions = [1, 2, 3, 4, 5]

  return (
    <div className="flex flex-col items-center pb-5">
      <div className="w-full bg-white shadow-md rounded-lg border overflow-hidden mx-auto">
        <div className="p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Add New
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              value={newVisitorName}
              onChange={(e) => handleInputChange(e, "name")}
              placeholder="Name"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-[#61A3BA]"
            />
             <Menu as="div" className="relative inline-block text-left w-full">
              <div>
                <Menu.Button className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  {age ? `Age: ${age}` : "Age:"}
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
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {ageOptions.map((ageOption) => (
                      <Menu.Item key={ageOption}>
                        {({ active }) => (
                          <button
                            onClick={() => handleAgeSelect(ageOption)}
                            className={`${
                              active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                            } block w-full text-left px-4 py-2 text-sm`}
                          >
                            {ageOption}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            <input
              type="text"
              value={newVisitorAddress}
              onChange={(e) => handleInputChange(e, "loc")}
              placeholder="Address"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-[#61A3BA]"
            />
            <input
              type="text"
              value={invitedBy}
              onChange={(e) => handleInputChange(e, "invitedBy")}
              placeholder="Invited by:"
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
              className="bg-[#61A3BA] hover:bg-[#61A3BA] text-white font-bold py-3 px-6 rounded-lg mt-4 w-full flex items-center justify-center transition duration-300 ease-in-out"
              onClick={addVisitor}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Visitors;
