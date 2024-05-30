import React, { useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import TeacherCombobox from "./TeacherCombobox";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase.js"; // Import your Firebase config

function InvitedByField({ invitedBy, handleInputChange, config }) {
  const [isStudent, setIsStudent] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState("dvbs/primary");

  const handleToggle = () => {
    setIsStudent(!isStudent);
    handleInputChange({ target: { value: "" } }, "invitedBy");
  };

  const documentPaths = ["primary", "middlers", "juniors", "youth"];

  const handleDocumentChange = async (documentPath) => {
    setSelectedDocument(documentPath);
    // Fetch the document from the 'dvbs' collection based on the selected location
    const docRef = doc(db, "dvbs", documentPath);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // Log the data of the selected document
        console.log("Document data:", docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };


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
            className={`bg-[${selectedDocument === documentPath ? config.color : "#61677A" }] text-white font-semibold py-3 px-6 rounded-lg w-full flex items-center justify-center transition duration-300 ease-in-out`}
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
        <input
          type="text"
          value={invitedBy}
          onChange={(e) => handleInputChange(e, "invitedBy")}
          placeholder="Invited by Student"
          className={`border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-${config.color}`}
        />
      )}
    </div>
  );
}

export default InvitedByField;
