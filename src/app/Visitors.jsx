import React, { useState, useEffect, Fragment } from "react";
import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";

const ages = Array.from({ length: 100 }, (_, i) => i + 1); // Array of ages from 1 to 100

function Visitors() {
  const [newVisitorName, setNewVisitorName] = useState("");
  const [newVisitorAddress, setNewVisitorAddress] = useState("");
  const [invitedBy, setInvitedBy] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [age, setAge] = useState(ages[0]); // Default to first age
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
        setAge(ages[0]);
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
              onChange={(e) => handleInputChange(e, "loc")}
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
            <Listbox value={age} onChange={setAge}>
              <div className="relative">
                <Listbox.Button className="relative w-full border border-gray-300 rounded-lg px-3 py-2 text-left focus:outline-none focus:border-[#61A3BA]">
                  <span className="block truncate">{age}</span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <SelectorIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {ages.map((age, ageIdx) => (
                      <Listbox.Option
                        key={ageIdx}
                        className={({ active }) =>
                          `${active ? 'text-amber-900 bg-amber-100' : 'text-gray-900'}
                          cursor-default select-none relative py-2 pl-10 pr-4`
                        }
                        value={age}
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={`${selected ? 'font-medium' : 'font-normal'} block truncate`}
                            >
                              {age}
                            </span>
                            {selected ? (
                              <span
                                className={`${active ? 'text-amber-600' : 'text-amber-600'}
                                absolute inset-y-0 left-0 flex items-center pl-3`}
                              >
                                <CheckIcon className="w-5 h-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
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
              Add Visitor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Visitors;
