import React, { useState } from "react";
import { Combobox, Transition } from "@headlessui/react";

const predefinedTeachers = ["Renz", "Vince", "Aljon", "Lance"];

function InvitedByField({ invitedBy, handleInputChange, config }) {
  const [isStudent, setIsStudent] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [query, setQuery] = useState("");

  const handleToggle = () => {
    setIsStudent(!isStudent);
    handleInputChange({ target: { value: "" } }, "invitedBy");
  };

  const filteredTeachers =
    query === ""
      ? predefinedTeachers
      : predefinedTeachers.filter((teacher) =>
          teacher.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <button
          className={`bg-${config.color} text-black font-semibold py-2 px-4 rounded-lg`}
          onClick={handleToggle}
        >
          {isStudent ? "Switch to Teacher" : "Switch to Student"}
        </button>
      </div>
      {isStudent ? (
        <input
          type="text"
          value={invitedBy}
          onChange={(e) => handleInputChange(e, "invitedBy")}
          placeholder="Invited by Student"
          className={`border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-${config.color}`}
        />
      ) : (
        <Combobox value={selectedTeacher} onChange={setSelectedTeacher}>
          <div className="relative">
            <Combobox.Input
              className={`border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-${config.color}`}
              onChange={(event) => {
                setQuery(event.target.value);
                handleInputChange(event, "invitedBy");
              }}
              displayValue={(teacher) => teacher}
              placeholder="Select a Teacher"
            />
            <Transition
              as={React.Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filteredTeachers.map((teacher) => (
                  <Combobox.Option
                    key={teacher}
                    className={({ active }) =>
                      `cursor-pointer select-none relative py-2 pl-10 pr-4 ${
                        active ? "text-white bg-indigo-600" : "text-gray-900"
                      }`
                    }
                    value={teacher}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {teacher}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-indigo-600"
                            }`}
                          >
                            <svg
                              className="w-5 h-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>
      )}
    </div>
  );
}

export default InvitedByField;
