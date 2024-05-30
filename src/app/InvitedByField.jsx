import React, { useState, useEffect, Fragment } from "react";
import { Combobox, Transition } from "@headlessui/react";
import TeacherCombobox from "./TeacherCombobox";
import { collection, getDoc, doc } from "firebase/firestore";
import { db } from "./firebase.js"; // Import your Firebase config

function InvitedByField({ invitedBy, handleInputChange, config }) {
  const [isStudent, setIsStudent] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState("dvbs/primary");
  const [studentNames, setStudentNames] = useState([]);

  const handleToggle = () => {
    setIsStudent(!isStudent);
    handleInputChange({ target: { value: "" } }, "invitedBy");
  };

  const documentPaths = ["primary", "middlers", "juniors", "youth"];

  const handleDocumentChange = async (documentPath) => {
    setSelectedDocument(documentPath);
    try {
      const docRef = doc(db, "dvbs", documentPath);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // Extract student names from the document data
        const data = docSnap.data();
        const names = Object.values(data)
          .filter((value) => typeof value === "object" && value !== null)
          .map((obj) => obj["name"]);
        setStudentNames(names);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  useEffect(() => {
    // Fetch the document for the initially selected path
    handleDocumentChange(selectedDocument);
  }, [selectedDocument]);

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
        <Combobox
          className={`border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-${config.color}`}
          onSelect={(value) => handleInputChange({ target: { value } }, "invitedBy")}
        >
          <Combobox.Input
            value={invitedBy}
            onChange={(e) => handleInputChange(e, "invitedBy")}
            placeholder="Invited by Student"
          />
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Combobox.Options className="py-1 mt-1 bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-auto z-10">
              {studentNames.map((name) => (
                <Combobox.Option key={name} value={name}>
                  {name}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Transition>
        </Combobox>
      )}
    </div>
  );
}

export default InvitedByField;
