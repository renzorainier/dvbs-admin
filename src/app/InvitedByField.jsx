import React, { useState, useEffect, Fragment } from "react";
import { Combobox, Transition } from "@headlessui/react";
import TeacherCombobox from "./TeacherCombobox";
import { collection, getDocs, getDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase.js"; // Import your Firebase config

function InvitedByField({ invitedBy, handleInputChange, config }) {
  const [isStudent, setIsStudent] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState("primary");
  const [names, setNames] = useState([]);
  const [selectedName, setSelectedName] = useState(invitedBy);
  const [query, setQuery] = useState("");

  const handleToggle = () => {
    setIsStudent(!isStudent);
    handleInputChange({ target: { value: "" } }, "invitedBy");
  };

  const documentPaths = ["primary", "middlers", "juniors", "youth"];

  const handleDocumentChange = async (documentPath) => {
    setSelectedDocument(documentPath);
    const docRef = doc(db, "dvbs", documentPath);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const extractedNames = Object.keys(data)
          .filter(key => key.endsWith("name"))
          .map(key => data[key])
          .filter(Boolean);
        setNames(extractedNames);
        console.log("Fetched names:", extractedNames);  // Log the names
      } else {
        console.log("No such document!");
        setNames([]);
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      setNames([]);
    }
  };

  useEffect(() => {
    handleDocumentChange(selectedDocument);
  }, [selectedDocument]);

  const filteredNames =
    query === ""
      ? names
      : names.filter((name) =>
          name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <button
          className={`bg-[${config.color}] text-white font-semibold py-3 px-6 rounded-lg w-full flex items-center justify-center transition duration-300 ease-in-out`}
          onClick={handleToggle}
        >
          {isStudent ? "Switch to Teacher" : "Switch to Student"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {documentPaths.map((documentPath) => (
          <button
            key={documentPath}
            className={`bg-[${
              selectedDocument === documentPath ? config.color : "#61677A"
            }] text-white font-semibold py-3 px-6 rounded-lg w-full flex items-center justify-center transition duration-300 ease-in-out`}
            onClick={() => handleDocumentChange(documentPath)}
          >
            {documentPath.charAt(0).toUpperCase() + documentPath.slice(1)}
          </button>
        ))}
      </div>
      {!isStudent ? (
        <TeacherCombobox
          invitedBy={invitedBy}
          handleInputChange={handleInputChange}
          config={config}
        />
      ) : (
        <Combobox value={selectedName} onChange={setSelectedName}>
          <div className="relative mt-1">
            <Combobox.Input
              className={`border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-${config.color}`}
              onChange={(event) => {
                setQuery(event.target.value);
                handleInputChange(event, "invitedBy");
              }}
              displayValue={(name) => name}
            />
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQuery("")}
            >
              <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filteredNames.length === 0 && query !== "" ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                    Nothing found.
                  </div>
                ) : (
                  filteredNames.map((name) => (
                    <Combobox.Option
                      key={name}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? "bg-blue-600 text-white" : "text-gray-900"
                        }`
                      }
                      value={name}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}
                          >
                            {name}
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? "text-white" : "text-blue-600"
                              }`}
                            >
                            </span>
                          ) : null}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>
      )}
    </div>
  );
}


export default InvitedByField;
