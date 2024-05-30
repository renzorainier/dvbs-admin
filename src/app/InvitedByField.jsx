import React, { useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import TeacherCombobox from "./TeacherCombobox";

function InvitedByField({ invitedBy, handleInputChange, config }) {
  const [isStudent, setIsStudent] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState("dvbs/primary");

  const handleToggle = () => {
    setIsStudent(!isStudent);
    handleInputChange({ target: { value: "" } }, "invitedBy");
  };

  const documentPaths = ["dvbs/primary", "dvbs/middlers", "dvbs/juniors", "dvbs/youth"];

  const handleDocumentChange = (documentPath) => {
    setSelectedDocument(documentPath);
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
      <div className="flex space-x-4">
        {documentPaths.map((documentPath) => (
          <button
            key={documentPath}
            className={`bg-[${config.color}] text-white font-semibold py-3 px-6 rounded-lg w-full flex items-center justify-center transition duration-300 ease-in-out`}
            onClick={() => handleDocumentChange(documentPath)}
            style={{ backgroundColor: selectedDocument === documentPath ? "gray" : "" }}
          >
            {documentPath.split("/")[1].charAt(0).toUpperCase() + documentPath.split("/")[1].slice(1)}
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
