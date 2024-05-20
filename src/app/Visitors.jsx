import React, { useState, useEffect, Fragment } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import { Menu, Transition } from "@headlessui/react";

function Visitors({ config, currentConfigIndex, setCurrentConfigIndex }) {
  const [newVisitorName, setNewVisitorName] = useState("");
  const [newVisitorAddress, setNewVisitorAddress] = useState("");
  const [invitedBy, setInvitedBy] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [age, setAge] = useState("");
  const [primaryData, setPrimaryData] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  const predefinedRoutes = ["Route 1", "Route 2", "Route 3", "Route 4"];

  useEffect(() => {
    const fetchPrimary = async () => {
      const docRef = doc(
        db,
        config.dbPath.split("/")[0],
        config.dbPath.split("/")[1]
      );
      const primarySnapshot = await getDoc(docRef);
      if (primarySnapshot.exists()) {
        setPrimaryData(primarySnapshot.data());
      } else {
        console.error("No such document!");
      }
    };

    fetchPrimary();
  }, [config.dbPath]);

  const getCurrentDayLetter = () => {
    const days = ["A", "B", "C", "D", "E", "F", "G"];
    const dayIndex = new Date().getDay();
    return days[dayIndex === 0 ? 6 : dayIndex - 1];
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

  const handleRouteSelect = (route) => {
    setNewVisitorAddress(route);
  };

  const addVisitor = async () => {
    if (
      newVisitorName.trim() === "" ||
      newVisitorAddress.trim() === "" ||
      invitedBy.trim() === "" ||
      age === ""
    ) {
      console.error("Please fill in all required fields.");
      setShowPopup(true);
      return;
    }

    try {
      const docRef = doc(
        db,
        config.dbPath.split("/")[0],
        config.dbPath.split("/")[1]
      );

      const existingIndexes = Object.keys(primaryData)
        .filter((key) => key.match(/^\d+/))
        .map((key) => parseInt(key.match(/^\d+/)[0]));
      const newIndex = existingIndexes.length
        ? Math.max(...existingIndexes) + 1
        : 1;

      const paddedIndex = String(newIndex).padStart(2, "0");

      const newFields = {
        [`${paddedIndex}name`]: newVisitorName,
        [`${paddedIndex}loc`]: newVisitorAddress,
        [`${paddedIndex}invitedBy`]: invitedBy,
        [`${paddedIndex}contactNumber`]: contactNumber,
        [`${paddedIndex}age`]: age,
        [`${paddedIndex}Aout`]: "",
        [`${paddedIndex}Bout`]: "",
        [`${paddedIndex}Cout`]: "",
        [`${paddedIndex}Dout`]: "",
        [`${paddedIndex}Eout`]: "",
      };

      const currentDayLetter = getCurrentDayLetter();
      const currentTime = new Date().toLocaleString();
      ["A", "B", "C", "D", "E"].forEach((letter) => {
        newFields[`${paddedIndex}${letter}`] =
          letter === currentDayLetter ? currentTime : "";
      });

      await updateDoc(docRef, newFields);

      setNewVisitorName("");
      setNewVisitorAddress("");
      setInvitedBy("");
      setContactNumber("");
      setAge("");
      console.log("Visitor added successfully!");

      setPrimaryData((prevData) => ({
        ...prevData,
        ...newFields,
      }));
    } catch (error) {
      console.error("Error adding visitor: ", error);
    }
  };

  const ageOptions = [
    config.ageRange[0],
    config.ageRange[1],
    config.ageRange[2],
  ];

  return (
    <div className="flex flex-col items-center pb-5">
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50" />
          <div className="bg-white rounded-lg p-5 shadow-md z-10 flex flex-col items-center">
            <p className="mb-2">Please fill in all required fields.</p>
            <button
              className={`bg-[${config.color}] hover:bg-[${config.color}] text-white font-bold py-2 px-4 rounded`}
              onClick={() => setShowPopup(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      <div className="w-full bg-white shadow-md rounded-lg border overflow-hidden mx-auto ">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Add New Visitor
          </h2>
          <div className="space-y-6">
            <input
              type="text"
              value={newVisitorName}
              onChange={(e) => handleInputChange(e, "name")}
              placeholder="Visitor's Name"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-[${config.color}]"
            />

            <div className="flex items-center space-x-4">
              <Menu
                as="div"
                className="relative inline-block text-left w-full z-40">
                <div>
                  <Menu.Button className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    {age ? `Age: ${age}` : "Select Age"}
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95">
                  <Menu.Items
                    className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {ageOptions.map((ageOption) => (
                        <Menu.Item key={ageOption}>
                          {({ active }) => (
                            <button
                              onClick={() => handleAgeSelect(ageOption)}
                              className={`${
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700"
                              } block w-full text-left px-4 py-2 text-sm`}>
                              {ageOption}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>

            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={newVisitorAddress}
                onChange={(e) => handleInputChange(e, "loc")}
                placeholder="Address or Select Route"
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-[${config.color}]"
              />
              <Menu as="div" className="relative inline-block text-left w-1/2">
                <div>
                  <Menu.Button className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    {"Select Route"}
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95">
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {predefinedRoutes.map((route) => (
                        <Menu.Item key={route}>
                          {({ active }) => (
                            <button
                              onClick={() => handleRouteSelect(route)}
                              className={`${
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700"
                              } block w-full text-left px-4 py-2 text-sm`}>
                              {route}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>

            <input
              type="text"
              value={invitedBy}
              onChange={(e) => handleInputChange(e, "invitedBy")}
              placeholder="Invited by"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-[${config.color}]"
            />
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => handleInputChange(e, "contactNumber")}
              placeholder="Contact Number"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-[${config.color}]"
            />
            <button
              className={`bg-[${config.color}] text-white font-semibold py-3 px-6 rounded-lg mt-4 w-full flex items-center justify-center transition duration-300 ease-in-out`}
              onClick={addVisitor}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
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
