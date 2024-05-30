// InvitedByField.js
import React, { useState, useEffect, Fragment } from "react";
import { Combobox, Transition } from "@headlessui/react";
import TeacherCombobox from "./TeacherCombobox";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase.js"; // Import your Firebase config

function InvitedByField({ invitedBy, handleInputChange, config, clearInvitedBy }) {
  const [isStudent, setIsStudent] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [entries, setEntries] = useState([]);
  const [selectedName, setSelectedName] = useState(invitedBy);
  const [query, setQuery] = useState("");

  const handleToggle = () => {
    setIsStudent(!isStudent);
    handleInputChange({ target: { value: "" } }, "invitedBy");
  };

  const documentPaths = ["primary", "middlers", "juniors", "youth"];

  const getCurrentDayLetter = () => {
    const days = ["A", "B", "C", "D", "E"];
    const dayIndex = new Date().getDay();
    return days[dayIndex === 0 ? 6 : dayIndex - 1];
  };

  const handleDocumentChange = async (documentPath) => {
    setSelectedDocument(documentPath);
    const docRef = doc(db, "dvbs", documentPath);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const extractedEntries = Object.keys(data)
          .filter(key => key.endsWith("name"))
          .map(key => ({ id: key.substring(0, 2), name: data[key] }))
          .filter(entry => entry.name);
        setEntries(extractedEntries);
        console.log("Fetched entries:", extractedEntries);  // Log the entries
      } else {
        console.log("No such document!");
        setEntries([]);
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      setEntries([]);
    }
  };

  const filteredEntries =
    query === ""
      ? entries
      : entries.filter((entry) =>
          entry.name.toLowerCase().includes(query.toLowerCase()) ||
          entry.id.includes(query)
        );

  const handleSelectionChange = (selected) => {
    const selectedEntry = entries.find(entry => entry.name === selected);
    if (selectedEntry) {
      const documentInitial = selectedDocument.charAt(0).toUpperCase();
      const formattedValue = `${documentInitial}${selectedEntry.id}-${selectedEntry.name}`;
      setSelectedName(formattedValue);
      handleInputChange({ target: { value: formattedValue } }, "invitedBy");
    }
  };

  const updateInviterPoints = async () => {
    const dayLetter = getCurrentDayLetter();
    const inviterDocumentPath = invitedBy.split("-")[0];
    const inviterDocRef = doc(db, "dvbs", inviterDocumentPath);

    try {
      const inviterDocSnap = await getDoc(inviterDocRef);
      if (inviterDocSnap.exists()) {
        const inviterData = inviterDocSnap.data();
        const inviterId = invitedBy.split("-")[0].slice(1); // Extract inviter ID
        const pointsField = `${inviterId}${dayLetter}points`;
        const currentPoints = inviterData[pointsField] || 0;
        const updatedPoints = currentPoints + 5;

        await updateDoc(inviterDocRef, {
          [pointsField]: updatedPoints
        });
        console.log(`Updated ${pointsField} to ${updatedPoints}`);
      } else {
        console.log("No such document for the inviter!");
      }
    } catch (error) {
      console.error("Error updating inviter points:", error);
    }
  };

  const handleAddButtonClick = () => {
    clearInvitedBy();
    updateInviterPoints();
  };

  useEffect(() => {
    if (invitedBy === "") {
      setSelectedName("");
    }
  }, [invitedBy]);

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <button
          className={`bg-[${config.color}] text-white font-semibold py-3 px-6 rounded-lg w-full flex items-center justify-center transition duration-300 ease-in-out`}
          onClick={handleToggle}
        >
          {isStudent ? "Switch to Teacher" : "Switch to Student"}
        </button>
        <button
          className="bg-green-500 text-white font-semibold py-3 px-6 rounded-lg w-full flex items-center justify-center transition duration-300 ease-in-out"
          onClick={handleAddButtonClick}
        >
          Add
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
        <Combobox value={selectedName} onChange={handleSelectionChange}>
          <div className="relative mt-1">
            <Combobox.Input
              className={`border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-${config.color}`}
              onChange={(event) => setQuery(event.target.value)}
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
                {filteredEntries.length === 0 && query !== "" ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                    Nothing found.
                  </div>
                ) : (
                  filteredEntries.map((entry) => (
                    <Combobox.Option
                      key={entry.id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? "bg-blue-600 text-white" : "text-gray-900"
                        }`
                      }
                      value={entry.name}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}
                          >
                            {entry.id} - {entry.name}
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



// // InvitedByField.js
// import React, { useState, Fragment } from "react";
// import { Combobox, Transition } from "@headlessui/react";
// import TeacherCombobox from "./TeacherCombobox";
// import { getDoc, doc } from "firebase/firestore";
// import { db } from "./firebase.js"; // Import your Firebase config

// function InvitedByField({ invitedBy, handleInputChange, config }) {
//   const [isStudent, setIsStudent] = useState(true);
//   const [selectedDocument, setSelectedDocument] = useState("");
//   const [entries, setEntries] = useState([]);
//   const [selectedName, setSelectedName] = useState(invitedBy);
//   const [query, setQuery] = useState("");

//   const handleToggle = () => {
//     setIsStudent(!isStudent);
//     handleInputChange({ target: { value: "" } }, "invitedBy");
//   };

//   const documentPaths = ["primary", "middlers", "juniors", "youth"];


//   const getCurrentDayLetter = () => {
//     const days = ["A", "B", "C", "D", "E"];
//     const dayIndex = new Date().getDay();
//     return days[dayIndex === 0 ? 6 : dayIndex - 1];
//   };


//   const handleDocumentChange = async (documentPath) => {
//     setSelectedDocument(documentPath);
//     const docRef = doc(db, "dvbs", documentPath);
//     try {
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         const data = docSnap.data();
//         const extractedEntries = Object.keys(data)
//           .filter(key => key.endsWith("name"))
//           .map(key => ({ id: key.substring(0, 2), name: data[key] }))
//           .filter(entry => entry.name);
//         setEntries(extractedEntries);
//         console.log("Fetched entries:", extractedEntries);  // Log the entries
//       } else {
//         console.log("No such document!");
//         setEntries([]);
//       }
//     } catch (error) {
//       console.error("Error fetching document:", error);
//       setEntries([]);
//     }
//   };

//   const filteredEntries =
//     query === ""
//       ? entries
//       : entries.filter((entry) =>
//           entry.name.toLowerCase().includes(query.toLowerCase()) ||
//           entry.id.includes(query)
//         );

//   const handleSelectionChange = (selected) => {
//     const selectedEntry = entries.find(entry => entry.name === selected);
//     if (selectedEntry) {
//       const documentInitial = selectedDocument.charAt(0).toUpperCase();
//       const formattedValue = `${documentInitial}${selectedEntry.id}-${selectedEntry.name}`;
//       setSelectedName(formattedValue);
//       handleInputChange({ target: { value: formattedValue } }, "invitedBy");
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex space-x-4">
//         <button
//           className={`bg-[${config.color}] text-white font-semibold py-3 px-6 rounded-lg w-full flex items-center justify-center transition duration-300 ease-in-out`}
//           onClick={handleToggle}
//         >
//           {isStudent ? "Switch to Teacher" : "Switch to Student"}
//         </button>
//       </div>
//       <div className="grid grid-cols-2 gap-4">
//         {documentPaths.map((documentPath) => (
//           <button
//             key={documentPath}
//             className={`bg-[${
//               selectedDocument === documentPath ? config.color : "#61677A"
//             }] text-white font-semibold py-3 px-6 rounded-lg w-full flex items-center justify-center transition duration-300 ease-in-out`}
//             onClick={() => handleDocumentChange(documentPath)}
//           >
//             {documentPath.charAt(0).toUpperCase() + documentPath.slice(1)}
//           </button>
//         ))}
//       </div>
//       {!isStudent ? (
//         <TeacherCombobox
//           invitedBy={invitedBy}
//           handleInputChange={handleInputChange}
//           config={config}
//         />
//       ) : (
//         <Combobox value={selectedName} onChange={handleSelectionChange}>
//           <div className="relative mt-1">
//             <Combobox.Input
//               className={`border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-${config.color}`}
//               onChange={(event) => setQuery(event.target.value)}
//               displayValue={(name) => name}
//             />
//             <Transition
//               as={Fragment}
//               leave="transition ease-in duration-100"
//               leaveFrom="opacity-100"
//               leaveTo="opacity-0"
//               afterLeave={() => setQuery("")}
//             >
//               <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
//                 {filteredEntries.length === 0 && query !== "" ? (
//                   <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
//                     Nothing found.
//                   </div>
//                 ) : (
//                   filteredEntries.map((entry) => (
//                     <Combobox.Option
//                       key={entry.id}
//                       className={({ active }) =>
//                         `relative cursor-default select-none py-2 pl-10 pr-4 ${
//                           active ? "bg-blue-600 text-white" : "text-gray-900"
//                         }`
//                       }
//                       value={entry.name}
//                     >
//                       {({ selected, active }) => (
//                         <>
//                           <span
//                             className={`block truncate ${
//                               selected ? "font-medium" : "font-normal"
//                             }`}
//                           >
//                             {entry.id} - {entry.name}
//                           </span>
//                           {selected ? (
//                             <span
//                               className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
//                                 active ? "text-white" : "text-blue-600"
//                               }`}
//                             >
//                             </span>
//                           ) : null}
//                         </>
//                       )}
//                     </Combobox.Option>
//                   ))
//                 )}
//               </Combobox.Options>
//             </Transition>
//           </div>
//         </Combobox>
//       )}
//     </div>
//   );
// }

// export default InvitedByField;
