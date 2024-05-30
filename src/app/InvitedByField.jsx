import React, { useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import TeacherCombobox from "./TeacherCombobox"

function InvitedByField({ invitedBy, handleInputChange, config }) {
    const [isStudent, setIsStudent] = useState(true);

    const handleToggle = () => {
      setIsStudent(!isStudent);
      handleInputChange({ target: { value: "" } }, "invitedBy");
    };

    return (
      <div className="space-y-4">
        <button
          className={`bg-${config.color} text-white font-semibold py-3 px-6 rounded-lg mt-4 w-full flex items-center justify-center transition duration-300 ease-in-out`}
          onClick={handleToggle}
        >
          {isStudent ? "Switch to Teacher" : "Switch to Student"}
        </button>
        {isStudent ? (
          <input
            type="text"
            value={invitedBy}
            onChange={(e) => handleInputChange(e, "invitedBy")}
            placeholder="Invited by Student"
            className={`border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-${config.color}`}
          />
        ) : (
          <TeacherCombobox
            invitedBy={invitedBy}
            handleInputChange={handleInputChange}
            config={config}
          />
        )}
      </div>
    );
  }

  export default InvitedByField;