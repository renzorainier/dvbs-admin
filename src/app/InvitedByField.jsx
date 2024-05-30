import React, { useState, useEffect } from "react";
import { Combobox } from "@headlessui/react";
import TeacherCombobox from "./TeacherCombobox";
import {
  collection,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase.js";

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
        const data = docSnap.data();
        // Assuming names are stored in 'name' fields
        const names = Object.values(data).map((item) => item.name).filter(Boolean);
        setStudentNames(names);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  useEffect(() => {
    // Fetch data for the default document path when component mounts
    handleDocumentChange(selectedDocument);
  }, []);

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
          className="w-full"
          aria-label="Student Name"
          onChange={(value) => handleInputChange({ target: { value } }, "invitedBy")}
        >
          <Combobox.Input
            value={invitedBy}
            placeholder="Invited by Student"
            className={`border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-${config.color}`}
          />
          <Combobox.Listbox className="mt-1 bg-white shadow-lg max-h-60 overflow-y-auto z-10 rounded-lg">
            {studentNames.map((name) => (
              <Combobox.Option key={name} value={name}>
                {name}
              </Combobox.Option>
            ))}
          </Combobox.Listbox>
        </Combobox>
      )}
    </div>
  );
}

export default InvitedByField;
